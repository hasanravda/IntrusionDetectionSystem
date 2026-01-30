"""
Feature Extraction Module
Extracts features from network packets for ML model
"""

from scapy.all import IP, TCP, UDP, ICMP
import logging
import numpy as np
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """Extract features from network packets for ML analysis"""
    
    def __init__(self, window_size=100):
        """
        Initialize feature extractor
        
        Args:
            window_size: Number of packets to consider for flow features
        """
        self.window_size = window_size
        self.flow_cache = defaultdict(list)
        self.packet_history = []
        
    def extract_features(self, packet):
        """
        Extract features from a single packet
        
        Args:
            packet: Scapy packet object
            
        Returns:
            list: Feature vector
        """
        features = []
        
        try:
            # Basic packet features
            features.append(len(packet))  # Packet length
            
            if IP in packet:
                ip_layer = packet[IP]
                
                # IP layer features
                features.append(ip_layer.len)  # IP packet length
                features.append(ip_layer.ttl)  # Time to live
                features.append(ip_layer.proto)  # Protocol number
                features.append(len(ip_layer.options))  # IP options length
                
                # Protocol-specific features
                if TCP in packet:
                    tcp_layer = packet[TCP]
                    features.extend([
                        tcp_layer.sport,  # Source port
                        tcp_layer.dport,  # Destination port
                        tcp_layer.seq,  # Sequence number
                        tcp_layer.ack,  # Acknowledgment number
                        tcp_layer.window,  # Window size
                        int(tcp_layer.flags),  # TCP flags
                        len(tcp_layer.options),  # TCP options length
                    ])
                    
                    # TCP flags individual
                    features.extend([
                        int('F' in str(tcp_layer.flags)),  # FIN
                        int('S' in str(tcp_layer.flags)),  # SYN
                        int('R' in str(tcp_layer.flags)),  # RST
                        int('P' in str(tcp_layer.flags)),  # PSH
                        int('A' in str(tcp_layer.flags)),  # ACK
                        int('U' in str(tcp_layer.flags)),  # URG
                    ])
                    
                elif UDP in packet:
                    udp_layer = packet[UDP]
                    features.extend([
                        udp_layer.sport,  # Source port
                        udp_layer.dport,  # Destination port
                        udp_layer.len,  # UDP length
                        0, 0, 0, 0,  # Padding for TCP-specific features
                        0, 0, 0, 0, 0, 0,  # TCP flags padding
                    ])
                    
                elif ICMP in packet:
                    icmp_layer = packet[ICMP]
                    features.extend([
                        0, 0,  # Source/dest port (N/A for ICMP)
                        icmp_layer.type,  # ICMP type
                        icmp_layer.code,  # ICMP code
                        0, 0, 0,  # Padding
                        0, 0, 0, 0, 0, 0,  # TCP flags padding
                    ])
                    
                else:
                    # Unknown protocol padding
                    features.extend([0] * 13)
                    
                # Flow-based features
                flow_key = self._get_flow_key(packet)
                flow_features = self._extract_flow_features(flow_key, packet)
                features.extend(flow_features)
                
            else:
                # Non-IP packet - pad with zeros
                features.extend([0] * 22)
                
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            # Return default feature vector on error
            features = [0] * 30
            
        # Ensure fixed feature vector length
        while len(features) < 30:
            features.append(0)
            
        return features[:30]  # Return fixed-size feature vector
        
    def _get_flow_key(self, packet):
        """Generate flow key for packet"""
        try:
            if IP in packet:
                src_ip = packet[IP].src
                dst_ip = packet[IP].dst
                proto = packet[IP].proto
                
                src_port = 0
                dst_port = 0
                
                if TCP in packet:
                    src_port = packet[TCP].sport
                    dst_port = packet[TCP].dport
                elif UDP in packet:
                    src_port = packet[UDP].sport
                    dst_port = packet[UDP].dport
                    
                return f"{src_ip}:{src_port}->{dst_ip}:{dst_port}:{proto}"
        except:
            pass
            
        return "unknown"
        
    def _extract_flow_features(self, flow_key, packet):
        """Extract flow-based features"""
        try:
            # Update flow cache
            timestamp = datetime.now()
            self.flow_cache[flow_key].append({
                'timestamp': timestamp,
                'size': len(packet)
            })
            
            # Keep only recent packets in flow
            cutoff_time = timestamp - timedelta(seconds=60)
            self.flow_cache[flow_key] = [
                p for p in self.flow_cache[flow_key]
                if p['timestamp'] > cutoff_time
            ]
            
            flow_packets = self.flow_cache[flow_key]
            
            if len(flow_packets) > 0:
                packet_sizes = [p['size'] for p in flow_packets]
                
                return [
                    len(flow_packets),  # Packet count in flow
                    sum(packet_sizes),  # Total bytes in flow
                    np.mean(packet_sizes) if packet_sizes else 0,  # Mean packet size
                    np.std(packet_sizes) if len(packet_sizes) > 1 else 0,  # Std dev
                    max(packet_sizes) if packet_sizes else 0,  # Max packet size
                    min(packet_sizes) if packet_sizes else 0,  # Min packet size
                    len(self.flow_cache),  # Total active flows
                ]
            else:
                return [0] * 7
                
        except (AttributeError, KeyError, TypeError) as e:
            logger.error(f"Error extracting flow features: {e}")
            return [0] * 7
            
    def get_feature_names(self):
        """Get names of extracted features"""
        return [
            'packet_length', 'ip_length', 'ttl', 'protocol', 'ip_options_len',
            'src_port', 'dst_port', 'seq_num', 'ack_num', 'window_size',
            'tcp_flags', 'tcp_options_len',
            'flag_fin', 'flag_syn', 'flag_rst', 'flag_psh', 'flag_ack', 'flag_urg',
            'flow_packet_count', 'flow_bytes', 'flow_mean_size', 'flow_std_size',
            'flow_max_size', 'flow_min_size', 'active_flows',
            'feature_24', 'feature_25', 'feature_26', 'feature_27', 'feature_28'
        ]