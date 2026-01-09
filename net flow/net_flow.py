from scapy.all import rdpcap, IP, TCP, UDP
from collections import defaultdict
import pandas as pd
import numpy as np

# ==============================
# CONFIG
# ==============================
PCAP_FILE = "traffic.pcap"
OUTPUT_CSV = "flow_features.csv"
FLOW_TIMEOUT = 120  # seconds (not strictly needed for offline PCAP)

# ==============================
# FLOW KEY (5-TUPLE)
# ==============================
def get_flow_key(pkt):
    if IP not in pkt:
        return None

    if TCP in pkt:
        proto = "TCP"
        sport = pkt[TCP].sport
        dport = pkt[TCP].dport
    elif UDP in pkt:
        proto = "UDP"
        sport = pkt[UDP].sport
        dport = pkt[UDP].dport
    else:
        return None

    return (
        pkt[IP].src,
        pkt[IP].dst,
        sport,
        dport,
        proto
    )

# ==============================
# FEATURE EXTRACTION
# ==============================
def extract_flow_features(packets):
    times = [pkt.time for pkt in packets]
    sizes = [len(pkt) for pkt in packets]

    start_time = min(times)
    end_time = max(times)
    duration = end_time - start_time if len(times) > 1 else 0

    total_packets = len(packets)
    total_bytes = sum(sizes)

    pkt_rate = total_packets / duration if duration > 0 else 0
    byte_rate = total_bytes / duration if duration > 0 else 0

    # TCP Flags
    syn = ack = fin = rst = psh = urg = 0

    for pkt in packets:
        if TCP in pkt:
            flags = pkt[TCP].flags
            syn += int(flags & 0x02 != 0)
            ack += int(flags & 0x10 != 0)
            fin += int(flags & 0x01 != 0)
            rst += int(flags & 0x04 != 0)
            psh += int(flags & 0x08 != 0)
            urg += int(flags & 0x20 != 0)

    return {
        "Flow Duration": duration,
        "Total Packets": total_packets,
        "Total Bytes": total_bytes,
        "Packets/s": pkt_rate,
        "Bytes/s": byte_rate,
        "Packet Length Mean": np.mean(sizes),
        "Packet Length Std": np.std(sizes),
        "Packet Length Min": np.min(sizes),
        "Packet Length Max": np.max(sizes),
        "SYN Flag Count": syn,
        "ACK Flag Count": ack,
        "FIN Flag Count": fin,
        "RST Flag Count": rst,
        "PSH Flag Count": psh,
        "URG Flag Count": urg
    }

# ==============================
# MAIN
# ==============================
def main():
    print("[*] Reading PCAP...")
    packets = rdpcap(PCAP_FILE)

    flows = defaultdict(list)

    print("[*] Creating flows...")
    for pkt in packets:
        key = get_flow_key(pkt)
        if key:
            flows[key].append(pkt)

    print(f"[*] Total flows created: {len(flows)}")

    records = []

    print("[*] Extracting features...")
    for flow_key, pkts in flows.items():
        features = extract_flow_features(pkts)

        record = {
            "Src IP": flow_key[0],
            "Dst IP": flow_key[1],
            "Src Port": flow_key[2],
            "Dst Port": flow_key[3],
            "Protocol": flow_key[4],
            **features
        }

        records.append(record)

    df = pd.DataFrame(records)
    df.to_csv(OUTPUT_CSV, index=False)

    print(f"[OK] Flow features saved to {OUTPUT_CSV}")


# ==============================
if __name__ == "__main__":
    main()
# -> flow generater, flow stored as csv file.