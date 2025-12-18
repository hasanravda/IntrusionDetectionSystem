from scapy.all import sniff, IP, TCP, UDP, ICMP
import time

def packet_handler(packet):
    if IP not in packet:
        return

    timestamp = time.strftime("%H:%M:%S")
    src_ip = packet[IP].src
    dst_ip = packet[IP].dst
    pkt_len = len(packet)

    protocol = "OTHER"
    sport = "-"
    dport = "-"
    flags = "-"

    if TCP in packet:
        protocol = "TCP"
        sport = packet[TCP].sport
        dport = packet[TCP].dport
        flags = packet[TCP].flags
    elif UDP in packet:
        protocol = "UDP"
        sport = packet[UDP].sport
        dport = packet[UDP].dport
    elif ICMP in packet:
        protocol = "ICMP"

    print(
        f"[{timestamp}] "
        f"{src_ip} -> {dst_ip} | "
        f"PROTO={protocol} | "
        f"SPORT={sport} | "
        f"DPORT={dport} | "
        f"LEN={pkt_len} | "
        f"FLAGS={flags}"
    )

print("Live packet inspection started...")
sniff(prn=packet_handler, store=False)