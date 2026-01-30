class AlertEngine:
    def __init__(
        self,
        window_seconds=5,
        flow_threshold=10,
        confidence_threshold=0.7
    ):
        self.window_seconds = window_seconds
        self.flow_threshold = flow_threshold
        self.confidence_threshold = confidence_threshold

        # src_ip → timestamps of suspicious flows
        self.suspicious_flows = defaultdict(deque)

    def process_flow(self, flow_features, src_ip):
        """
        flow_features: DataFrame with ONE row (model input)
        src_ip: source IP address (string)
        """

        # ML inference
        proba = model.predict_proba(flow_features)
        pred = model.predict(flow_features)

        attack = encoder.inverse_transform(pred)[0]
        confidence = proba.max()

        # Ignore benign or low confidence
        if attack == "Benign" or confidence < self.confidence_threshold:
            return None

        now = time.time()
        timestamps = self.suspicious_flows[src_ip]

        # Add current event
        timestamps.append(now)

        # Remove old events
        while timestamps and now - timestamps[0] > self.window_seconds:
            timestamps.popleft()

        # Check alert condition
        if len(timestamps) >= self.flow_threshold:
            return {
                "timestamp": now,
                "src_ip": src_ip,
                "attack_type": attack,
                "count": len(timestamps),
                "confidence": round(confidence, 2)
            }

        return None
