"""
Simple FastAPI Client for NIDS
Example usage of the NIDS API from Python
"""

import requests
import json
import pandas as pd
from typing import List, Dict, Optional


class NIDSClient:
    """Client for interacting with NIDS FastAPI backend"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        Initialize NIDS Client
        
        Args:
            base_url: Base URL of the NIDS API
        """
        self.base_url = base_url.rstrip('/')
        
    def health_check(self) -> Dict:
        """Check API health status"""
        response = requests.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        response = requests.get(f"{self.base_url}/model/info")
        response.raise_for_status()
        return response.json()
    
    def get_labels(self) -> List[str]:
        """Get all possible attack labels"""
        response = requests.get(f"{self.base_url}/labels")
        response.raise_for_status()
        return response.json()["labels"]
    
    def predict(self, flows: List[Dict]) -> Dict:
        """
        Predict attack types for network flows
        
        Args:
            flows: List of flow feature dictionaries
            
        Returns:
            Dictionary with predictions
        """
        payload = {"flows": flows}
        response = requests.post(f"{self.base_url}/predict", json=payload)
        response.raise_for_status()
        return response.json()
    
    def predict_from_csv(self, csv_path: str) -> Dict:
        """
        Upload CSV file and get predictions
        
        Args:
            csv_path: Path to CSV file with flow features
            
        Returns:
            Dictionary with prediction results
        """
        with open(csv_path, 'rb') as f:
            files = {'file': (csv_path, f, 'text/csv')}
            response = requests.post(f"{self.base_url}/predict/csv", files=files)
        response.raise_for_status()
        return response.json()
    
    def download_results(self, filename: str, save_path: str):
        """
        Download prediction results file
        
        Args:
            filename: Name of the file to download
            save_path: Local path to save the file
        """
        response = requests.get(f"{self.base_url}/download/{filename}")
        response.raise_for_status()
        with open(save_path, 'wb') as f:
            f.write(response.content)
    
    def list_results(self) -> List[Dict]:
        """List all available result files"""
        response = requests.get(f"{self.base_url}/results")
        response.raise_for_status()
        return response.json()["files"]
    
    def get_stats(self) -> Dict:
        """Get API statistics"""
        response = requests.get(f"{self.base_url}/stats")
        response.raise_for_status()
        return response.json()
    
    def reload_model(self) -> Dict:
        """Reload the ML model"""
        response = requests.post(f"{self.base_url}/model/reload")
        response.raise_for_status()
        return response.json()


def example_single_prediction():
    """Example: Predict for a single flow"""
    print("=== Single Flow Prediction Example ===")
    
    client = NIDSClient()
    
    # Check if API is healthy
    health = client.health_check()
    print(f"API Status: {health['status']}")
    
    # Sample flow data
    flow = {
        "bidirectional_first_seen_ms": 1609459200000,
        "bidirectional_last_seen_ms": 1609459201000,
        "bidirectional_duration_ms": 1000,
        "src_port": 443,
        "dst_port": 12345,
        "protocol": 6,
        "src2dst_packets": 10,
        "dst2src_packets": 8,
        "src2dst_bytes": 5000,
        "dst2src_bytes": 3000,
        "src2dst_min_piat_ms": 10,
        "src2dst_max_piat_ms": 100,
        "src2dst_mean_piat_ms": 50,
        "src2dst_stddev_piat_ms": 20,
        "dst2src_min_piat_ms": 15,
        "dst2src_max_piat_ms": 90,
        "dst2src_mean_piat_ms": 45,
        "dst2src_stddev_piat_ms": 18
    }
    
    # Predict
    result = client.predict([flow])
    print(f"\nPrediction: {json.dumps(result, indent=2)}")


def example_csv_prediction():
    """Example: Predict from CSV file"""
    print("\n=== CSV File Prediction Example ===")
    
    client = NIDSClient()
    
    csv_path = "flow_features.csv"
    
    try:
        # Upload and predict
        result = client.predict_from_csv(csv_path)
        print(f"\nResults: {json.dumps(result, indent=2)}")
        
        # List results
        files = client.list_results()
        print(f"\nAvailable result files: {len(files)}")
        
        if files:
            latest_file = files[0]
            print(f"Latest file: {latest_file['filename']}")
            
            # Download the result
            client.download_results(
                latest_file['filename'],
                f"downloaded_{latest_file['filename']}"
            )
            print(f"Downloaded: downloaded_{latest_file['filename']}")
    
    except FileNotFoundError:
        print(f"❌ CSV file not found: {csv_path}")


def example_get_info():
    """Example: Get model and API information"""
    print("\n=== Model Information Example ===")
    
    client = NIDSClient()
    
    # Get model info
    model_info = client.get_model_info()
    print(f"Model loaded: {model_info['model_loaded']}")
    print(f"Feature count: {model_info['feature_count']}")
    
    # Get attack labels
    labels = client.get_labels()
    print(f"\nAvailable attack labels ({len(labels)}):")
    for label in labels:
        print(f"  - {label}")
    
    # Get statistics
    stats = client.get_stats()
    print(f"\nAPI Statistics:")
    print(f"  Total uploads: {stats['total_uploads']}")
    print(f"  Total results: {stats['total_results']}")


def example_batch_prediction():
    """Example: Predict for multiple flows"""
    print("\n=== Batch Prediction Example ===")
    
    client = NIDSClient()
    
    # Create multiple flows
    flows = []
    for i in range(5):
        flow = {
            "bidirectional_first_seen_ms": 1609459200000 + i * 1000,
            "bidirectional_last_seen_ms": 1609459201000 + i * 1000,
            "bidirectional_duration_ms": 1000,
            "src_port": 443 + i,
            "dst_port": 12345 + i,
            "protocol": 6,
            "src2dst_packets": 10 + i,
            "dst2src_packets": 8 + i,
            "src2dst_bytes": 5000 + i * 100,
            "dst2src_bytes": 3000 + i * 100,
            "src2dst_min_piat_ms": 10,
            "src2dst_max_piat_ms": 100,
            "src2dst_mean_piat_ms": 50,
            "src2dst_stddev_piat_ms": 20,
            "dst2src_min_piat_ms": 15,
            "dst2src_max_piat_ms": 90,
            "dst2src_mean_piat_ms": 45,
            "dst2src_stddev_piat_ms": 18
        }
        flows.append(flow)
    
    # Predict all at once
    result = client.predict(flows)
    print(f"Total flows predicted: {result['total_flows']}")
    
    # Show predictions
    for pred in result['predictions']:
        print(f"Flow {pred['flow_id']}: {pred['predicted_attack']} "
              f"(Attack: {pred['is_attack']})")


def main():
    """Run all examples"""
    print("=" * 60)
    print("NIDS API Client Examples")
    print("=" * 60)
    
    try:
        example_get_info()
        example_single_prediction()
        example_batch_prediction()
        example_csv_prediction()
        
        print("\n" + "=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Make sure the API server is running")
        print("Start the server with: python main.py")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
