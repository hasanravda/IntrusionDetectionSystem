#!/usr/bin/env python3
"""
Sample Dataset Generator
Generates synthetic network traffic data for testing and training
"""

import pandas as pd
import numpy as np
import argparse
import os


def generate_normal_traffic(n_samples):
    """Generate normal network traffic samples"""
    # Set random seed for reproducibility
    np.random.seed(42)
    
    samples = []
    
    for _ in range(n_samples):
        sample = {
            # Packet features
            'packet_length': np.random.randint(64, 1500),
            'ip_length': np.random.randint(60, 1500),
            'ttl': np.random.choice([64, 128, 255]),
            'protocol': np.random.choice([6, 17]),  # TCP or UDP
            'ip_options_len': 0,
            
            # Port features (common services)
            'src_port': np.random.randint(1024, 65535),
            'dst_port': np.random.choice([80, 443, 22, 21, 25, 53]),
            
            # TCP features
            'seq_num': np.random.randint(0, 2**32),
            'ack_num': np.random.randint(0, 2**32),
            'window_size': np.random.randint(1000, 65535),
            'tcp_flags': np.random.choice([2, 16, 18, 24]),  # SYN, ACK, SYN-ACK, PSH-ACK
            'tcp_options_len': np.random.choice([0, 4, 8]),
            
            # TCP flag bits
            'flag_fin': 0,
            'flag_syn': np.random.choice([0, 1]),
            'flag_rst': 0,
            'flag_psh': np.random.choice([0, 1]),
            'flag_ack': 1,
            'flag_urg': 0,
            
            # Flow features (normal patterns)
            'flow_packet_count': np.random.randint(1, 100),
            'flow_bytes': np.random.randint(1000, 100000),
            'flow_mean_size': np.random.randint(100, 1000),
            'flow_std_size': np.random.uniform(10, 200),
            'flow_max_size': np.random.randint(1000, 1500),
            'flow_min_size': np.random.randint(64, 200),
            'active_flows': np.random.randint(1, 50),
            
            # Padding features
            'feature_24': 0,
            'feature_25': 0,
            'feature_26': 0,
            'feature_27': 0,
            'feature_28': 0,
            
            # Label
            'label': 0  # Normal traffic
        }
        samples.append(sample)
    
    return pd.DataFrame(samples)


def generate_attack_traffic(n_samples):
    """Generate malicious network traffic samples"""
    np.random.seed(123)
    
    samples = []
    
    for _ in range(n_samples):
        attack_type = np.random.choice(['port_scan', 'dos', 'brute_force', 'exploit'])
        
        if attack_type == 'port_scan':
            # Port scanning characteristics
            sample = {
                'packet_length': np.random.randint(40, 100),
                'ip_length': np.random.randint(40, 100),
                'ttl': np.random.randint(1, 64),
                'protocol': 6,  # TCP
                'ip_options_len': 0,
                'src_port': np.random.randint(1024, 65535),
                'dst_port': np.random.randint(1, 1024),  # Scanning low ports
                'seq_num': np.random.randint(0, 2**32),
                'ack_num': 0,
                'window_size': 0,
                'tcp_flags': 2,  # SYN flag only
                'tcp_options_len': 4,
                'flag_fin': 0,
                'flag_syn': 1,
                'flag_rst': 0,
                'flag_psh': 0,
                'flag_ack': 0,
                'flag_urg': 0,
                'flow_packet_count': np.random.randint(100, 1000),  # Many packets
                'flow_bytes': np.random.randint(5000, 50000),
                'flow_mean_size': np.random.randint(40, 100),
                'flow_std_size': np.random.uniform(1, 20),
                'flow_max_size': 100,
                'flow_min_size': 40,
                'active_flows': np.random.randint(50, 200),  # Many flows
                'feature_24': 0,
                'feature_25': 0,
                'feature_26': 0,
                'feature_27': 0,
                'feature_28': 0,
                'label': 1
            }
            
        elif attack_type == 'dos':
            # DoS attack characteristics
            sample = {
                'packet_length': np.random.randint(1000, 1500),
                'ip_length': np.random.randint(1000, 1500),
                'ttl': 64,
                'protocol': np.random.choice([6, 17]),
                'ip_options_len': 0,
                'src_port': np.random.randint(1024, 65535),
                'dst_port': np.random.choice([80, 443]),
                'seq_num': np.random.randint(0, 2**32),
                'ack_num': np.random.randint(0, 2**32),
                'window_size': 65535,
                'tcp_flags': 24,
                'tcp_options_len': 0,
                'flag_fin': 0,
                'flag_syn': 0,
                'flag_rst': 0,
                'flag_psh': 1,
                'flag_ack': 1,
                'flag_urg': 0,
                'flow_packet_count': np.random.randint(500, 5000),  # Very high
                'flow_bytes': np.random.randint(500000, 5000000),  # Very high
                'flow_mean_size': np.random.randint(1000, 1500),
                'flow_std_size': np.random.uniform(50, 200),
                'flow_max_size': 1500,
                'flow_min_size': 1000,
                'active_flows': np.random.randint(100, 500),
                'feature_24': 0,
                'feature_25': 0,
                'feature_26': 0,
                'feature_27': 0,
                'feature_28': 0,
                'label': 1
            }
            
        elif attack_type == 'brute_force':
            # Brute force login attempts
            sample = {
                'packet_length': np.random.randint(200, 500),
                'ip_length': np.random.randint(200, 500),
                'ttl': 64,
                'protocol': 6,
                'ip_options_len': 0,
                'src_port': np.random.randint(1024, 65535),
                'dst_port': 22,  # SSH port
                'seq_num': np.random.randint(0, 2**32),
                'ack_num': np.random.randint(0, 2**32),
                'window_size': np.random.randint(5000, 20000),
                'tcp_flags': 24,
                'tcp_options_len': 8,
                'flag_fin': 0,
                'flag_syn': 0,
                'flag_rst': 0,
                'flag_psh': 1,
                'flag_ack': 1,
                'flag_urg': 0,
                'flow_packet_count': np.random.randint(50, 500),
                'flow_bytes': np.random.randint(10000, 200000),
                'flow_mean_size': np.random.randint(200, 500),
                'flow_std_size': np.random.uniform(20, 100),
                'flow_max_size': 500,
                'flow_min_size': 200,
                'active_flows': np.random.randint(10, 100),
                'feature_24': 0,
                'feature_25': 0,
                'feature_26': 0,
                'feature_27': 0,
                'feature_28': 0,
                'label': 1
            }
            
        else:  # exploit
            # Exploit attempt
            sample = {
                'packet_length': np.random.randint(500, 1500),
                'ip_length': np.random.randint(500, 1500),
                'ttl': np.random.randint(32, 128),
                'protocol': 6,
                'ip_options_len': np.random.choice([0, 4]),
                'src_port': np.random.randint(1024, 65535),
                'dst_port': np.random.choice([80, 443, 8080]),
                'seq_num': np.random.randint(0, 2**32),
                'ack_num': np.random.randint(0, 2**32),
                'window_size': np.random.randint(1000, 65535),
                'tcp_flags': 24,
                'tcp_options_len': np.random.choice([0, 4, 8, 12]),
                'flag_fin': 0,
                'flag_syn': 0,
                'flag_rst': 0,
                'flag_psh': 1,
                'flag_ack': 1,
                'flag_urg': 0,
                'flow_packet_count': np.random.randint(20, 200),
                'flow_bytes': np.random.randint(10000, 500000),
                'flow_mean_size': np.random.randint(500, 1500),
                'flow_std_size': np.random.uniform(100, 500),
                'flow_max_size': 1500,
                'flow_min_size': 500,
                'active_flows': np.random.randint(5, 50),
                'feature_24': 0,
                'feature_25': 0,
                'feature_26': 0,
                'feature_27': 0,
                'feature_28': 0,
                'label': 1
            }
        
        samples.append(sample)
    
    return pd.DataFrame(samples)


def main():
    parser = argparse.ArgumentParser(description='Generate synthetic dataset for NIDS training')
    
    parser.add_argument(
        '-n', '--normal',
        type=int,
        default=7000,
        help='Number of normal traffic samples (default: 7000)'
    )
    
    parser.add_argument(
        '-a', '--attack',
        type=int,
        default=3000,
        help='Number of attack traffic samples (default: 3000)'
    )
    
    parser.add_argument(
        '-o', '--output',
        default='dataset.csv',
        help='Output CSV file (default: dataset.csv)'
    )
    
    args = parser.parse_args()
    
    print(f"Generating synthetic dataset...")
    print(f"  Normal samples: {args.normal}")
    print(f"  Attack samples: {args.attack}")
    print(f"  Total samples: {args.normal + args.attack}")
    
    # Generate datasets
    normal_df = generate_normal_traffic(args.normal)
    attack_df = generate_attack_traffic(args.attack)
    
    # Combine and shuffle
    dataset = pd.concat([normal_df, attack_df], ignore_index=True)
    dataset = dataset.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Create output directory if needed
    os.makedirs(os.path.dirname(args.output) if os.path.dirname(args.output) else '.', exist_ok=True)
    
    # Save to CSV
    dataset.to_csv(args.output, index=False)
    
    print(f"\n✓ Dataset saved to: {args.output}")
    print(f"  Shape: {dataset.shape}")
    print(f"  Label distribution:")
    print(f"    Normal (0): {len(dataset[dataset['label'] == 0])}")
    print(f"    Attack (1): {len(dataset[dataset['label'] == 1])}")
    print(f"\nYou can now train a model with:")
    print(f"  python train_model.py {args.output}")


if __name__ == '__main__':
    main()
