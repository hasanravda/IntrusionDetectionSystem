"""
Detection Engine Module
Real-time detection and alert generation
"""

import logging
from datetime import datetime
from queue import Queue, Empty
import threading
import json
import os
from colorama import Fore, Style

from .packet_capture import extract_packet_info
from .feature_extraction import FeatureExtractor
from .ml_model import NIDSModel

logger = logging.getLogger(__name__)


class DetectionEngine:
    """Real-time intrusion detection engine"""
    
    def __init__(self, model_path='models/nids_model.joblib', threshold=0.7):
        """
        Initialize detection engine
        
        Args:
            model_path: Path to ML model
            threshold: Probability threshold for classification
        """
        self.model = NIDSModel(model_path)
        self.feature_extractor = FeatureExtractor()
        self.threshold = threshold
        self.alert_queue = Queue()
        self.is_running = False
        self.detection_thread = None
        self.stats = {
            'total_packets': 0,
            'normal_packets': 0,
            'malicious_packets': 0,
            'alerts_generated': 0
        }
        
        # Load or create model
        try:
            self.model.load()
        except:
            logger.warning("Model not found, creating default model...")
            self.model._create_default_model()
            
    def start(self, packet_queue):
        """
        Start detection engine
        
        Args:
            packet_queue: Queue containing captured packets
        """
        if self.is_running:
            logger.warning("Detection engine already running")
            return
            
        self.is_running = True
        self.detection_thread = threading.Thread(
            target=self._detection_loop,
            args=(packet_queue,),
            daemon=True
        )
        self.detection_thread.start()
        logger.info("Detection engine started")
        
    def _detection_loop(self, packet_queue):
        """Main detection loop"""
        while self.is_running:
            try:
                # Get packet from queue (timeout to check is_running)
                packet = packet_queue.get(timeout=1)
                
                # Analyze packet
                self.analyze_packet(packet)
                
            except Empty:
                continue
            except Exception as e:
                logger.error(f"Error in detection loop: {e}")
                
    def analyze_packet(self, packet):
        """
        Analyze a single packet
        
        Args:
            packet: Scapy packet object
            
        Returns:
            dict: Analysis result
        """
        try:
            self.stats['total_packets'] += 1
            
            # Extract features
            features = self.feature_extractor.extract_features(packet)
            
            # Predict
            prediction = self.model.predict(features)
            probability = self.model.predict_proba(features)
            
            # Extract packet info
            packet_info = extract_packet_info(packet)
            
            # Create result
            result = {
                'timestamp': packet_info['timestamp'],
                'prediction': int(prediction),
                'probability': float(probability),
                'is_malicious': probability >= self.threshold,
                'packet_info': packet_info
            }
            
            # Update stats and generate alert if malicious
            if result['is_malicious']:
                self.stats['malicious_packets'] += 1
                self._generate_alert(result)
            else:
                self.stats['normal_packets'] += 1
                
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing packet: {e}")
            return None
            
    def _generate_alert(self, result):
        """
        Generate alert for malicious traffic
        
        Args:
            result: Analysis result
        """
        try:
            alert = {
                'alert_id': self.stats['alerts_generated'] + 1,
                'timestamp': result['timestamp'],
                'severity': self._calculate_severity(result['probability']),
                'probability': result['probability'],
                'source_ip': result['packet_info'].get('src_ip'),
                'destination_ip': result['packet_info'].get('dst_ip'),
                'source_port': result['packet_info'].get('src_port'),
                'destination_port': result['packet_info'].get('dst_port'),
                'protocol': result['packet_info'].get('protocol'),
                'packet_length': result['packet_info'].get('length'),
                'description': self._generate_description(result)
            }
            
            self.stats['alerts_generated'] += 1
            self.alert_queue.put(alert)
            
            # Log alert
            self._log_alert(alert)
            
        except Exception as e:
            logger.error(f"Error generating alert: {e}")
            
    def _calculate_severity(self, probability):
        """Calculate alert severity based on probability"""
        if probability >= 0.95:
            return 'CRITICAL'
        elif probability >= 0.85:
            return 'HIGH'
        elif probability >= 0.75:
            return 'MEDIUM'
        else:
            return 'LOW'
            
    def _generate_description(self, result):
        """Generate human-readable alert description"""
        packet_info = result['packet_info']
        protocol = packet_info.get('protocol', 'Unknown')
        src_ip = packet_info.get('src_ip', 'Unknown')
        dst_ip = packet_info.get('dst_ip', 'Unknown')
        
        return f"Suspicious {protocol} traffic detected from {src_ip} to {dst_ip}"
        
    def _log_alert(self, alert):
        """Log alert to file and console"""
        try:
            # Console output with color
            severity_color = {
                'CRITICAL': Fore.RED,
                'HIGH': Fore.LIGHTRED_EX,
                'MEDIUM': Fore.YELLOW,
                'LOW': Fore.LIGHTYELLOW_EX
            }
            
            color = severity_color.get(alert['severity'], Fore.WHITE)
            print(f"\n{color}[ALERT #{alert['alert_id']}] {alert['severity']} - {alert['description']}{Style.RESET_ALL}")
            print(f"  Time: {alert['timestamp']}")
            print(f"  Source: {alert['source_ip']}:{alert['source_port']}")
            print(f"  Destination: {alert['destination_ip']}:{alert['destination_port']}")
            print(f"  Protocol: {alert['protocol']}")
            print(f"  Confidence: {alert['probability']:.2%}")
            
            # Save to file
            os.makedirs('alerts', exist_ok=True)
            alert_file = 'alerts/alerts.json'
            
            # Load existing alerts
            alerts = []
            if os.path.exists(alert_file):
                try:
                    with open(alert_file, 'r') as f:
                        alerts = json.load(f)
                except:
                    pass
                    
            # Add new alert
            alerts.append(alert)
            
            # Save alerts
            with open(alert_file, 'w') as f:
                json.dump(alerts, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error logging alert: {e}")
            
    def stop(self):
        """Stop detection engine"""
        if self.is_running:
            self.is_running = False
            if self.detection_thread:
                self.detection_thread.join(timeout=2)
            logger.info("Detection engine stopped")
            
    def get_stats(self):
        """Get detection statistics"""
        return self.stats.copy()
        
    def get_alerts(self, count=10):
        """
        Get recent alerts
        
        Args:
            count: Number of alerts to retrieve
            
        Returns:
            list: Recent alerts
        """
        alerts = []
        try:
            alert_file = 'alerts/alerts.json'
            if os.path.exists(alert_file):
                with open(alert_file, 'r') as f:
                    all_alerts = json.load(f)
                    alerts = all_alerts[-count:]
        except Exception as e:
            logger.error(f"Error getting alerts: {e}")
            
        return alerts
