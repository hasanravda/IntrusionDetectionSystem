"""
ML Model Module
Trains and manages the machine learning model for intrusion detection
"""

import os
import logging
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pandas as pd

logger = logging.getLogger(__name__)


class NIDSModel:
    """Machine Learning model for Network Intrusion Detection"""
    
    def __init__(self, model_path='models/nids_model.joblib'):
        """
        Initialize NIDS model
        
        Args:
            model_path: Path to save/load model
        """
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = None
        
    def train(self, X, y, model_type='random_forest'):
        """
        Train the model
        
        Args:
            X: Feature matrix (numpy array or pandas DataFrame)
            y: Labels (numpy array or pandas Series)
            model_type: Type of model to train ('random_forest' or 'gradient_boost')
            
        Returns:
            dict: Training metrics
        """
        logger.info(f"Training {model_type} model with {len(X)} samples...")
        
        try:
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
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
                    n_jobs=-1
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
                'classification_report': classification_report(y_test, y_pred),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            raise
            
    def predict(self, features):
        """
        Predict if traffic is malicious
        
        Args:
            features: Feature vector or matrix
            
        Returns:
            prediction: 0 for normal, 1 for malicious
        """
        if not self.is_trained:
            logger.warning("Model not trained, loading from disk...")
            self.load()
            
        try:
            # Handle single sample
            if len(np.array(features).shape) == 1:
                features = np.array(features).reshape(1, -1)
                
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Predict
            prediction = self.model.predict(features_scaled)
            
            return prediction[0] if len(prediction) == 1 else prediction
            
        except Exception as e:
            logger.error(f"Error predicting: {e}")
            return 0  # Default to normal on error
            
    def predict_proba(self, features):
        """
        Predict probability of being malicious
        
        Args:
            features: Feature vector or matrix
            
        Returns:
            float: Probability of being malicious (0-1)
        """
        if not self.is_trained:
            self.load()
            
        try:
            if len(np.array(features).shape) == 1:
                features = np.array(features).reshape(1, -1)
                
            features_scaled = self.scaler.transform(features)
            proba = self.model.predict_proba(features_scaled)
            
            # Return probability of malicious class (class 1)
            return proba[0][1] if len(proba) == 1 else proba[:, 1]
            
        except Exception as e:
            logger.error(f"Error predicting probability: {e}")
            return 0.0
            
    def save(self):
        """Save model to disk"""
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'is_trained': self.is_trained,
                'feature_names': self.feature_names
            }
            
            joblib.dump(model_data, self.model_path)
            logger.info(f"Model saved to {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            
    def load(self):
        """Load model from disk"""
        try:
            if not os.path.exists(self.model_path):
                logger.warning(f"Model file not found: {self.model_path}")
                # Create a default trained model
                self._create_default_model()
                return
                
            model_data = joblib.load(self.model_path)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.is_trained = model_data['is_trained']
            self.feature_names = model_data.get('feature_names')
            
            logger.info(f"Model loaded from {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self._create_default_model()
            
    def _create_default_model(self):
        """Create a default model for demo purposes"""
        logger.info("Creating default model for demonstration...")
        
        # Create synthetic training data
        np.random.seed(42)
        n_samples = 1000
        n_features = 30
        
        # Normal traffic (70%)
        X_normal = np.random.randn(700, n_features) * 0.5 + 1
        y_normal = np.zeros(700)
        
        # Malicious traffic (30%)
        X_malicious = np.random.randn(300, n_features) * 1.5 + 2
        y_malicious = np.ones(300)
        
        X = np.vstack([X_normal, X_malicious])
        y = np.hstack([y_normal, y_malicious])
        
        # Train model
        self.train(X, y, model_type='random_forest')
        self.save()
        
        logger.info("Default model created and saved")
