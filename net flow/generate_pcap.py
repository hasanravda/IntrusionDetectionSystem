from scapy.all import sniff, IP, TCP, UDP, ICMP, wrpcap
import time

print("Capturing packets...")
packets = sniff(timeout=60)   # capture for 60 seconds
    
wrpcap("traffic.pcap", packets)
print("PCAP saved as traffic.pcap")