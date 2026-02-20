"""
FastAPI Backend for Network Intrusion Detection System (NIDS)
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import pandas as pd
import joblib
import uvicorn
import os
import logging
from datetime import datetime
import asyncio
from pathlib import Path
from nfstream import NFStreamer
import tempfile
import subprocess
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==============================
# FASTAPI APP
# ==============================
app = FastAPI(
    title="Network Intrusion Detection System API",
    description="API for detecting network intrusions using ML models",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# CONFIGURATION
# ==============================
MODEL_PATH = "model/nids_xgb_multiclass.pkl"
ENCODER_PATH = "model/attack_label_encoder.pkl"
UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# ==============================
# GLOBAL MODEL VARIABLES
# ==============================
model = None
label_encoder = None
expected_features = None

# Feature mapping from NFStream to model features
FEATURE_MAP = {
    "FLOW_START_MILLISECONDS": "bidirectional_first_seen_ms",
    "FLOW_END_MILLISECONDS": "bidirectional_last_seen_ms",
    "FLOW_DURATION_MILLISECONDS": "bidirectional_duration_ms",
    "L4_SRC_PORT": "src_port",
    "L4_DST_PORT": "dst_port",
    "PROTOCOL": "protocol",
    "IN_PKTS": "src2dst_packets",
    "OUT_PKTS": "dst2src_packets",
    "IN_BYTES": "src2dst_bytes",
    "OUT_BYTES": "dst2src_bytes",
    "SRC_TO_DST_IAT_MIN": "src2dst_min_piat_ms",
    "SRC_TO_DST_IAT_MAX": "src2dst_max_piat_ms",
    "SRC_TO_DST_IAT_AVG": "src2dst_mean_piat_ms",
    "SRC_TO_DST_IAT_STDDEV": "src2dst_stddev_piat_ms",
    "DST_TO_SRC_IAT_MIN": "dst2src_min_piat_ms",
    "DST_TO_SRC_IAT_MAX": "dst2src_max_piat_ms",
    "DST_TO_SRC_IAT_AVG": "dst2src_mean_piat_ms",
    "DST_TO_SRC_IAT_STDDEV": "dst2src_stddev_piat_ms"
}

# ==============================
# PYDANTIC MODELS
# ==============================
class FlowFeatures(BaseModel):
    """Single network flow features"""
    bidirectional_first_seen_ms: float = 0
    bidirectional_last_seen_ms: float = 0
    bidirectional_duration_ms: float = 0
    src_port: int = 0
    dst_port: int = 0
    protocol: int = 0
    src2dst_packets: int = 0
    dst2src_packets: int = 0
    src2dst_bytes: int = 0
    dst2src_bytes: int = 0
    src2dst_min_piat_ms: float = 0
    src2dst_max_piat_ms: float = 0
    src2dst_mean_piat_ms: float = 0
    src2dst_stddev_piat_ms: float = 0
    dst2src_min_piat_ms: float = 0
    dst2src_max_piat_ms: float = 0
    dst2src_mean_piat_ms: float = 0
    dst2src_stddev_piat_ms: float = 0


class PredictionRequest(BaseModel):
    """Request for prediction on flow features"""
    flows: List[FlowFeatures]


class PredictionResponse(BaseModel):
    """Response with predictions"""
    predictions: List[Dict[str, str]]
    total_flows: int
    timestamp: str


class ModelInfo(BaseModel):
    """Model information"""
    model_loaded: bool
    model_path: str
    encoder_path: str
    expected_features: Optional[List[str]]
    feature_count: Optional[int]


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    model_loaded: bool


# ==============================
# HELPER FUNCTIONS
# ==============================
def load_model_and_encoder():
    """Load ML model and label encoder"""
    global model, label_encoder, expected_features
    
    try:
        logger.info("Loading model and label encoder...")
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        expected_features = model.get_booster().feature_names
        logger.info(f"Model loaded successfully. Expected features: {len(expected_features)}")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False


def prepare_dataframe_for_inference(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare dataframe for inference by mapping NFStream columns to model features
    
    Args:
        df_raw: Raw dataframe with NFStream columns
        
    Returns:
        DataFrame ready for model inference
    """
    df_ml = pd.DataFrame()
    
    for feature in expected_features:
        if feature in FEATURE_MAP:
            src_col = FEATURE_MAP[feature]
            if src_col in df_raw.columns:
                df_ml[feature] = df_raw[src_col]
            else:
                df_ml[feature] = 0
        else:
            df_ml[feature] = 0
    
    # Replace NaN and infinities
    df_ml = df_ml.fillna(0)
    df_ml.replace([float("inf"), float("-inf")], 0, inplace=True)
    
    return df_ml


def run_inference(df_ml: pd.DataFrame) -> List[str]:
    """
    Run inference on prepared dataframe
    
    Args:
        df_ml: Dataframe with model features
        
    Returns:
        List of predicted attack labels
    """
    y_pred = model.predict(df_ml)
    attack_labels = label_encoder.inverse_transform(y_pred)
    return attack_labels.tolist()


# ==============================
# STARTUP EVENT
# ==============================
@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    logger.info("Starting NIDS API...")
    success = load_model_and_encoder()
    if not success:
        logger.warning("Failed to load model on startup. Some endpoints may not work.")


# ==============================
# API ENDPOINTS
# ==============================
@app.get("/", tags=["General"])
async def root():
    """Root endpoint"""
    return {
        "message": "Network Intrusion Detection System API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if model is not None else "model_not_loaded",
        timestamp=datetime.now().isoformat(),
        model_loaded=model is not None
    )


@app.get("/model/info", response_model=ModelInfo, tags=["Model"])
async def get_model_info():
    """Get model information"""
    return ModelInfo(
        model_loaded=model is not None,
        model_path=MODEL_PATH,
        encoder_path=ENCODER_PATH,
        expected_features=expected_features if expected_features else None,
        feature_count=len(expected_features) if expected_features else None
    )


@app.post("/model/reload", tags=["Model"])
async def reload_model():
    """Reload the ML model"""
    success = load_model_and_encoder()
    if success:
        return {"status": "success", "message": "Model reloaded successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to reload model")


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_flows(request: PredictionRequest):
    """
    Predict attack types for network flows
    
    - **flows**: List of network flow features
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Convert flows to dataframe
        flows_data = [flow.dict() for flow in request.flows]
        df_raw = pd.DataFrame(flows_data)
        
        # Prepare for inference
        df_ml = prepare_dataframe_for_inference(df_raw)
        
        # Run inference
        predictions = run_inference(df_ml)
        
        # Prepare response
        results = []
        for i, pred in enumerate(predictions):
            results.append({
                "flow_id": str(i),
                "predicted_attack": pred,
                "is_attack": str(pred.lower() != "benign")
            })
        
        return PredictionResponse(
            predictions=results,
            total_flows=len(predictions),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/csv", tags=["Prediction"])
async def predict_from_csv(file: UploadFile = File(...)):
    """
    Upload CSV file with flow features and get predictions
    
    - **file**: CSV file containing network flow features
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        # Save uploaded file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        input_path = os.path.join(UPLOAD_DIR, f"input_{timestamp}.csv")
        output_path = os.path.join(RESULTS_DIR, f"predictions_{timestamp}.csv")
        
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Load and process
        df_raw = pd.read_csv(input_path)
        df_result = df_raw.copy()
        
        # Prepare for inference
        df_ml = prepare_dataframe_for_inference(df_raw)
        
        # Run inference
        predictions = run_inference(df_ml)
        
        # Add predictions to result
        df_result["Predicted_Attack"] = predictions
        df_result["Is_Attack"] = [pred.lower() != "benign" for pred in predictions]
        
        # Save results
        df_result.to_csv(output_path, index=False)
        
        # Prepare summary
        attack_counts = df_result["Predicted_Attack"].value_counts().to_dict()
        
        return {
            "status": "success",
            "total_flows": len(predictions),
            "attack_counts": attack_counts,
            "output_file": output_path,
            "download_url": f"/download/{os.path.basename(output_path)}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"CSV prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV prediction failed: {str(e)}")


@app.get("/download/{filename}", tags=["Files"])
async def download_results(filename: str):
    """
    Download prediction results file
    
    - **filename**: Name of the file to download
    """
    file_path = os.path.join(RESULTS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/csv"
    )


@app.get("/results", tags=["Files"])
async def list_results():
    """List all available result files"""
    try:
        files = []
        for filename in os.listdir(RESULTS_DIR):
            if filename.endswith('.csv'):
                file_path = os.path.join(RESULTS_DIR, filename)
                file_stat = os.stat(file_path)
                files.append({
                    "filename": filename,
                    "size_bytes": file_stat.st_size,
                    "created": datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                    "download_url": f"/download/{filename}"
                })
        
        return {
            "total_files": len(files),
            "files": files
        }
    except Exception as e:
        logger.error(f"Error listing results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list results: {str(e)}")


@app.get("/labels", tags=["Model"])
async def get_attack_labels():
    """Get all possible attack labels from the model"""
    if label_encoder is None:
        raise HTTPException(status_code=503, detail="Label encoder not loaded")
    
    try:
        labels = label_encoder.classes_.tolist()
        return {
            "total_labels": len(labels),
            "labels": labels
        }
    except Exception as e:
        logger.error(f"Error getting labels: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get labels: {str(e)}")


@app.get("/stats", tags=["Statistics"])
async def get_statistics():
    """Get API usage statistics"""
    try:
        # Count files in directories
        upload_count = len([f for f in os.listdir(UPLOAD_DIR) if f.endswith('.csv')])
        result_count = len([f for f in os.listdir(RESULTS_DIR) if f.endswith('.csv')])
        
        return {
            "model_loaded": model is not None,
            "total_uploads": upload_count,
            "total_results": result_count,
            "expected_features_count": len(expected_features) if expected_features else 0,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")


@app.post("/scan/live", tags=["Live Capture"])
async def live_network_scan(duration: int = 60):
    """
    Capture live network traffic and analyze for intrusions
    
    - **duration**: Duration of capture in seconds (default: 60)
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"Starting live network capture for {duration} seconds...")
        
        # Create temporary PCAP file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_pcap = os.path.join(UPLOAD_DIR, f"live_capture_{timestamp}.pcap")
        output_csv = os.path.join(RESULTS_DIR, f"live_predictions_{timestamp}.csv")
        
        # Capture live traffic using Scapy
        from nids.packet_capture import PacketCapture
        
        try:
            # Initialize packet capture
            capture = PacketCapture()
            packets = []
            
            def packet_callback(packet):
                packets.append(packet)
            
            logger.info(f"Starting Scapy capture for {duration} seconds...")
            capture.start_capture(packet_callback=packet_callback)
            
            # Wait for specified duration
            import time
            time.sleep(duration)
            
            # Stop capture
            capture.stop_capture()
            logger.info(f"Captured {len(packets)} packets")
            
            # Save packets to PCAP file for processing
            if packets:
                from scapy.all import wrpcap
                wrpcap(temp_pcap, packets)
                logger.info(f"Saved packets to {temp_pcap}")
            else:
                # Use existing traffic.pcap as fallback for testing
                if os.path.exists("traffic.pcap"):
                    temp_pcap = "traffic.pcap"
                    logger.info("No packets captured, using existing traffic.pcap for analysis")
                else:
                    raise HTTPException(
                        status_code=500,
                        detail="No packets captured and no fallback traffic data available."
                    )
                
        except Exception as e:
            logger.error(f"Scapy capture failed: {str(e)}")
            # Use existing traffic.pcap as fallback for testing
            if os.path.exists("traffic.pcap"):
                temp_pcap = "traffic.pcap"
                logger.info("Using existing traffic.pcap for analysis")
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Packet capture failed: {str(e)}"
                )
        
        # Process PCAP with NFStream
        logger.info(f"Processing PCAP file: {temp_pcap}")
        streamer = NFStreamer(source=temp_pcap)
        
        flows = []
        for flow in streamer:
            flow_dict = {}
            for k in flow.__slots__:
                if hasattr(flow, k):
                    flow_dict[k] = getattr(flow, k)
            flows.append(flow_dict)
        
        if not flows:
            raise HTTPException(
                status_code=400,
                detail="No network flows captured. Check your network interface."
            )
        
        logger.info(f"Extracted {len(flows)} flows")
        
        # Convert to dataframe
        df_raw = pd.DataFrame(flows)
        
        # Prepare for inference
        df_ml = prepare_dataframe_for_inference(df_raw)
        
        # Run inference
        predictions = run_inference(df_ml)
        
        # Prepare results
        df_result = pd.DataFrame()
        df_result['src_ip'] = df_raw.get('src_ip', ['Unknown'] * len(flows))
        df_result['dst_ip'] = df_raw.get('dst_ip', ['Unknown'] * len(flows))
        df_result['src_port'] = df_raw.get('src_port', [0] * len(flows))
        df_result['dst_port'] = df_raw.get('dst_port', [0] * len(flows))
        df_result['protocol'] = df_raw.get('protocol', [0] * len(flows))
        df_result['src2dst_packets'] = df_raw.get('src2dst_packets', [0] * len(flows))
        df_result['dst2src_packets'] = df_raw.get('dst2src_packets', [0] * len(flows))
        df_result['Predicted_Attack'] = predictions
        df_result['Is_Attack'] = [pred.lower() != "benign" for pred in predictions]
        
        # Save results
        df_result.to_csv(output_csv, index=False)
        
        # Calculate statistics
        attack_counts = {}
        for pred in predictions:
            attack_counts[pred] = attack_counts.get(pred, 0) + 1
        
        # Identify threats
        threats = []
        warnings = []
        safe_count = attack_counts.get('Benign', 0)
        
        for i, pred in enumerate(predictions):
            if pred.lower() != 'benign':
                severity = 'high' if pred in ['DDoS', 'DoS', 'Exploits'] else 'medium'
                alert = {
                    'type': pred,
                    'severity': severity,
                    'src_ip': str(df_result.iloc[i]['src_ip']),
                    'dst_ip': str(df_result.iloc[i]['dst_ip']),
                    'protocol': int(df_result.iloc[i]['protocol']),
                    'timestamp': datetime.now().isoformat()
                }
                
                if severity == 'high':
                    threats.append(alert)
                else:
                    warnings.append(alert)
        
        # Prepare response
        response = {
            'status': 'success',
            'duration': duration,
            'total_flows': len(predictions),
            'attack_counts': attack_counts,
            'statistics': {
                'safe': safe_count,
                'warnings': len(warnings),
                'threats': len(threats)
            },
            'threats': threats[:10],  # Top 10 threats
            'warnings': warnings[:10],  # Top 10 warnings
            'output_file': output_csv,
            'download_url': f"/download/{os.path.basename(output_csv)}",
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Scan completed: {len(flows)} flows analyzed")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Live scan error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Live scan failed: {str(e)}")


# ==============================
# RUN SERVER
# ==============================
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
