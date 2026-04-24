import { useEffect, useRef, useState } from 'react';
import API_ENDPOINTS from '../config/api';
import { EventHistory } from './Dashboard/EventHistory';
import { ScanButton } from './Dashboard/ScanButton';
import { ScanResults } from './Dashboard/ScanResults';

export const Dashboard = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [attackTrends, setAttackTrends] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [scanDuration, setScanDuration] = useState(60);
  const [scanProgress, setScanProgress] = useState({ status: 'idle', progress: 0, message: '' });
  const pollIntervalRef = useRef(null);
  const pollTimeoutRef = useRef(null);

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const parseErrorMessage = async (response, fallbackMessage) => {
    try {
      const payload = await response.json();
      return payload?.detail || payload?.message || fallbackMessage;
    } catch (parseError) {
      return fallbackMessage;
    }
  };

  // Poll scan status during scanning
  const pollScanStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.scanStatus);
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, 'Unable to retrieve scan status'));
      }
      const status = await response.json();
      const statusPayload = status?.data || status;
      setScanProgress(prev => ({ ...prev, ...statusPayload }));
      
      // When scan completes, fetch results automatically and clean up
      if (statusPayload.status === 'completed') {
        fetchScanResults();
        fetchScanHistory();
        setIsScanning(false);
        clearPolling();
        setScanProgress({ status: 'idle', progress: 0, message: '' });
      } else if (statusPayload.status === 'error') {
        setIsScanning(false);
        clearPolling();
        setScanProgress({ status: 'error', progress: 0, message: statusPayload.message || 'Scan failed' });
      }
    } catch (err) {
      setIsScanning(false);
      clearPolling();
      setError(err.message || 'Error polling scan status');
      setScanProgress({ status: 'error', progress: 0, message: 'Scan status unavailable' });
    }
  };

  // Fetch scan results and trends
  const fetchScanResults = async () => {
    try {
      setIsLoadingResults(true);
      const response = await fetch(API_ENDPOINTS.scanResults);
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, 'Failed to load scan results'));
      }
      const data = await response.json();
      const payload = data?.data || data;
      
      if (payload.status === 'success' || payload.total_flows !== undefined) {
        // Update attack trends for chart (Recharts format)
        setAttackTrends(payload.trends || []);
        
        // Update scan results with comprehensive data
        setScanResults({
          total_flows: payload.total_flows || 0,
          benign_count: payload.benign_count || 0,
          attack_count: payload.attack_count || 0,
          trends: payload.trends || []
        });
      } else {
        setScanResults(null);
        setAttackTrends([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load scan results');
      setScanResults(null);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Fetch scan history
  const fetchScanHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(API_ENDPOINTS.scanHistory);
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, 'Failed to load scan history'));
      }
      const data = await response.json();
      const payload = data?.data || data;
      setEventHistory(payload.history || []);
    } catch (err) {
      setError(err.message || 'Unable to load scan history');
      setEventHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleScanStart = async () => {
    setIsScanning(true);
    setError(null);
    setScanProgress({ status: 'starting', progress: 0, message: 'Initializing scan...' });
    
    try {
      // Call the real backend live scan API
      const response = await fetch(`${API_ENDPOINTS.liveScan}?duration=${scanDuration}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, 'Scan failed'));
      }
      
      await response.json();
      
      // Start continuous polling for progress updates
      clearPolling();
      pollIntervalRef.current = window.setInterval(() => {
        pollScanStatus();
      }, 2000); // Poll every 2 seconds
      
      // Set a maximum timeout to prevent infinite polling
      pollTimeoutRef.current = window.setTimeout(() => {
        clearPolling();
        setIsScanning(false);
        setScanProgress({ status: 'idle', progress: 0, message: '' });
        setError('Scan timed out. Please try a shorter duration.');
      }, (scanDuration + 60) * 1000); // Extra 60 seconds for processing
      
    } catch (scanError) {
      setError(scanError.message || 'Scan failed');
      setIsScanning(false);
      clearPolling();
      setScanProgress({ status: 'error', progress: 0, message: scanError.message || 'Scan failed' });
    }
  };

  // Load initial data
  useEffect(() => {
    fetchScanResults();
    fetchScanHistory();
    return () => {
      clearPolling();
    };
  }, []);

  const onDurationChange = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      setScanDuration(60);
      return;
    }
    const safe = Math.max(10, Math.min(300, Math.floor(numeric)));
    setScanDuration(safe);
  };

  return (
    <div className="space-y-5">
      {/* Scan Duration Control */}
      <div className="panel p-4 md:p-5">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Capture Duration (seconds)
        </label>
        <input
          type="number"
          min="10"
          max="300"
          value={scanDuration}
          onChange={(e) => onDurationChange(e.target.value)}
          disabled={isScanning}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">
          Recommended: 60 seconds for comprehensive analysis
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Simplified Scan Progress */}
      {isScanning && scanProgress.status !== 'idle' && (
        <div className={`rounded-xl p-6 border backdrop-blur-md ${
          scanProgress.status === 'error' ? 'bg-red-900/40 border-red-500/50' :
          scanProgress.status === 'completed' ? 'bg-green-900/40 border-green-500/50' :
          'bg-slate-800/60 border-slate-700/50'
        }`}>
          {/* Header with Icon and Status */}
          <div className="flex items-center space-x-3 mb-6">
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
              scanProgress.status === 'error' ? 'bg-red-500/20' :
              scanProgress.status === 'completed' ? 'bg-green-500/20' :
              'bg-blue-500/20'
            }`}>
              {/* Animated Icon */}
              <div className={`text-2xl ${
                scanProgress.status === 'capturing' ? 'animate-pulse' :
                scanProgress.status === 'processing' ? 'animate-spin' :
                scanProgress.status === 'running_ml' ? 'animate-bounce' :
                scanProgress.status === 'completed' ? 'animate-pulse' :
                'animate-spin'
              }`}>
                {scanProgress.status === 'capturing' ? '📡' :
                 scanProgress.status === 'processing' ? '⚙️' :
                 scanProgress.status === 'running_ml' ? '🧠' :
                 scanProgress.status === 'completed' ? '✅' :
                 scanProgress.status === 'error' ? '❌' :
                 '🔄'}
              </div>
              
              {/* Rotating Ring */}
              <div className={`absolute inset-0 rounded-full border-2 ${
                scanProgress.status === 'error' ? 'border-red-500' :
                scanProgress.status === 'completed' ? 'border-green-500' :
                'border-blue-500'
              } border-t-transparent animate-spin`}></div>
            </div>
            
            <div>
              <span className={`font-bold text-lg ${
                scanProgress.status === 'error' ? 'text-red-300' :
                scanProgress.status === 'completed' ? 'text-green-300' :
                'text-blue-300'
              }`}>
                {scanProgress.status === 'capturing' ? 'Capturing Network Traffic' :
                 scanProgress.status === 'processing' ? 'Analyzing Data Flows' :
                 scanProgress.status === 'running_ml' ? 'Running AI Detection' :
                 scanProgress.status === 'completed' ? 'Scan Complete' :
                 scanProgress.status === 'error' ? 'Scan Failed' :
                 'Initializing Scan'}
              </span>
              <p className={`text-sm mt-1 ${
                scanProgress.status === 'error' ? 'text-red-400' :
                scanProgress.status === 'completed' ? 'text-green-400' :
                'text-slate-400'
              }`}>
                {scanProgress.message}
              </p>
            </div>
          </div>

          {/* Phase Indicators with Icons */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { phase: 'Capture', icon: '📡', progress: 10 },
              { phase: 'Process', icon: '⚙️', progress: 50 },
              { phase: 'Detect', icon: '🧠', progress: 85 },
              { phase: 'Results', icon: '📊', progress: 100 }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                  scanProgress.progress >= item.progress 
                    ? scanProgress.status === 'error' ? 'bg-red-500/20 text-red-400' :
                      scanProgress.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-700/50 text-slate-500'
                }`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className={`text-xs font-medium transition-all duration-500 ${
                  scanProgress.progress >= item.progress 
                    ? scanProgress.status === 'error' ? 'text-red-400' :
                      scanProgress.status === 'completed' ? 'text-green-400' :
                      'text-blue-400'
                    : 'text-slate-500'
                }`}>
                  {scanProgress.progress >= item.progress ? '✓' : '○'} {item.phase}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Scan Button */}
      <ScanButton onScanStart={handleScanStart} isScanning={isScanning} />
      
      {/* Scan Results */}
      <ScanResults results={scanResults} loading={isLoadingResults} />
      
      {/* Event History */}
      <EventHistory events={eventHistory} loading={isLoadingHistory} />
    </div>
  );
};
