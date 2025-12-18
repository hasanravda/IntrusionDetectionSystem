"""
Packet Capture Module
Handles real-time packet capture using Scapy
"""

from scapy.all import sniff, IP, TCP, UDP, ICMP, ARP
import logging
from datetime import datetime
import threading
from queue import Queue

logger = logging.getLogger(__name__)


class PacketCapture:
    """Class to handle packet capture using Scapy"""
    
    def __init__(self, interface=None, packet_queue=None):
        """
        Initialize packet capture
        
        Args:
            interface: Network interface to capture on (None for all)
            packet_queue: Queue to store captured packets
        """
        self.interface = interface
        self.packet_queue = packet_queue or Queue()
        self.is_capturing = False
        self.capture_thread = None
        self.packet_count = 0
        
    def start_capture(self, packet_callback=None, filter_str=None):
        """
        Start packet capture
        
        Args:
            packet_callback: Callback function for each packet
            filter_str: BPF filter string
        """
        if self.is_capturing:
            logger.warning("Capture already running")
            return
            
        self.is_capturing = True
        self.capture_thread = threading.Thread(
            target=self._capture_packets,
            args=(packet_callback, filter_str),
            daemon=True
        )
        self.capture_thread.start()
        logger.info(f"Started packet capture on interface: {self.interface or 'all'}")
        
    def _capture_packets(self, packet_callback, filter_str):
        """Internal method to capture packets"""
        try:
            sniff(
                iface=self.interface,
                prn=lambda pkt: self._process_packet(pkt, packet_callback),
                store=False,
                filter=filter_str,
                stop_filter=lambda _: not self.is_capturing
            )
        except Exception as e:
            logger.error(f"Error during packet capture: {e}")
            self.is_capturing = False
            
    def _process_packet(self, packet, callback):
        """Process captured packet"""
        try:
            self.packet_count += 1
            self.packet_queue.put(packet)
            
            if callback:
                callback(packet)
                
        except Exception as e:
            logger.error(f"Error processing packet: {e}")
            
    def stop_capture(self):
        """Stop packet capture"""
        if self.is_capturing:
            self.is_capturing = False
            if self.capture_thread:
                self.capture_thread.join(timeout=2)
            logger.info(f"Stopped packet capture. Total packets: {self.packet_count}")
            
    def get_packet_count(self):
        """Get total number of captured packets"""
        return self.packet_count


def extract_packet_info(packet):
    """
    Extract basic information from packet
    
    Args:
        packet: Scapy packet object
        
    Returns:
        dict: Packet information
    """
    info = {
        'timestamp': datetime.now().isoformat(),
        'length': len(packet),
        'protocol': None,
        'src_ip': None,
        'dst_ip': None,
        'src_port': None,
        'dst_port': None,
    }
    
    try:
        if IP in packet:
            info['src_ip'] = packet[IP].src
            info['dst_ip'] = packet[IP].dst
            info['protocol'] = packet[IP].proto
            
            if TCP in packet:
                info['protocol'] = 'TCP'
                info['src_port'] = packet[TCP].sport
                info['dst_port'] = packet[TCP].dport
                info['tcp_flags'] = packet[TCP].flags
                
            elif UDP in packet:
                info['protocol'] = 'UDP'
                info['src_port'] = packet[UDP].sport
                info['dst_port'] = packet[UDP].dport
                
            elif ICMP in packet:
                info['protocol'] = 'ICMP'
                info['icmp_type'] = packet[ICMP].type
                
        elif ARP in packet:
            info['protocol'] = 'ARP'
            info['src_ip'] = packet[ARP].psrc
            info['dst_ip'] = packet[ARP].pdst
            
    except Exception as e:
        logger.error(f"Error extracting packet info: {e}")
        
    return info