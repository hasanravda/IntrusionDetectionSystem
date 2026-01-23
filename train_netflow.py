#!/usr/bin/env python3
"""
NetFlow v3 Dataset Training Script
Trains the NIDS model using NetFlow v3 datasets with multi-class classification

Supports the following NetFlow v3 datasets:
- NF-UNSW-NB15-v3
- NF-ToN-IoT-v3
- NF-BoT-IoT-v3
- NF-CSE-CIC-IDS2018-v3

Citation:
Majed Luay, Siamak Layeghy, Seyedehfaezeh Hosseininoorbin, Mohanad Sarhan, 
Nour Moustafa, Marius Portmann, "Temporal Analysis of NetFlow Datasets for 
Network Intrusion Detection Systems", 2025.
https://arxiv.org/abs/2503.04404
"""

import argparse
import pandas as pd
import numpy as np
import logging
import os
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# NetFlow v3 NF-UNSW-NB15 attack classes
NETFLOW_ATTACK_CLASSES = {
    'Benign': 'Normal unmalicious flows',
    'Fuzzers': 'Sends random data to crash systems and find vulnerabilities',
    'Analysis': 'Attacks targeting web applications through ports, emails, scripts',
    'Backdoor': 'Bypasses security mechanisms via constructed client applications',
    'DoS': 'Denial of Service - overloads system resources',
    'Exploits': 'Command sequences controlling hosts through vulnerabilities',
    'Generic': 'Targets cryptography and causes block-cipher collisions',
    'Reconnaissance': 'Information gathering about network hosts (probes)',
    'Shellcode': 'Malware that penetrates code to control victim hosts',
    'Worms': 'Self-replicating attacks spreading to other computers'
}


class NetFlowNIDSModel:
    """Multi-class NIDS model for NetFlow v3 datasets"""
    
    def __init__(self, model_path='models/netflow_nids_model.joblib'):
        """
        Initialize NetFlow NIDS model
        
        Args:
            model_path: Path to save/load model
        """
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.classes = None
        
    def train(self, X, y, model_type='random_forest'):
        """
        Train the multi-class model
        
        Args:
            X: Feature matrix
            y: Labels (can be strings or integers)
            model_type: 'random_forest' or 'gradient_boost'
            
        Returns:
            dict: Training metrics
        """
        logger.info(f"Training {model_type} model with {len(X)} samples...")
        
        try:
            # Encode labels if they are strings
            if y.dtype == 'object':
                logger.info("Encoding string labels to numeric values")
                y_encoded = self.label_encoder.fit_transform(y)
                self.classes = self.label_encoder.classes_
                logger.info(f"Classes: {self.classes}")
            else:
                y_encoded = y
                self.classes = np.unique(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            if model_type == 'random_forest':
                self.model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=20,
                    random_state=42,
                    n_jobs=-1,
                    class_weight='balanced'  # Handle class imbalance
                )
            elif model_type == 'gradient_boost':
                self.model = GradientBoostingClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
            else:
                raise ValueError(f"Unknown model type: {model_type}")
                
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            logger.info(f"Model trained successfully. Accuracy: {accuracy:.4f}")
            
            self.is_trained = True
            
            # Return metrics
            metrics = {
                'accuracy': accuracy,
                'classification_report': classification_report(
                    y_test, y_pred, 
                    target_names=self.classes if self.classes is not None else None
                ),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            raise
            
    def predict(self, features):
        """
        Predict attack class
        
        Args:
            features: Feature vector or matrix
            
        Returns:
            prediction: Class label(s)
        """
        if not self.is_trained:
            logger.warning("Model not trained, loading from disk...")
            self.load()
            
        try:
            if len(np.array(features).shape) == 1:
                features = np.array(features).reshape(1, -1)
                
            features_scaled = self.scaler.transform(features)
            prediction = self.model.predict(features_scaled)
            
            # Decode labels if encoder was used
            if hasattr(self.label_encoder, 'classes_'):
                prediction = self.label_encoder.inverse_transform(prediction)
            
            return prediction[0] if len(prediction) == 1 else prediction
            
        except Exception as e:
            logger.error(f"Error predicting: {e}")
            return 'Benign'  # Default to benign on error
            
    def predict_proba(self, features):
        """
        Predict probability for each class
        
        Args:
            features: Feature vector or matrix
            
        Returns:
            array: Probability for each class
        """
        if not self.is_trained:
            self.load()
            
        try:
            if len(np.array(features).shape) == 1:
                features = np.array(features).reshape(1, -1)
                
            features_scaled = self.scaler.transform(features)
            proba = self.model.predict_proba(features_scaled)
            
            return proba[0] if len(proba) == 1 else proba
            
        except Exception as e:
            logger.error(f"Error predicting probability: {e}")
            return None
            
    def save(self):
        """Save model to disk"""
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'label_encoder': self.label_encoder,
                'is_trained': self.is_trained,
                'classes': self.classes
            }
            
            joblib.dump(model_data, self.model_path)
            logger.info(f"Model saved to {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            
    def load(self):
        """Load model from disk"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
                
            model_data = joblib.load(self.model_path)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoder = model_data.get('label_encoder', LabelEncoder())
            self.is_trained = model_data['is_trained']
            self.classes = model_data.get('classes')
            
            logger.info(f"Model loaded from {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise


def load_netflow_dataset(dataset_path, label_column='Label'):
    """
    Load NetFlow v3 dataset from CSV file
    
    Args:
        dataset_path: Path to CSV file
        label_column: Name of the label column (default: 'Label')
        
    Returns:
        X: Features
        y: Labels
        class_distribution: Dictionary with class counts
    """
    logger.info(f"Loading NetFlow v3 dataset from {dataset_path}")
    
    try:
        # Load CSV
        df = pd.read_csv(dataset_path)
        
        logger.info(f"Dataset shape: {df.shape}")
        logger.info(f"Number of features: {df.shape[1] - 1}")
        
        # Check for label column
        if label_column not in df.columns:
            # Try alternative column names
            possible_labels = ['Label', 'label', 'Attack', 'attack', 'Class', 'class']
            for col in possible_labels:
                if col in df.columns:
                    label_column = col
                    logger.info(f"Using label column: {label_column}")
                    break
            else:
                raise ValueError(f"Label column not found. Available columns: {df.columns.tolist()}")
        
        # Separate features and labels
        y = df[label_column]
        X = df.drop(columns=[label_column])
        
        # Handle missing values
        X = X.fillna(0)
        X = X.replace([np.inf, -np.inf], 0)
        
        # Get class distribution
        class_distribution = y.value_counts().to_dict()
        
        logger.info(f"\nClass Distribution:")
        for class_name, count in sorted(class_distribution.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(y)) * 100
            logger.info(f"  {class_name}: {count} ({percentage:.2f}%)")
        
        return X.values, y.values, class_distribution
        
    except Exception as e:
        logger.error(f"Error loading dataset: {e}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description='Train NIDS model on NetFlow v3 datasets',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
NetFlow v3 Dataset Support:
  - NF-UNSW-NB15-v3 (10 classes: Benign + 9 attack types)
  - NF-ToN-IoT-v3
  - NF-BoT-IoT-v3
  - NF-CSE-CIC-IDS2018-v3

Expected Classes (NF-UNSW-NB15-v3):
  Benign, Fuzzers, Analysis, Backdoor, DoS, Exploits, 
  Generic, Reconnaissance, Shellcode, Worms

Examples:
  python train_netflow.py NF-UNSW-NB15-v3.csv
  python train_netflow.py dataset.csv -l Label -m gradient_boost
  python train_netflow.py dataset.csv -o models/my_netflow_model.joblib
        """
    )
    
    parser.add_argument(
        'dataset',
        help='Path to NetFlow v3 dataset (CSV format)'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output model path',
        default='models/netflow_nids_model.joblib'
    )
    
    parser.add_argument(
        '-l', '--label-column',
        help='Name of the label column',
        default='Label'
    )
    
    parser.add_argument(
        '-m', '--model-type',
        help='Type of model to train',
        choices=['random_forest', 'gradient_boost'],
        default='random_forest'
    )
    
    parser.add_argument(
        '--binary',
        action='store_true',
        help='Convert to binary classification (Benign vs Attack)'
    )
    
    args = parser.parse_args()
    
    print("="*80)
    print("NetFlow v3 NIDS Model Training")
    print("="*80)
    print(f"\nDataset: {args.dataset}")
    print(f"Model type: {args.model_type}")
    print(f"Classification: {'Binary' if args.binary else 'Multi-class (10 classes)'}")
    print()
    
    # Load dataset
    X, y, class_dist = load_netflow_dataset(args.dataset, args.label_column)
    
    # Convert to binary if requested
    if args.binary:
        logger.info("\nConverting to binary classification (Benign=0, Attack=1)")
        y_binary = np.where(y == 'Benign', 0, 1)
        y = y_binary
        logger.info(f"Binary distribution: Benign={np.sum(y==0)}, Attack={np.sum(y==1)}")
    
    # Initialize and train model
    model = NetFlowNIDSModel(model_path=args.output)
    
    print(f"\nTraining {args.model_type} model...")
    metrics = model.train(X, y, model_type=args.model_type)
    
    # Display results
    print("\n" + "="*80)
    print("TRAINING RESULTS")
    print("="*80)
    print(f"\nAccuracy: {metrics['accuracy']:.4f}")
    print("\nClassification Report:")
    print(metrics['classification_report'])
    
    # Save model
    model.save()
    
    print(f"\n{'='*80}")
    print(f"✓ Model training complete!")
    print(f"✓ Model saved to: {args.output}")
    print(f"\nModel supports {len(model.classes) if model.classes is not None else 2} classes")
    if model.classes is not None and len(model.classes) <= 15:
        print(f"Classes: {', '.join(map(str, model.classes))}")
    print(f"\nYou can now use this model for NetFlow traffic classification!")
    print("="*80)


if __name__ == '__main__':
    main()
