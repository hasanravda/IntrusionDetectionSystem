import { useEffect, useRef, useState } from 'react';
import API_ENDPOINTS from '../../config/api';

export const LiveMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [monitorError, setMonitorError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const ws = useRef(null);
  const reconnectTimerRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      try {
        if (!isMounted) {
          return;
        }
        setConnectionStatus('connecting');
        const websocket = new WebSocket(API_ENDPOINTS.websocket);
        ws.current = websocket;

        websocket.onopen = () => {
          setConnectionStatus('connected');
          setMonitorError(null);
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (parseError) {
            setMonitorError('Received invalid live update payload');
          }
        };

        websocket.onclose = () => {
          if (!isMounted) {
            return;
          }
          setConnectionStatus('disconnected');
          // Try to reconnect after 3 seconds
          reconnectTimerRef.current = window.setTimeout(connectWebSocket, 3000);
        };

        websocket.onerror = (error) => {
          setConnectionStatus('error');
          setMonitorError('WebSocket connection error');
        };
      } catch (error) {
        setMonitorError('Failed to establish WebSocket connection');
        setConnectionStatus('error');
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'status':
        setMonitoringStatus(data.data);
        break;
      case 'monitoring_status':
        setIsMonitoring(data.data.active);
        break;
      case 'threat_alert':
        setAlerts(prev => [data.data, ...prev.slice(0, 9)]); // Keep last 10 alerts
        break;
    }
  };

  const startMonitoring = async () => {
    try {
      setIsSubmitting(true);
      setMonitorError(null);
      const response = await fetch(API_ENDPOINTS.startMonitoring, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Unable to start continuous monitoring');
      }
      
      const result = await response.json();
      if (result.status === 'success') {
        setIsMonitoring(true);
      } else {
        throw new Error(result.message || 'Failed to start monitoring');
      }
    } catch (error) {
      setMonitorError(error.message || 'Error starting monitoring');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      setIsSubmitting(true);
      setMonitorError(null);
      const response = await fetch(API_ENDPOINTS.stopMonitoring, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Unable to stop continuous monitoring');
      }
      
      const result = await response.json();
      if (result.status === 'success') {
        setIsMonitoring(false);
      } else {
        throw new Error(result.message || 'Failed to stop monitoring');
      }
    } catch (error) {
      setMonitorError(error.message || 'Error stopping monitoring');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const getStatusColor = () => {
    if (!monitoringStatus) return 'text-gray-400';
    switch (monitoringStatus.status) {
      case 'capturing': return 'text-blue-400';
      case 'processing': return 'text-yellow-400';
      case 'running_ml': return 'text-orange-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Live Monitor Connection</h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-400 animate-pulse'
                : connectionStatus === 'connecting'
                ? 'bg-amber-400'
                : connectionStatus === 'error'
                ? 'bg-rose-400'
                : 'bg-gray-400'
            }`}></div>
            <span className="font-medium text-slate-100">
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'connecting'
                ? 'Connecting...'
                : connectionStatus === 'error'
                ? 'Connection Error'
                : 'Disconnected'}
            </span>
          </div>
          
          <span className={`text-xs px-2 py-1 rounded ${
            connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
            connectionStatus === 'error' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {connectionStatus}
          </span>
        </div>

        {monitoringStatus && (
          <div className="text-sm text-gray-300">
            <p>Status: <span className={getStatusColor()}>{monitoringStatus.message}</span></p>
            {monitoringStatus.progress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${monitoringStatus.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {monitorError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {monitorError}
        </div>
      )}

      {/* Control Panel */}
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Continuous Monitoring</h3>
        
        <div className="flex space-x-4">
          <button
            onClick={startMonitoring}
            disabled={isMonitoring || connectionStatus !== 'connected' || isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isMonitoring || connectionStatus !== 'connected' || isSubmitting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'border border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25'
            }`}
          >
            {isMonitoring ? 'Monitoring Active' : isSubmitting ? 'Please wait...' : 'Start Monitoring'}
          </button>
          
          <button
            onClick={stopMonitoring}
            disabled={!isMonitoring || isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !isMonitoring || isSubmitting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'border border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/25'
            }`}
          >
            Stop Monitoring
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>• Continuous monitoring captures packets every 30 seconds</p>
          <p>• Real-time threat detection and alerts</p>
          <p>• Automatic WebSocket updates</p>
        </div>
      </div>

      {/* Real-time Alerts */}
      <div className="panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Threat Alerts</h3>
          <button
            onClick={clearAlerts}
            className="rounded border border-red-500/35 bg-red-500/10 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20"
          >
            Clear Alerts
          </button>
        </div>
        
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-slate-400">No threats detected yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div key={index} className="rounded-lg border border-red-500/35 bg-red-500/10 p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-300">
                      {alert.threats_detected} Threats Detected
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Attack Types: {alert.attack_types?.join(', ') || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Total Flows: {alert.total_flows}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
