#!/usr/bin/env python3
"""
Network Intrusion Detection System (NIDS)
Main application entry point
"""

import argparse
import logging
import sys
import time
import signal
from queue import Queue
from colorama import init, Fore, Style
from prettytable import PrettyTable

from nids.config import Config
from nids.packet_capture import PacketCapture
from nids.detection_engine import DetectionEngine
from nids.intrusion_prevention import IntrusionPrevention
from nids.analytics import Analytics

# Initialize colorama for cross-platform color support
# (Particularly needed for Windows terminal)
init()

# Global flag for graceful shutdown
running = True


def signal_handler(sig, frame):
    """Handle interrupt signal"""
    global running
    print("\n\nShutting down NIDS...")
    running = False


def setup_logging(config):
    """Setup logging configuration"""
    log_level = getattr(logging, config.get('logging', 'level', 'INFO'))
    log_file = config.get('logging', 'file', 'logs/nids.log')
    
    # Create logs directory
    import os
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # Configure logging
    handlers = []
    
    # File handler
    handlers.append(logging.FileHandler(log_file))
    
    # Console handler
    if config.get('logging', 'console', True):
        handlers.append(logging.StreamHandler())
    
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=handlers
    )


def print_banner():
    """Print NIDS banner"""
    banner = f"""
{Fore.CYAN}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Network Intrusion Detection System (NIDS)              ║
║   Real-time ML-based Network Security Monitoring         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝{Style.RESET_ALL}
"""
    print(banner)


def print_status(capture, detection, prevention, analytics):
    """Print system status"""
    print(f"\n{Fore.GREEN}[STATUS]{Style.RESET_ALL} NIDS is running...")
    print(f"  Packets Captured: {capture.get_packet_count()}")
    
    stats = detection.get_stats()
    print(f"  Total Analyzed: {stats['total_packets']}")
    print(f"  Normal Traffic: {Fore.GREEN}{stats['normal_packets']}{Style.RESET_ALL}")
    print(f"  Malicious Traffic: {Fore.RED}{stats['malicious_packets']}{Style.RESET_ALL}")
    print(f"  Alerts Generated: {Fore.YELLOW}{stats['alerts_generated']}{Style.RESET_ALL}")
    
    blocked_ips = prevention.get_blocked_ips()
    print(f"  Blocked IPs: {len(blocked_ips)}")


def run_interactive_mode(config):
    """Run NIDS in interactive mode"""
    global running
    
    logger = logging.getLogger(__name__)
    
    print_banner()
    print(f"{Fore.YELLOW}Starting NIDS in interactive mode...{Style.RESET_ALL}\n")
    
    # Initialize components
    packet_queue = Queue()
    
    # Packet capture
    interface = config.get('network', 'interface')
    bpf_filter = config.get('network', 'bpf_filter')
    capture = PacketCapture(interface=interface, packet_queue=packet_queue)
    
    # Detection engine
    model_path = config.get('detection', 'model_path')
    threshold = config.get('detection', 'threshold')
    detection = DetectionEngine(model_path=model_path, threshold=threshold)
    
    # Intrusion prevention
    auto_block = config.get('prevention', 'auto_block')
    block_threshold = config.get('prevention', 'block_threshold')
    prevention = IntrusionPrevention(
        auto_block=auto_block,
        block_threshold=block_threshold
    )
    
    # Analytics
    analytics = Analytics()
    
    # Setup signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Start capture
        print(f"{Fore.GREEN}[+]{Style.RESET_ALL} Starting packet capture...")
        capture.start_capture(filter_str=bpf_filter)
        
        # Start detection
        print(f"{Fore.GREEN}[+]{Style.RESET_ALL} Starting detection engine...")
        detection.start(packet_queue)
        
        print(f"{Fore.GREEN}[+]{Style.RESET_ALL} NIDS is now monitoring network traffic")
        print(f"{Fore.YELLOW}[*]{Style.RESET_ALL} Press Ctrl+C to stop\n")
        
        last_status_time = time.time()
        last_analytics_time = time.time()
        status_interval = 10  # seconds
        analytics_interval = config.get('analytics', 'report_interval', 300)
        
        # Main loop
        while running:
            # Process alerts
            while not detection.alert_queue.empty():
                alert = detection.alert_queue.get()
                
                # Update analytics
                analytics.update_alert_stats(alert)
                
                # Process for prevention
                if prevention.process_alert(alert):
                    print(f"{Fore.RED}[BLOCKED]{Style.RESET_ALL} IP {alert['source_ip']} has been blocked")
            
            # Print status periodically
            current_time = time.time()
            if current_time - last_status_time >= status_interval:
                print_status(capture, detection, prevention, analytics)
                last_status_time = current_time
            
            # Generate analytics report periodically
            if config.get('analytics', 'enable') and \
               current_time - last_analytics_time >= analytics_interval:
                analytics.save_report()
                last_analytics_time = current_time
            
            time.sleep(1)
            
    except KeyboardInterrupt:
        pass
    except Exception as e:
        logger.error(f"Error in main loop: {e}")
        print(f"{Fore.RED}[ERROR]{Style.RESET_ALL} {e}")
    finally:
        # Cleanup
        print(f"\n{Fore.YELLOW}[*]{Style.RESET_ALL} Stopping NIDS components...")
        
        capture.stop_capture()
        detection.stop()
        
        print(f"{Fore.GREEN}[+]{Style.RESET_ALL} Generating final analytics report...")
        analytics.print_summary()
        analytics.save_report(filename='final_report.json')
        
        print(f"\n{Fore.GREEN}[+]{Style.RESET_ALL} NIDS stopped successfully")


def run_training_mode(dataset_path, model_path):
    """Run NIDS in training mode"""
    print_banner()
    print(f"{Fore.YELLOW}Training mode: This feature requires UQ-NIDS dataset{Style.RESET_ALL}\n")
    print(f"Please provide the dataset in CSV format with features and labels.")
    print(f"Dataset path: {dataset_path}")
    print(f"Model will be saved to: {model_path}\n")
    
    # This would be implemented with actual dataset loading
    print(f"{Fore.RED}[ERROR]{Style.RESET_ALL} Training mode not fully implemented.")
    print(f"Please prepare your dataset and use the ML model training scripts.")


def show_status(config):
    """Show current NIDS status"""
    print_banner()
    
    # Show configuration
    print(f"{Fore.CYAN}Configuration:{Style.RESET_ALL}")
    print(f"  Interface: {config.get('network', 'interface') or 'All'}")
    print(f"  Detection Threshold: {config.get('detection', 'threshold')}")
    print(f"  Auto-blocking: {'Enabled' if config.get('prevention', 'auto_block') else 'Disabled'}")
    
    # Show recent alerts
    from nids.detection_engine import DetectionEngine
    detection = DetectionEngine()
    alerts = detection.get_alerts(count=5)
    
    if alerts:
        print(f"\n{Fore.CYAN}Recent Alerts:{Style.RESET_ALL}")
        table = PrettyTable(['ID', 'Time', 'Severity', 'Source IP', 'Destination IP'])
        for alert in alerts[-5:]:
            table.add_row([
                alert['alert_id'],
                alert['timestamp'][:19],
                alert['severity'],
                alert['source_ip'],
                alert['destination_ip']
            ])
        print(table)
    else:
        print(f"\n{Fore.GREEN}No recent alerts{Style.RESET_ALL}")
    
    # Show blocked IPs
    from nids.intrusion_prevention import IntrusionPrevention
    prevention = IntrusionPrevention()
    blocked_ips = prevention.get_blocked_ips()
    
    if blocked_ips:
        print(f"\n{Fore.CYAN}Blocked IPs:{Style.RESET_ALL}")
        for ip in blocked_ips:
            print(f"  - {ip}")
    else:
        print(f"\n{Fore.GREEN}No blocked IPs{Style.RESET_ALL}")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Network Intrusion Detection System (NIDS)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with default settings
  python main.py
  
  # Run with custom interface
  python main.py -i eth0
  
  # Enable auto-blocking
  python main.py --auto-block
  
  # Run in training mode
  python main.py --train --dataset data/uq_nids.csv
  
  # Show system status
  python main.py --status
        """
    )
    
    parser.add_argument(
        '-i', '--interface',
        help='Network interface to monitor (default: all interfaces)',
        default=None
    )
    
    parser.add_argument(
        '-c', '--config',
        help='Path to configuration file',
        default='config.json'
    )
    
    parser.add_argument(
        '--auto-block',
        action='store_true',
        help='Enable automatic IP blocking'
    )
    
    parser.add_argument(
        '--threshold',
        type=float,
        help='Detection threshold (0-1)',
        default=None
    )
    
    parser.add_argument(
        '--train',
        action='store_true',
        help='Run in training mode'
    )
    
    parser.add_argument(
        '--dataset',
        help='Path to training dataset (for training mode)',
        default='data/uq_nids.csv'
    )
    
    parser.add_argument(
        '--status',
        action='store_true',
        help='Show current NIDS status'
    )
    
    args = parser.parse_args()
    
    # Load configuration
    config = Config(args.config)
    
    # Override config with command line arguments
    if args.interface:
        config.set('network', 'interface', args.interface)
    
    if args.auto_block:
        config.set('prevention', 'auto_block', True)
    
    if args.threshold:
        config.set('detection', 'threshold', args.threshold)
    
    # Setup logging
    setup_logging(config)
    
    # Run appropriate mode
    if args.status:
        show_status(config)
    elif args.train:
        model_path = config.get('detection', 'model_path')
        run_training_mode(args.dataset, model_path)
    else:
        run_interactive_mode(config)


if __name__ == '__main__':
    main()
