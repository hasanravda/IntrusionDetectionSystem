def raise_alert(alert):
    msg = (
        f"[ALERT] {time.ctime(alert['timestamp'])} | "
        f"Source: {alert['src_ip']} | "
        f"Attack: {alert['attack_type']} | "
        f"Flows: {alert['count']} | "
        f"Confidence: {alert['confidence']}"
    )

    print(msg)

    # Save to log file
    with open("alerts.log", "a") as f:
        f.write(msg + "\n")
