import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import os

FEATURES = [
    "Destination Port",
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Flow Packets/s",
    "Flow Bytes/s",
    "SYN Flag Count",
    "ACK Flag Count",
    "FIN Flag Count",
    "Packet Length Mean"
]

def train_ids_model(csv_path):
    print("📂 Loading dataset...")
    df = pd.read_csv(csv_path)

    # 🔥 FIX 1: Strip column names
    df.columns = df.columns.str.strip()

    print("🧹 Cleaning infinite / NaN values...")
    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    # 🔥 DROP rows with NaN AFTER cleaning
    df = df[FEATURES + ["Label"]].dropna()

    print("🏷️ Encoding labels...")
    df["Label"] = df["Label"].apply(lambda x: 0 if x == "BENIGN" else 1)

    # OPTIONAL: reduce dataset size (prevents memory crash)
    df = df.sample(200000, random_state=42)

    X = df[FEATURES]
    y = df["Label"]

    print("✂️ Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("🌲 Training Random Forest...")
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    print("📊 Evaluation:")
    print(classification_report(y_test, model.predict(X_test)))

    # 🔥 SAVE MODEL NEXT TO SCRIPT
    model_path = os.path.join(os.path.dirname(__file__), "ids_flow_model.pkl")
    joblib.dump(model, model_path)

    print("✅ MODEL CREATED SUCCESSFULLY")
    print("📁 Saved at:", model_path)


# 🚀 RUN TRAINING
train_ids_model(
    r"dataset/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"
)
