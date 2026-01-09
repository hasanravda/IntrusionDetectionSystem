import pandas as pd
import joblib

# ==============================
# CONFIG
# ==============================
FLOW_CSV = "flow_features.csv"
MODEL_PATH = "model/nids_xgb_multiclass.pkl"
ENCODER_PATH = "model/attack_label_encoder.pkl"
OUTPUT_CSV = "flow_predictions.csv"

# ==============================
# LOAD MODEL & ENCODER
# ==============================
print("[*] Loading model and label encoder...")
model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)

expected_features = model.get_booster().feature_names
print("[*] Model expects features:", expected_features)

# ==============================gi
# LOAD FLOW FEATURES
# ==============================
print("[*] Loading flow features...")
df = pd.read_csv(FLOW_CSV)

# Keep original for final output
df_result = df.copy()

# ==============================
# DROP NON-ML COLUMNS
# ==============================
drop_cols = [
    "Src IP",
    "Dst IP",
    "Src Port",
    "Dst Port",
    "Protocol"
]

df_ml = df.drop(columns=drop_cols, errors="ignore")

# ==============================
# RENAME FEATURES (adjust ONLY if needed)
# ==============================
rename_map = {
    "Flow Duration": "flow_duration",
    "Total Packets": "packet_count",
    "Total Bytes": "total_bytes",
    "Packets/s": "packets_per_sec",
    "Bytes/s": "bytes_per_sec",
    "Packet Length Mean": "pkt_len_mean",
    "Packet Length Std": "pkt_len_std",
    "Packet Length Min": "pkt_len_min",
    "Packet Length Max": "pkt_len_max",
    "SYN Flag Count": "syn_count",
    "ACK Flag Count": "ack_count",
    "FIN Flag Count": "fin_count",
    "RST Flag Count": "rst_count",
    "PSH Flag Count": "psh_count",
    "URG Flag Count": "urg_count"
}

df_ml = df_ml.rename(columns=rename_map)

# ==============================
# ALIGN FEATURE ORDER
# ==============================
df_ml = df_ml[expected_features]

# ==============================
# RUN INFERENCE
# ==============================
print("[*] Running NIDS inference...")
y_pred = model.predict(df_ml)
attack_labels = label_encoder.inverse_transform(y_pred)

# ==============================
# SAVE RESULTS
# ==============================
df_result["Predicted Attack"] = attack_labels
df_result.to_csv(OUTPUT_CSV, index=False)

print("[DONE] Flow predictions saved to", OUTPUT_CSV)
