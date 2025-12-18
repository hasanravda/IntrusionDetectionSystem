#!/usr/bin/env python3
"""
Alert Viewer Utility
View and analyze NIDS alerts
"""

import json
import os
import argparse
from datetime import datetime
from prettytable import PrettyTable
from colorama import Fore, Style, init

init()


def load_alerts(alert_file='alerts/alerts.json'):
    """Load alerts from file"""
    if not os.path.exists(alert_file):
        print(f"{Fore.YELLOW}No alerts file found at {alert_file}{Style.RESET_ALL}")
        return []
    
    try:
        with open(alert_file, 'r') as f:
            alerts = json.load(f)
        return alerts
    except Exception as e:
        print(f"{Fore.RED}Error loading alerts: {e}{Style.RESET_ALL}")
        return []


def load_block_history(history_file='alerts/block_history.json'):
    """Load block history from file"""
    if not os.path.exists(history_file):
        return []
    
    try:
        with open(history_file, 'r') as f:
            history = json.load(f)
        return history
    except Exception as e:
        print(f"{Fore.RED}Error loading block history: {e}{Style.RESET_ALL}")
        return []


def display_alerts(alerts, limit=None, severity_filter=None):
    """Display alerts in a table"""
    if not alerts:
        print(f"{Fore.GREEN}No alerts to display{Style.RESET_ALL}")
        return
    
    # Filter by severity if specified
    if severity_filter:
        alerts = [a for a in alerts if a.get('severity') == severity_filter.upper()]
    
    # Apply limit
    if limit:
        alerts = alerts[-limit:]
    
    # Create table
    table = PrettyTable()
    table.field_names = ['ID', 'Time', 'Severity', 'Source IP', 'Dest IP', 'Protocol', 'Confidence']
    
    # Color mapping for severity
    severity_colors = {
        'CRITICAL': Fore.RED,
        'HIGH': Fore.LIGHTRED_EX,
        'MEDIUM': Fore.YELLOW,
        'LOW': Fore.LIGHTYELLOW_EX
    }
    
    for alert in alerts:
        severity = alert.get('severity', 'UNKNOWN')
        color = severity_colors.get(severity, Fore.WHITE)
        
        table.add_row([
            alert.get('alert_id', 'N/A'),
            alert.get('timestamp', 'N/A')[:19],
            f"{color}{severity}{Style.RESET_ALL}",
            alert.get('source_ip', 'N/A'),
            alert.get('destination_ip', 'N/A'),
            alert.get('protocol', 'N/A'),
            f"{alert.get('probability', 0):.2%}"
        ])
    
    print(f"\n{Fore.CYAN}Alerts ({len(alerts)} total){Style.RESET_ALL}")
    print(table)


def display_alert_details(alerts, alert_id):
    """Display detailed information for a specific alert"""
    alert = next((a for a in alerts if a.get('alert_id') == alert_id), None)
    
    if not alert:
        print(f"{Fore.RED}Alert #{alert_id} not found{Style.RESET_ALL}")
        return
    
    severity_colors = {
        'CRITICAL': Fore.RED,
        'HIGH': Fore.LIGHTRED_EX,
        'MEDIUM': Fore.YELLOW,
        'LOW': Fore.LIGHTYELLOW_EX
    }
    
    severity = alert.get('severity', 'UNKNOWN')
    color = severity_colors.get(severity, Fore.WHITE)
    
    print(f"\n{Fore.CYAN}Alert Details - #{alert_id}{Style.RESET_ALL}")
    print("="*60)
    print(f"Timestamp:        {alert.get('timestamp', 'N/A')}")
    print(f"Severity:         {color}{severity}{Style.RESET_ALL}")
    print(f"Confidence:       {alert.get('probability', 0):.2%}")
    print(f"Description:      {alert.get('description', 'N/A')}")
    print(f"\nNetwork Information:")
    print(f"  Source IP:      {alert.get('source_ip', 'N/A')}")
    print(f"  Source Port:    {alert.get('source_port', 'N/A')}")
    print(f"  Dest IP:        {alert.get('destination_ip', 'N/A')}")
    print(f"  Dest Port:      {alert.get('destination_port', 'N/A')}")
    print(f"  Protocol:       {alert.get('protocol', 'N/A')}")
    print(f"  Packet Length:  {alert.get('packet_length', 'N/A')}")
    print("="*60)


def display_statistics(alerts):
    """Display alert statistics"""
    if not alerts:
        print(f"{Fore.GREEN}No alerts to analyze{Style.RESET_ALL}")
        return
    
    # Count by severity
    severity_counts = {}
    for alert in alerts:
        severity = alert.get('severity', 'UNKNOWN')
        severity_counts[severity] = severity_counts.get(severity, 0) + 1
    
    # Count by source IP
    source_ips = {}
    for alert in alerts:
        ip = alert.get('source_ip', 'Unknown')
        source_ips[ip] = source_ips.get(ip, 0) + 1
    
    # Top source IPs
    top_sources = sorted(source_ips.items(), key=lambda x: x[1], reverse=True)[:5]
    
    print(f"\n{Fore.CYAN}Alert Statistics{Style.RESET_ALL}")
    print("="*60)
    print(f"Total Alerts:     {len(alerts)}")
    print(f"\nBy Severity:")
    for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        count = severity_counts.get(severity, 0)
        if count > 0:
            print(f"  {severity:12} {count}")
    
    print(f"\nTop Source IPs:")
    for ip, count in top_sources:
        print(f"  {ip:20} {count} alerts")
    
    print("="*60)


def display_block_history(history):
    """Display IP blocking history"""
    if not history:
        print(f"{Fore.GREEN}No blocked IPs in history{Style.RESET_ALL}")
        return
    
    table = PrettyTable()
    table.field_names = ['IP Address', 'Time', 'Severity', 'Alert Count', 'Method']
    
    for record in history:
        table.add_row([
            record.get('ip', 'N/A'),
            record.get('timestamp', 'N/A')[:19],
            record.get('severity', 'N/A'),
            record.get('alert_count', 0),
            record.get('method', 'N/A')
        ])
    
    print(f"\n{Fore.CYAN}Blocked IPs History ({len(history)} total){Style.RESET_ALL}")
    print(table)


def main():
    parser = argparse.ArgumentParser(
        description='View and analyze NIDS alerts',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '-f', '--file',
        default='alerts/alerts.json',
        help='Path to alerts file (default: alerts/alerts.json)'
    )
    
    parser.add_argument(
        '-l', '--limit',
        type=int,
        help='Limit number of alerts displayed'
    )
    
    parser.add_argument(
        '-s', '--severity',
        choices=['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        help='Filter by severity level'
    )
    
    parser.add_argument(
        '-d', '--detail',
        type=int,
        metavar='ALERT_ID',
        help='Show detailed information for specific alert ID'
    )
    
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show alert statistics'
    )
    
    parser.add_argument(
        '--blocked',
        action='store_true',
        help='Show blocked IPs history'
    )
    
    args = parser.parse_args()
    
    # Load alerts
    alerts = load_alerts(args.file)
    
    # Display based on arguments
    if args.blocked:
        history = load_block_history()
        display_block_history(history)
    elif args.detail:
        display_alert_details(alerts, args.detail)
    elif args.stats:
        display_statistics(alerts)
    else:
        display_alerts(alerts, limit=args.limit, severity_filter=args.severity)


if __name__ == '__main__':
    main()
