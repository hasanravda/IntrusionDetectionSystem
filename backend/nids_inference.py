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

# ==============================
# LOAD FLOW FEATURES
# ==============================
print("[*] Loading flow features...")
df_raw = pd.read_csv(FLOW_CSV)
print("Flow csv columns:", df_raw.columns.tolist())

# Keep original dataframe for output
df_result = df_raw.copy()

# ==============================
# FEATURE ADAPTER (NFStream -> Model)
# ==============================
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
# BUILD ML DATAFRAME
# ==============================
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
