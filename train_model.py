#!/usr/bin/env python3
"""
Training Script for NIDS Model
Trains the ML model using UQ-NIDS or custom dataset
"""

import argparse
import pandas as pd
import numpy as np
import logging
from sklearn.preprocessing import LabelEncoder
from nids.ml_model import NIDSModel

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_dataset(dataset_path, label_column='label'):
    """
    Load dataset from CSV file
    
    Args:
        dataset_path: Path to CSV file
        label_column: Name of the label column
        
    Returns:
        X: Features
        y: Labels
    """
    logger.info(f"Loading dataset from {dataset_path}")
    
    try:
        # Load CSV
        df = pd.read_csv(dataset_path)
        
        logger.info(f"Dataset shape: {df.shape}")
        logger.info(f"Columns: {df.columns.tolist()}")
        
        # Separate features and labels
        if label_column not in df.columns:
            raise ValueError(f"Label column '{label_column}' not found in dataset")
        
        y = df[label_column]
        X = df.drop(columns=[label_column])
        
        # Encode labels if they are strings
        if y.dtype == 'object':
            logger.info("Encoding string labels to numeric values")
            le = LabelEncoder()
            y = le.fit_transform(y)
            logger.info(f"Label classes: {le.classes_}")
        
        # Convert to binary classification (0: normal, 1: attack)
        # Adjust this based on your dataset
        if len(np.unique(y)) > 2:
            logger.info("Converting multi-class to binary classification")
            y = (y > 0).astype(int)
        
        logger.info(f"Features shape: {X.shape}")
        logger.info(f"Labels shape: {y.shape}")
        logger.info(f"Label distribution: Normal={np.sum(y==0)}, Attack={np.sum(y==1)}")
        
        return X.values, y
        
    except Exception as e:
        logger.error(f"Error loading dataset: {e}")
        raise


def preprocess_dataset(X):
    """
    Preprocess dataset features
    
    Args:
        X: Feature matrix
        
    Returns:
        X_processed: Preprocessed features
    """
    logger.info("Preprocessing dataset")
    
    # Handle missing values
    X = pd.DataFrame(X)
    X = X.fillna(0)
    
    # Handle infinite values
    X = X.replace([np.inf, -np.inf], 0)
    
    return X.values


def main():
    parser = argparse.ArgumentParser(description='Train NIDS ML Model')
    
    parser.add_argument(
        'dataset',
        help='Path to training dataset (CSV format)'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output model path',
        default='models/nids_model.joblib'
    )
    
    parser.add_argument(
        '-l', '--label-column',
        help='Name of the label column',
        default='label'
    )
    
    parser.add_argument(
        '-m', '--model-type',
        help='Type of model to train',
        choices=['random_forest', 'gradient_boost'],
        default='random_forest'
    )
    
    args = parser.parse_args()
    
    # Load dataset
    X, y = load_dataset(args.dataset, args.label_column)
    
    # Preprocess
    X = preprocess_dataset(X)
    
    # Ensure feature vector has exactly 30 features (pad or truncate)
    n_features = X.shape[1]
    if n_features < 30:
        logger.info(f"Padding features from {n_features} to 30")
        padding = np.zeros((X.shape[0], 30 - n_features))
        X = np.hstack([X, padding])
    elif n_features > 30:
        logger.info(f"Truncating features from {n_features} to 30")
        X = X[:, :30]
    
    # Initialize model
    model = NIDSModel(model_path=args.output)
    
    # Train
    logger.info(f"Training {args.model_type} model")
    metrics = model.train(X, y, model_type=args.model_type)
    
    # Print results
    print("\n" + "="*60)
    print("TRAINING RESULTS")
    print("="*60)
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print("\nClassification Report:")
    print(metrics['classification_report'])
    print("\nConfusion Matrix:")
    print(np.array(metrics['confusion_matrix']))
    print("="*60)
    
    # Save model
    model.save()
    logger.info(f"Model saved to {args.output}")
    
    print(f"\n✓ Model training complete!")
    print(f"✓ Model saved to: {args.output}")
    print(f"\nYou can now use this model with: python main.py")


if __name__ == '__main__':
    main()
