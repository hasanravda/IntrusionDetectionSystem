"""
Analytics Module
Statistics and visualization for NIDS
"""

import logging
from datetime import datetime, timedelta
from collections import defaultdict
import json
import os

logger = logging.getLogger(__name__)


class Analytics:
    """Analytics and statistics for NIDS"""
    
    def __init__(self):
        """Initialize analytics"""
        self.protocol_stats = defaultdict(int)
        self.hourly_traffic = defaultdict(int)
        self.alert_severity_count = defaultdict(int)
        self.top_sources = defaultdict(int)
        self.top_destinations = defaultdict(int)
        
    def update_traffic_stats(self, packet_info):
        """
        Update traffic statistics
        
        Args:
            packet_info: Packet information dictionary
        """
        try:
            # Protocol statistics
            protocol = packet_info.get('protocol', 'Unknown')
            self.protocol_stats[protocol] += 1
            
            # Hourly traffic
            timestamp = datetime.now()
            hour_key = timestamp.strftime('%Y-%m-%d %H:00')
            self.hourly_traffic[hour_key] += 1
            
            # Source/Destination statistics
            src_ip = packet_info.get('src_ip')
            dst_ip = packet_info.get('dst_ip')
            
            if src_ip:
                self.top_sources[src_ip] += 1
            if dst_ip:
                self.top_destinations[dst_ip] += 1
                
        except Exception as e:
            logger.error(f"Error updating traffic stats: {e}")
            
    def update_alert_stats(self, alert):
        """
        Update alert statistics
        
        Args:
            alert: Alert dictionary
        """
        try:
            severity = alert.get('severity', 'UNKNOWN')
            self.alert_severity_count[severity] += 1
            
        except Exception as e:
            logger.error(f"Error updating alert stats: {e}")
            
    def get_protocol_distribution(self):
        """Get protocol distribution"""
        return dict(self.protocol_stats)
        
    def get_hourly_traffic(self, hours=24):
        """
        Get hourly traffic for last N hours
        
        Args:
            hours: Number of hours to retrieve
            
        Returns:
            dict: Hourly traffic data
        """
        now = datetime.now()
        result = {}
        
        for i in range(hours):
            hour_time = now - timedelta(hours=i)
            hour_key = hour_time.strftime('%Y-%m-%d %H:00')
            result[hour_key] = self.hourly_traffic.get(hour_key, 0)
            
        return result
        
    def get_alert_severity_distribution(self):
        """Get alert severity distribution"""
        return dict(self.alert_severity_count)
        
    def get_top_sources(self, limit=10):
        """
        Get top source IPs
        
        Args:
            limit: Number of top sources to return
            
        Returns:
            list: Top source IPs with counts
        """
        sorted_sources = sorted(
            self.top_sources.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_sources[:limit]
        
    def get_top_destinations(self, limit=10):
        """
        Get top destination IPs
        
        Args:
            limit: Number of top destinations to return
            
        Returns:
            list: Top destination IPs with counts
        """
        sorted_destinations = sorted(
            self.top_destinations.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_destinations[:limit]
        
    def generate_report(self):
        """
        Generate comprehensive analytics report
        
        Returns:
            dict: Analytics report
        """
        report = {
            'timestamp': datetime.now().isoformat(),
            'protocol_distribution': self.get_protocol_distribution(),
            'hourly_traffic': self.get_hourly_traffic(),
            'alert_severity_distribution': self.get_alert_severity_distribution(),
            'top_sources': self.get_top_sources(),
            'top_destinations': self.get_top_destinations(),
        }
        
        return report
        
    def save_report(self, filename='analytics_report.json'):
        """
        Save analytics report to file
        
        Args:
            filename: Output filename
        """
        try:
            os.makedirs('logs', exist_ok=True)
            filepath = os.path.join('logs', filename)
            
            report = self.generate_report()
            
            with open(filepath, 'w') as f:
                json.dump(report, f, indent=2)
                
            logger.info(f"Analytics report saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving report: {e}")
            
    def print_summary(self):
        """Print analytics summary to console"""
        try:
            print("\n" + "="*60)
            print("NETWORK TRAFFIC ANALYTICS SUMMARY")
            print("="*60)
            
            # Protocol distribution
            print("\nProtocol Distribution:")
            for protocol, count in sorted(self.protocol_stats.items(), 
                                         key=lambda x: x[1], reverse=True):
                print(f"  {protocol}: {count}")
                
            # Alert severity
            if self.alert_severity_count:
                print("\nAlert Severity Distribution:")
                for severity, count in sorted(self.alert_severity_count.items(),
                                             key=lambda x: x[1], reverse=True):
                    print(f"  {severity}: {count}")
                    
            # Top sources
            top_sources = self.get_top_sources(5)
            if top_sources:
                print("\nTop 5 Source IPs:")
                for ip, count in top_sources:
                    print(f"  {ip}: {count} packets")
                    
            # Top destinations
            top_destinations = self.get_top_destinations(5)
            if top_destinations:
                print("\nTop 5 Destination IPs:")
                for ip, count in top_destinations:
                    print(f"  {ip}: {count} packets")
                    
            print("="*60 + "\n")
            
        except Exception as e:
            logger.error(f"Error printing summary: {e}")
