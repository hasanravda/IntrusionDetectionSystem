#!/usr/bin/env python3
"""
NFStream Integration Example
Demonstrates how to use nfstream library to extract NetFlow features from pcap files
and prepare data for the NIDS model training.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from nfstream import NFStreamer
import pandas as pd
import numpy as np


def extract_netflow_features(pcap_file, output_csv=None):
    """
    Extract NetFlow features from a pcap file using nfstream
    
    Args:
        pcap_file: Path to pcap file
        output_csv: Optional path to save features as CSV
        
    Returns:
        pandas DataFrame with extracted features
    """
    print(f"Processing {pcap_file} with NFStreamer...")
    
    # Create NFStreamer to process the pcap file
    streamer = NFStreamer(
        source=pcap_file,
        decode_tunnels=True,
        bpf_filter=None,
        promiscuous_mode=True,
        snapshot_length=1536,
        idle_timeout=120,
        active_timeout=1800,
        accounting_mode=0,
        udps=None,
        n_dissections=20,
        statistical_analysis=True,
        splt_analysis=0,
        n_meters=0,
        performance_report=0
    )
    
    # Convert flows to DataFrame
    flows = []
    flow_count = 0
    
    print("Extracting flows...")
    for flow in streamer:
        flow_count += 1
        if flow_count % 1000 == 0:
            print(f"  Processed {flow_count} flows...")
        
        # Extract relevant features
        flow_dict = {
            # Basic flow information
            'src_ip': flow.src_ip,
            'dst_ip': flow.dst_ip,
            'src_port': flow.src_port,
            'dst_port': flow.dst_port,
            'protocol': flow.protocol,
            
            # Timing features
            'bidirectional_first_seen_ms': flow.bidirectional_first_seen_ms,
            'bidirectional_last_seen_ms': flow.bidirectional_last_seen_ms,
            'bidirectional_duration_ms': flow.bidirectional_duration_ms,
            
            # Packet counts
            'bidirectional_packets': flow.bidirectional_packets,
            'src2dst_packets': flow.src2dst_packets,
            'dst2src_packets': flow.dst2src_packets,
            
            # Byte counts
            'bidirectional_bytes': flow.bidirectional_bytes,
            'src2dst_bytes': flow.src2dst_bytes,
            'dst2src_bytes': flow.dst2src_bytes,
            
            # Statistical features
            'bidirectional_min_ps': flow.bidirectional_min_ps,
            'bidirectional_mean_ps': flow.bidirectional_mean_ps,
            'bidirectional_stddev_ps': flow.bidirectional_stddev_ps,
            'bidirectional_max_ps': flow.bidirectional_max_ps,
            
            'src2dst_min_ps': flow.src2dst_min_ps,
            'src2dst_mean_ps': flow.src2dst_mean_ps,
            'src2dst_stddev_ps': flow.src2dst_stddev_ps,
            'src2dst_max_ps': flow.src2dst_max_ps,
            
            'dst2src_min_ps': flow.dst2src_min_ps,
            'dst2src_mean_ps': flow.dst2src_mean_ps,
            'dst2src_stddev_ps': flow.dst2src_stddev_ps,
            'dst2src_max_ps': flow.dst2src_max_ps,
            
            # Inter-arrival time
            'bidirectional_min_piat_ms': flow.bidirectional_min_piat_ms,
            'bidirectional_mean_piat_ms': flow.bidirectional_mean_piat_ms,
            'bidirectional_stddev_piat_ms': flow.bidirectional_stddev_piat_ms,
            'bidirectional_max_piat_ms': flow.bidirectional_max_piat_ms,
            
            'src2dst_min_piat_ms': flow.src2dst_min_piat_ms,
            'src2dst_mean_piat_ms': flow.src2dst_mean_piat_ms,
            'src2dst_stddev_piat_ms': flow.src2dst_stddev_piat_ms,
            'src2dst_max_piat_ms': flow.src2dst_max_piat_ms,
            
            'dst2src_min_piat_ms': flow.dst2src_min_piat_ms,
            'dst2src_mean_piat_ms': flow.dst2src_mean_piat_ms,
            'dst2src_stddev_piat_ms': flow.dst2src_stddev_piat_ms,
            'dst2src_max_piat_ms': flow.dst2src_max_piat_ms,
            
            # Flags
            'bidirectional_syn_packets': flow.bidirectional_syn_packets,
            'bidirectional_cwr_packets': flow.bidirectional_cwr_packets,
            'bidirectional_ece_packets': flow.bidirectional_ece_packets,
            'bidirectional_urg_packets': flow.bidirectional_urg_packets,
            'bidirectional_ack_packets': flow.bidirectional_ack_packets,
            'bidirectional_psh_packets': flow.bidirectional_psh_packets,
            'bidirectional_rst_packets': flow.bidirectional_rst_packets,
            'bidirectional_fin_packets': flow.bidirectional_fin_packets,
        }
        
        flows.append(flow_dict)
    
    print(f"\nTotal flows extracted: {flow_count}")
    
    # Create DataFrame
    df = pd.DataFrame(flows)
    
    # Save to CSV if requested
    if output_csv:
        df.to_csv(output_csv, index=False)
        print(f"Features saved to {output_csv}")
    
    return df


def prepare_for_training(df, label_column='Label'):
    """
    Prepare extracted features for model training
    
    Args:
        df: DataFrame with NetFlow features
        label_column: Name of the label column (if exists)
        
    Returns:
        X: Feature matrix
        y: Labels (if label column exists)
    """
    # Remove IP addresses and ports (not useful as features)
    feature_df = df.drop(columns=['src_ip', 'dst_ip', 'src_port', 'dst_port'], errors='ignore')
    
    # Check if labels exist
    if label_column in feature_df.columns:
        y = feature_df[label_column]
        X = feature_df.drop(columns=[label_column])
    else:
        X = feature_df
        y = None
    
    # Handle missing values
    X = X.fillna(0)
    X = X.replace([np.inf, -np.inf], 0)
    
    print(f"\nFeatures prepared:")
    print(f"  Shape: {X.shape}")
    print(f"  Features: {X.shape[1]}")
    
    return X.values, y


def process_pcap_for_nids(pcap_file, output_csv='netflow_features.csv'):
    """
    Complete pipeline: pcap -> NetFlow features -> ready for NIDS training
    
    Args:
        pcap_file: Path to pcap file
        output_csv: Output CSV file path
    """
    print("="*60)
    print("NFStream PCAP Processing for NIDS")
    print("="*60)
    
    # Extract features
    df = extract_netflow_features(pcap_file, output_csv)
    
    # Display sample
    print("\nSample of extracted features:")
    print(df.head())
    
    print("\nFeature statistics:")
    print(df.describe())
    
    return df


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Extract NetFlow features from pcap using nfstream',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process pcap file and save features
  python nfstream_integration.py capture.pcap -o features.csv
  
  # Process multiple pcap files
  python nfstream_integration.py traffic1.pcap traffic2.pcap
  
  # After extraction, train a model:
  python ../train_netflow.py features.csv
        """
    )
    
    parser.add_argument(
        'pcap_files',
        nargs='+',
        help='Path to pcap file(s) to process'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output CSV file for features',
        default='netflow_features.csv'
    )
    
    args = parser.parse_args()
    
    # Process each pcap file
    all_dfs = []
    for pcap_file in args.pcap_files:
        if not os.path.exists(pcap_file):
            print(f"Error: File not found: {pcap_file}")
            continue
        
        print(f"\nProcessing: {pcap_file}")
        df = extract_netflow_features(pcap_file)
        all_dfs.append(df)
    
    # Combine all DataFrames
    if all_dfs:
        combined_df = pd.concat(all_dfs, ignore_index=True)
        combined_df.to_csv(args.output, index=False)
        
        print("\n" + "="*60)
        print("Processing Complete!")
        print("="*60)
        print(f"Total flows: {len(combined_df)}")
        print(f"Features saved to: {args.output}")
        print(f"\nNext step: Train a model with:")
        print(f"  python train_netflow.py {args.output}")
        print("="*60)
    else:
        print("\nNo pcap files were processed successfully.")


if __name__ == '__main__':
    main()
