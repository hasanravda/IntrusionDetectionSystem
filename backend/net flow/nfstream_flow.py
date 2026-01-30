from nfstream import NFStreamer
import pandas as pd

PCAP_FILE = "traffic.pcap"
OUTPUT_CSV = "flow_features.csv"


def main():
    print("[*] Starting NFStream flow extraction...")

    streamer = NFStreamer(
        source=PCAP_FILE,
    )

    flows = []

    for flow in streamer:
        flow_dict = {}
        for k in flow.__slots__:
            if hasattr(flow, k):
                flow_dict[k] = getattr(flow, k)
        flows.append(flow_dict)

    df = pd.DataFrame(flows)
    df.to_csv(OUTPUT_CSV, index=False)

    print("[DONE] Flow features saved to", OUTPUT_CSV)


if __name__ == "__main__":
    main()
