"""
Configuration Module
Manages NIDS configuration settings
"""

import json
import os
import logging

logger = logging.getLogger(__name__)


class Config:
    """Configuration management for NIDS"""
    
    DEFAULT_CONFIG = {
        'network': {
            'interface': None,  # None for all interfaces
            'bpf_filter': None,  # Berkeley Packet Filter
        },
        'detection': {
            'model_path': 'models/nids_model.joblib',
            'threshold': 0.7,
            'feature_window_size': 100
        },
        'prevention': {
            'auto_block': False,
            'block_threshold': 5,
            'block_duration': 3600
        },
        'logging': {
            'level': 'INFO',
            'file': 'logs/nids.log',
            'console': True
        },
        'alerts': {
            'save_to_file': True,
            'alert_file': 'alerts/alerts.json',
            'console_output': True
        },
        'analytics': {
            'enable': True,
            'report_interval': 300  # seconds
        }
    }
    
    def __init__(self, config_file='config.json'):
        """
        Initialize configuration
        
        Args:
            config_file: Path to configuration file
        """
        self.config_file = config_file
        self.config = self.DEFAULT_CONFIG.copy()
        
        # Load config from file if exists
        if os.path.exists(config_file):
            self.load()
        else:
            self.save()
            
    def load(self):
        """Load configuration from file"""
        try:
            with open(self.config_file, 'r') as f:
                loaded_config = json.load(f)
                # Merge with defaults
                self._merge_config(self.config, loaded_config)
                
            logger.info(f"Configuration loaded from {self.config_file}")
            
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
            logger.info("Using default configuration")
            
    def save(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
                
            logger.info(f"Configuration saved to {self.config_file}")
            
        except Exception as e:
            logger.error(f"Error saving configuration: {e}")
            
    def _merge_config(self, base, updates):
        """Recursively merge configuration dictionaries"""
        for key, value in updates.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_config(base[key], value)
            else:
                base[key] = value
                
    def get(self, section, key=None, default=None):
        """
        Get configuration value
        
        Args:
            section: Configuration section
            key: Configuration key (optional)
            default: Default value if not found
            
        Returns:
            Configuration value
        """
        if key is None:
            return self.config.get(section, default)
        else:
            return self.config.get(section, {}).get(key, default)
            
    def set(self, section, key, value):
        """
        Set configuration value
        
        Args:
            section: Configuration section
            key: Configuration key
            value: Value to set
        """
        if section not in self.config:
            self.config[section] = {}
            
        self.config[section][key] = value
        
    def get_all(self):
        """Get all configuration"""
        return self.config.copy()
