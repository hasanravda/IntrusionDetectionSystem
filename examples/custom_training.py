#!/usr/bin/env python3
"""
Example: Custom ML Model Training

This example shows how to train a custom machine learning model
for network intrusion detection using your own dataset.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import numpy as np
import pandas as pd
from nids.ml_model import NIDSModel
from sklearn.metrics import classification_report, confusion_matrix


def create_sample_dataset():
    """Create a sample dataset for demonstration"""
    print("Creating sample dataset...")
    
    # Normal traffic features (700 samples)
    normal_data = np.random.randn(700, 30) * 0.5 + 1
    normal_labels = np.zeros(700)
    
    # Attack traffic features (300 samples)
    attack_data = np.random.randn(300, 30) * 1.5 + 2.5
    attack_labels = np.ones(300)
    
    # Combine
    X = np.vstack([normal_data, attack_data])
    y = np.hstack([normal_labels, attack_labels])
    
    # Shuffle
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]
    
    return X, y


def train_model():
    """Train a custom NIDS model"""
    print("="*60)
    print("Custom ML Model Training Example")
    print("="*60)
    
    # Create sample dataset
    X, y = create_sample_dataset()
    print(f"\nDataset created: {X.shape[0]} samples, {X.shape[1]} features")
    print(f"  Normal samples: {np.sum(y == 0)}")
    print(f"  Attack samples: {np.sum(y == 1)}")
    
    # Initialize model
    model = NIDSModel(model_path='examples/custom_model.joblib')
    
    # Train with Random Forest
    print("\nTraining Random Forest model...")
    metrics = model.train(X, y, model_type='random_forest')
    
    # Display results
    print(f"\n{'='*60}")
    print("Training Results")
    print(f"{'='*60}")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print("\nClassification Report:")
    print(metrics['classification_report'])
    
    # Save model
    model.save()
    print(f"\n✓ Model saved to: examples/custom_model.joblib")
    
    # Test prediction
    print("\nTesting prediction on new samples...")
    test_normal = np.random.randn(1, 30) * 0.5 + 1
    test_attack = np.random.randn(1, 30) * 1.5 + 2.5
    
    pred_normal = model.predict(test_normal)
    prob_normal = model.predict_proba(test_normal)
    print(f"Normal traffic: Prediction={pred_normal}, Probability={prob_normal:.2%}")
    
    pred_attack = model.predict(test_attack)
    prob_attack = model.predict_proba(test_attack)
    print(f"Attack traffic: Prediction={pred_attack}, Probability={prob_attack:.2%}")
    
    print(f"\n{'='*60}")


def train_from_csv(csv_file):
    """Train model from CSV file"""
    print(f"Loading dataset from {csv_file}...")
    
    # Load CSV
    df = pd.read_csv(csv_file)
    
    # Separate features and labels
    y = df['label'].values
    X = df.drop(columns=['label']).values
    
    print(f"Dataset loaded: {X.shape[0]} samples, {X.shape[1]} features")
    
    # Initialize and train
    model = NIDSModel(model_path='examples/custom_model_from_csv.joblib')
    metrics = model.train(X, y, model_type='random_forest')
    
    print(f"\nAccuracy: {metrics['accuracy']:.4f}")
    model.save()
    print(f"✓ Model saved")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train custom NIDS model')
    parser.add_argument('--csv', help='Train from CSV file', default=None)
    
    args = parser.parse_args()
    
    if args.csv:
        train_from_csv(args.csv)
    else:
        train_model()
