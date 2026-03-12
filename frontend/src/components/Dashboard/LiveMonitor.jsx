import React, { useState, useEffect, useRef } from 'react';
import API_ENDPOINTS from '../../config/api';

export const LiveMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const ws = useRef(null);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const websocket = new WebSocket(API_ENDPOINTS.websocket);
        ws.current = websocket;

        websocket.onopen = () => {
          setConnectionStatus('connected');
          console.log('WebSocket connected');
        };

        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        };

        websocket.onclose = () => {
          setConnectionStatus('disconnected');
          console.log('WebSocket disconnected');
          // Try to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        websocket.onerror = (error) => {
          setConnectionStatus('error');
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    connectWebSocket();

    return () => {
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
      const response = await fetch(API_ENDPOINTS.startMonitoring, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        setIsMonitoring(true);
        console.log('Continuous monitoring started');
      } else {
        console.error('Failed to start monitoring:', result.message);
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.stopMonitoring, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        setIsMonitoring(false);
        console.log('Continuous monitoring stopped');
      } else {
        console.error('Failed to stop monitoring:', result.message);
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Live Monitor Connection</h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-white font-medium">
              {connectionStatus === 'connected' ? '🟢 Connected' :
               connectionStatus === 'connecting' ? '🟡 Connecting...' :
               connectionStatus === 'error' ? '🔴 Connection Error' :
               '⚫ Disconnected'}
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

      {/* Control Panel */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Continuous Monitoring</h3>
        
        <div className="flex space-x-4">
          <button
            onClick={startMonitoring}
            disabled={isMonitoring || connectionStatus !== 'connected'}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isMonitoring || connectionStatus !== 'connected'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? '🟡 Monitoring Active' : '▶️ Start Monitoring'}
          </button>
          
          <button
            onClick={stopMonitoring}
            disabled={!isMonitoring}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !isMonitoring
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            ⏹️ Stop Monitoring
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>• Continuous monitoring captures packets every 30 seconds</p>
          <p>• Real-time threat detection and alerts</p>
          <p>• Automatic WebSocket updates</p>
        </div>
      </div>

      {/* Real-time Alerts */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Threat Alerts</h3>
          <button
            onClick={clearAlerts}
            className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Clear Alerts
          </button>
        </div>
        
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No threats detected yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div key={index} className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-red-400 font-medium text-sm">
                      🚨 {alert.threats_detected} Threats Detected
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      Attack Types: {alert.attack_types?.join(', ') || 'Unknown'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Total Flows: {alert.total_flows}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">
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
