#!/usr/bin/env python3
"""
Example: Packet Inspection and Analysis

This example shows how to perform detailed inspection
and analysis of individual network packets.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scapy.all import sniff, IP, TCP, UDP, ICMP
from nids.feature_extraction import FeatureExtractor
from nids.packet_capture import extract_packet_info
import json


def detailed_packet_analysis(packet):
    """Perform detailed analysis of a packet"""
    print("\n" + "="*60)
    print("PACKET ANALYSIS")
    print("="*60)
    
    # Basic packet info
    info = extract_packet_info(packet)
    print("\nBasic Information:")
    print(f"  Timestamp: {info['timestamp']}")
    print(f"  Length: {info['length']} bytes")
    print(f"  Protocol: {info['protocol']}")
    
    # IP layer analysis
    if IP in packet:
        ip = packet[IP]
        print("\nIP Layer:")
        print(f"  Source: {ip.src}")
        print(f"  Destination: {ip.dst}")
        print(f"  TTL: {ip.ttl}")
        print(f"  Protocol: {ip.proto}")
        print(f"  Flags: {ip.flags}")
        print(f"  Fragment Offset: {ip.frag}")
        print(f"  Header Length: {ip.ihl * 4} bytes")
        print(f"  Total Length: {ip.len} bytes")
        
        # TCP layer analysis
        if TCP in packet:
            tcp = packet[TCP]
            print("\nTCP Layer:")
            print(f"  Source Port: {tcp.sport}")
            print(f"  Destination Port: {tcp.dport}")
            print(f"  Sequence Number: {tcp.seq}")
            print(f"  Acknowledgment: {tcp.ack}")
            print(f"  Flags: {tcp.flags}")
            print(f"  Window Size: {tcp.window}")
            print(f"  Checksum: {hex(tcp.chksum)}")
            print(f"  Urgent Pointer: {tcp.urgptr}")
            
            # TCP flags breakdown
            flags = str(tcp.flags)
            print(f"\n  TCP Flags Breakdown:")
            print(f"    FIN: {'Yes' if 'F' in flags else 'No'}")
            print(f"    SYN: {'Yes' if 'S' in flags else 'No'}")
            print(f"    RST: {'Yes' if 'R' in flags else 'No'}")
            print(f"    PSH: {'Yes' if 'P' in flags else 'No'}")
            print(f"    ACK: {'Yes' if 'A' in flags else 'No'}")
            print(f"    URG: {'Yes' if 'U' in flags else 'No'}")
            
            # Payload
            if tcp.payload:
                payload_len = len(tcp.payload)
                print(f"\n  Payload: {payload_len} bytes")
                if payload_len > 0 and payload_len < 100:
                    print(f"  Data (hex): {bytes(tcp.payload)[:50].hex()}")
        
        # UDP layer analysis
        elif UDP in packet:
            udp = packet[UDP]
            print("\nUDP Layer:")
            print(f"  Source Port: {udp.sport}")
            print(f"  Destination Port: {udp.dport}")
            print(f"  Length: {udp.len}")
            print(f"  Checksum: {hex(udp.chksum)}")
            
            if udp.payload:
                payload_len = len(udp.payload)
                print(f"\n  Payload: {payload_len} bytes")
        
        # ICMP layer analysis
        elif ICMP in packet:
            icmp = packet[ICMP]
            print("\nICMP Layer:")
            print(f"  Type: {icmp.type}")
            print(f"  Code: {icmp.code}")
            print(f"  Checksum: {hex(icmp.chksum)}")
    
    # Feature extraction for ML
    extractor = FeatureExtractor()
    features = extractor.extract_features(packet)
    feature_names = extractor.get_feature_names()
    
    print("\nExtracted ML Features:")
    for name, value in zip(feature_names[:10], features[:10]):
        print(f"  {name:20} {value}")
    print(f"  ... ({len(features)} features total)")
    
    print("="*60)


def main():
    print("="*60)
    print("Packet Inspection and Analysis Example")
    print("="*60)
    print("\nCapturing packets for detailed analysis...")
    print("Note: Requires root/sudo privileges")
    print("Will analyze first 5 packets, then stop\n")
    
    packet_count = 0
    max_packets = 5
    
    def packet_handler(packet):
        nonlocal packet_count
        packet_count += 1
        
        print(f"\n>>> Analyzing Packet #{packet_count}")
        detailed_packet_analysis(packet)
        
        if packet_count >= max_packets:
            return True  # Stop sniffing
    
    try:
        # Capture and analyze packets
        sniff(prn=packet_handler, count=max_packets, store=False)
        
        print(f"\n{'='*60}")
        print(f"Analysis complete. Inspected {packet_count} packets.")
        print(f"{'='*60}")
        
    except PermissionError:
        print("\n❌ Error: Packet capture requires root privileges")
        print("Run with: sudo python3 packet_inspection.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == '__main__':
    main()
