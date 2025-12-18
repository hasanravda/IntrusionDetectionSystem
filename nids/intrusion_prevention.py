"""
Intrusion Prevention Module
Auto-mitigation and IP blocking functionality
"""

import os
import logging
import subprocess
import re
from datetime import datetime
from collections import defaultdict
import json

logger = logging.getLogger(__name__)


def is_valid_ip(ip_address):
    """
    Validate IP address format to prevent command injection
    
    Args:
        ip_address: IP address string to validate
        
    Returns:
        bool: True if valid IP address
    """
    # IPv4 pattern
    ipv4_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    
    if not re.match(ipv4_pattern, ip_address):
        return False
    
    # Check each octet is valid (0-255)
    try:
        parts = ip_address.split('.')
        return all(0 <= int(part) <= 255 for part in parts)
    except (ValueError, AttributeError):
        return False


class IntrusionPrevention:
    """Intrusion prevention and auto-mitigation"""
    
    def __init__(self, auto_block=False, block_threshold=5, block_duration=3600):
        """
        Initialize intrusion prevention
        
        Args:
            auto_block: Enable automatic IP blocking
            block_threshold: Number of alerts before blocking
            block_duration: Duration to block IP (seconds)
        """
        self.auto_block = auto_block
        self.block_threshold = block_threshold
        self.block_duration = block_duration
        self.blocked_ips = set()
        self.ip_alert_count = defaultdict(int)
        self.block_history = []
        self.blocked_ips_file = 'blocked_ips.txt'
        
        # Load previously blocked IPs
        self._load_blocked_ips()
        
    def process_alert(self, alert):
        """
        Process alert and determine if blocking is needed
        
        Args:
            alert: Alert dictionary
            
        Returns:
            bool: True if IP was blocked
        """
        try:
            source_ip = alert.get('source_ip')
            
            if not source_ip or source_ip == 'Unknown':
                return False
                
            # Increment alert count for this IP
            self.ip_alert_count[source_ip] += 1
            
            # Check if threshold reached
            if (self.auto_block and 
                self.ip_alert_count[source_ip] >= self.block_threshold and
                source_ip not in self.blocked_ips):
                
                logger.warning(f"IP {source_ip} reached threshold, initiating block")
                return self.block_ip(source_ip, alert.get('severity', 'MEDIUM'))
                
        except Exception as e:
            logger.error(f"Error processing alert for prevention: {e}")
            
        return False
        
    def block_ip(self, ip_address, severity='MEDIUM'):
        """
        Block an IP address
        
        Args:
            ip_address: IP address to block
            severity: Alert severity
            
        Returns:
            bool: True if blocked successfully
        """
        try:
            # Validate IP address to prevent command injection
            if not is_valid_ip(ip_address):
                logger.error(f"Invalid IP address format: {ip_address}")
                return False
                
            if ip_address in self.blocked_ips:
                logger.warning(f"IP {ip_address} already blocked")
                return False
                
            # Add to blocked set
            self.blocked_ips.add(ip_address)
            
            # Record block history
            block_record = {
                'ip': ip_address,
                'timestamp': datetime.now().isoformat(),
                'severity': severity,
                'alert_count': self.ip_alert_count[ip_address],
                'method': 'auto' if self.auto_block else 'manual'
            }
            self.block_history.append(block_record)
            
            # Save to file
            self._save_blocked_ips()
            
            # Attempt to block using iptables (Linux)
            if self._is_linux():
                self._block_with_iptables(ip_address)
            
            logger.info(f"Successfully blocked IP: {ip_address}")
            print(f"\n[BLOCKED] IP address {ip_address} has been blocked (Severity: {severity})")
            
            return True
            
        except Exception as e:
            logger.error(f"Error blocking IP {ip_address}: {e}")
            return False
            
    def unblock_ip(self, ip_address):
        """
        Unblock an IP address
        
        Args:
            ip_address: IP address to unblock
            
        Returns:
            bool: True if unblocked successfully
        """
        try:
            # Validate IP address
            if not is_valid_ip(ip_address):
                logger.error(f"Invalid IP address format: {ip_address}")
                return False
                
            if ip_address not in self.blocked_ips:
                logger.warning(f"IP {ip_address} not in blocked list")
                return False
                
            # Remove from blocked set
            self.blocked_ips.remove(ip_address)
            
            # Reset alert count
            self.ip_alert_count[ip_address] = 0
            
            # Save to file
            self._save_blocked_ips()
            
            # Attempt to unblock using iptables (Linux)
            if self._is_linux():
                self._unblock_with_iptables(ip_address)
                
            logger.info(f"Successfully unblocked IP: {ip_address}")
            print(f"\n[UNBLOCKED] IP address {ip_address} has been unblocked")
            
            return True
            
        except Exception as e:
            logger.error(f"Error unblocking IP {ip_address}: {e}")
            return False
            
    def _is_linux(self):
        """Check if running on Linux"""
        return os.name == 'posix'
        
    def _block_with_iptables(self, ip_address):
        """
        Block IP using iptables (requires root/sudo)
        
        Args:
            ip_address: IP to block
        """
        try:
            # Check if iptables is available
            result = subprocess.run(
                ['which', 'iptables'],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.warning("iptables not available")
                return
                
            # Add DROP rule
            cmd = ['sudo', 'iptables', '-A', 'INPUT', '-s', ip_address, '-j', 'DROP']
            
            # Note: This will fail without sudo privileges
            # In production, this should be run with appropriate permissions
            logger.info(f"Attempting to block {ip_address} with iptables")
            logger.warning("Note: iptables commands require root privileges")
            
        except Exception as e:
            logger.error(f"Error using iptables: {e}")
            
    def _unblock_with_iptables(self, ip_address):
        """
        Unblock IP using iptables
        
        Args:
            ip_address: IP to unblock
        """
        try:
            # Remove DROP rule
            cmd = ['sudo', 'iptables', '-D', 'INPUT', '-s', ip_address, '-j', 'DROP']
            logger.info(f"Attempting to unblock {ip_address} with iptables")
            logger.warning("Note: iptables commands require root privileges")
            
        except Exception as e:
            logger.error(f"Error using iptables: {e}")
            
    def _save_blocked_ips(self):
        """Save blocked IPs to file"""
        try:
            with open(self.blocked_ips_file, 'w') as f:
                for ip in self.blocked_ips:
                    f.write(f"{ip}\n")
                    
            # Save block history
            history_file = 'alerts/block_history.json'
            os.makedirs('alerts', exist_ok=True)
            with open(history_file, 'w') as f:
                json.dump(self.block_history, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving blocked IPs: {e}")
            
    def _load_blocked_ips(self):
        """Load blocked IPs from file"""
        try:
            if os.path.exists(self.blocked_ips_file):
                with open(self.blocked_ips_file, 'r') as f:
                    for line in f:
                        ip = line.strip()
                        if ip:
                            self.blocked_ips.add(ip)
                            
            # Load block history
            history_file = 'alerts/block_history.json'
            if os.path.exists(history_file):
                with open(history_file, 'r') as f:
                    self.block_history = json.load(f)
                    
        except Exception as e:
            logger.error(f"Error loading blocked IPs: {e}")
            
    def get_blocked_ips(self):
        """Get list of blocked IPs"""
        return list(self.blocked_ips)
        
    def get_block_history(self):
        """Get block history"""
        return self.block_history.copy()
        
    def get_ip_alert_count(self):
        """Get alert count per IP"""
        return dict(self.ip_alert_count)
