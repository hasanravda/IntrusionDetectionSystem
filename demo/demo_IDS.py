from scapy.all import sniff, IP, TCP, UDP
from collections import defaultdict
import time

packet_count = defaultdict(int)
port_access = defaultdict(set)

ATTACK_PACKET_THRESHOLD = 100
PORT_SCAN_THRESHOLD = 20

def packet_handler(packet):
    if IP in packet:
        src = packet[IP].src
        packet_count[src] += 1

        # TCP / UDP ports
        if TCP in packet:
            dport = packet[TCP].dport
            port_access[src].add(dport)
        elif UDP in packet:
            dport = packet[UDP].dport
            port_access[src].add(dport)

        # 🚨 Flood detection
        if packet_count[src] > ATTACK_PACKET_THRESHOLD:
            print("ALERT: Possible DoS attack from", src)

        # 🚨 Port scan detection
        if len(port_access[src]) > PORT_SCAN_THRESHOLD:
            print("ALERT: Possible Port Scan from", src)

print("IDS live monitoring started...")
sniff(prn=packet_handler, store=False)
