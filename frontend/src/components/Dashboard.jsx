import React, { useState } from 'react';
import { ScanButton } from './Dashboard/ScanButton';
import { ScanResults } from './Dashboard/ScanResults';
import { AttackTrends } from './Dashboard/AttackTrends';
import { EventHistory } from './Dashboard/EventHistory';
import { ConnectionTest } from './ConnectionTest';
import API_ENDPOINTS from '../config/api';

export const Dashboard = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [attackTrends, setAttackTrends] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [error, setError] = useState(null);
  const [scanDuration, setScanDuration] = useState(60);
  const [scanProgress, setScanProgress] = useState({ status: 'idle', progress: 0, message: '' });

  // Poll scan status during scanning
  const pollScanStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.scanStatus);
      const status = await response.json();
      setScanProgress(prev => ({ ...prev, ...status }));
      
      // When scan completes, fetch results automatically and clean up
      if (status.status === 'completed') {
        fetchScanResults();
        fetchScanHistory(); // Refresh history
        setIsScanning(false);
        
        // Clean up intervals
        if (scanProgress.intervalId) {
          clearInterval(scanProgress.intervalId);
        }
        if (scanProgress.timeoutId) {
          clearTimeout(scanProgress.timeoutId);
        }
        
        setScanProgress({ status: 'idle', progress: 0, message: '' });
      } else if (status.status === 'error') {
        setIsScanning(false);
        
        // Clean up intervals
        if (scanProgress.intervalId) {
          clearInterval(scanProgress.intervalId);
        }
        if (scanProgress.timeoutId) {
          clearTimeout(scanProgress.timeoutId);
        }
        
        setScanProgress({ status: 'error', progress: 0, message: status.message || 'Scan failed' });
      }
    } catch (err) {
      console.error('Error polling scan status:', err);
    }
  };

  // Fetch scan results and trends
  const fetchScanResults = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.scanResults);
      const data = await response.json();
      
      if (data.status === 'success') {
        // Update attack trends for chart (Recharts format)
        setAttackTrends(data.trends || []);
        
        // Update scan results with comprehensive data
        setScanResults({
          total_flows: data.total_flows || 0,
          benign_count: data.benign_count || 0,
          attack_count: data.attack_count || 0,
          trends: data.trends || []
        });
        
        console.log('Scan results loaded:', {
          total_flows: data.total_flows,
          benign_count: data.benign_count,
          attack_count: data.attack_count,
          trends: data.trends?.length
        });
      } else {
        console.log('No scan results available yet');
      }
    } catch (err) {
      console.error('Error fetching scan results:', err);
    }
  };

  // Fetch scan history
  const fetchScanHistory = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.scanHistory);
      const data = await response.json();
      if (data.status === 'success') {
        setEventHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching scan history:', err);
    }
  };

  const handleScanStart = async () => {
    setIsScanning(true);
    setError(null);
    setScanProgress({ status: 'starting', progress: 0, message: 'Initializing scan...' });
    
    try {
      console.log('Starting scan with duration:', scanDuration);
      
      // Call the real backend live scan API
      const response = await fetch(`${API_ENDPOINTS.liveScan}?duration=${scanDuration}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Scan failed');
      }
      
      const data = await response.json();
      console.log('Scan initiated:', data);
      
      // Start continuous polling for progress updates
      const progressInterval = setInterval(() => {
        pollScanStatus();
      }, 2000); // Poll every 2 seconds
      
      // Set a maximum timeout to prevent infinite polling
      const maxTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        setIsScanning(false);
        setScanProgress({ status: 'idle', progress: 0, message: '' });
        console.log('Scan polling timeout reached');
      }, (scanDuration + 60) * 1000); // Extra 60 seconds for processing
      
      // Store interval refs for cleanup
      setScanProgress(prev => ({ ...prev, intervalId: progressInterval, timeoutId: maxTimeout }));
      
    } catch (error) {
      console.error('Scan error:', error);
      setError(error.message);
      setIsScanning(false);
      setScanProgress({ status: 'error', progress: 0, message: error.message });
      
      // Fallback dummy data for demo
      setScanResults({
        total_flows: 20,
        benign_count: 15,
        attack_count: 5,
        trends: [
          { name: 'Benign', count: 15, percentage: 75.0 },
          { name: 'PortScan', count: 3, percentage: 15.0 },
          { name: 'DDoS', count: 2, percentage: 10.0 }
        ]
      });
    }
  };

  // Load initial data
  React.useEffect(() => {
    fetchScanResults();
    fetchScanHistory();
  }, []);

  return (
    <div className="space-y-4">
      {/* Scan Duration Control */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Capture Duration (seconds)
        </label>
        <input
          type="number"
          min="10"
          max="300"
          value={scanDuration}
          onChange={(e) => setScanDuration(parseInt(e.target.value))}
          disabled={isScanning}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Recommended: 60 seconds for comprehensive analysis
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Scan Progress */}
      {isScanning && scanProgress.status !== 'idle' && (
        <div className={`rounded-lg p-4 border ${
          scanProgress.status === 'error' ? 'bg-red-900/50 border-red-500' :
          scanProgress.status === 'completed' ? 'bg-green-900/50 border-green-500' :
          'bg-blue-900/50 border-blue-500'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                scanProgress.status === 'error' ? 'bg-red-400' :
                scanProgress.status === 'completed' ? 'bg-green-400' :
                'bg-blue-400'
              }`}></div>
              <span className={`font-medium ${
                scanProgress.status === 'error' ? 'text-red-200' :
                scanProgress.status === 'completed' ? 'text-green-200' :
                'text-blue-200'
              }`}>
                {scanProgress.status === 'capturing' ? '📡 Capturing Packets' :
                 scanProgress.status === 'processing' ? '⚙️ Processing Flows' :
                 scanProgress.status === 'running_ml' ? '🧠 Running Detection' :
                 scanProgress.status === 'completed' ? '✅ Scan Complete' :
                 scanProgress.status === 'error' ? '❌ Scan Failed' :
                 '🔄 Starting Scan'}
              </span>
            </div>
            <span className={`text-sm ${
              scanProgress.status === 'error' ? 'text-red-300' :
              scanProgress.status === 'completed' ? 'text-green-300' :
              'text-blue-300'
            }`}>{scanProgress.progress}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                scanProgress.status === 'error' ? 'bg-red-500' :
                scanProgress.status === 'completed' ? 'bg-green-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${scanProgress.progress}%` }}
            ></div>
          </div>
          
          {/* Status Message */}
          <p className={`text-sm ${
            scanProgress.status === 'error' ? 'text-red-300' :
            scanProgress.status === 'completed' ? 'text-green-300' :
            'text-blue-300'
          }`}>
            {scanProgress.message}
          </p>
          
          {/* Phase Indicators */}
          <div className="flex justify-between mt-3 text-xs">
            <div className={`flex items-center space-x-1 ${
              scanProgress.progress >= 10 ? 'text-blue-300' : 'text-gray-500'
            }`}>
              <span>{scanProgress.progress >= 10 ? '✓' : '○'}</span>
              <span>Capture</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              scanProgress.progress >= 50 ? 'text-blue-300' : 'text-gray-500'
            }`}>
              <span>{scanProgress.progress >= 50 ? '✓' : '○'}</span>
              <span>Flows</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              scanProgress.progress >= 85 ? 'text-blue-300' : 'text-gray-500'
            }`}>
              <span>{scanProgress.progress >= 85 ? '✓' : '○'}</span>
              <span>Detection</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              scanProgress.progress >= 100 ? 'text-green-300' : 'text-gray-500'
            }`}>
              <span>{scanProgress.progress >= 100 ? '✓' : '○'}</span>
              <span>Results</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Scan Button */}
      <ScanButton onScanStart={handleScanStart} isScanning={isScanning} />
      
      {/* Scan Results */}
      <ScanResults results={scanResults} />
      
      {/* Attack Trends */}
      <AttackTrends trends={attackTrends} />
      
      {/* Event History */}
      <EventHistory events={eventHistory} />
    </div>
  );
};
