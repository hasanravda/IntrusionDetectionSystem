import React, { useState, useEffect, useRef } from 'react';
import API_ENDPOINTS from '../../config/api';

export const PacketMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [packets, setPackets] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [stats, setStats] = useState({ total: 0, tcp: 0, udp: 0, icmp: 0, other: 0 });
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const ws = useRef(null);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const websocket = new WebSocket(API_ENDPOINTS.websocket);
        ws.current = websocket;

        websocket.onopen = () => {
          setConnectionStatus('connected');
          console.log('WebSocket connected for packet monitoring');
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
      case 'packet':
        // Add new packet to the list (keep last 50 instead of 100)
        setPackets(prev => {
          const newPackets = [data.data, ...prev];
          return newPackets.slice(0, 50); // Reduced from 100 to 50
        });
        
        // Update statistics
        setStats(prev => {
          const newStats = { ...prev, total: prev.total + 1 };
          const protocol = data.data.protocol?.toLowerCase();
          if (protocol === 'tcp') newStats.tcp++;
          else if (protocol === 'udp') newStats.udp++;
          else if (protocol === 'icmp') newStats.icmp++;
          else newStats.other++;
          return newStats;
        });
        break;
        
      case 'packet_monitor_status':
        setMonitoringStatus(data.data);
        setIsMonitoring(data.data.active);
        break;
    }
  };

  const startMonitoring = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.startPacketMonitor, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        setIsMonitoring(true);
        console.log('Packet monitoring started');
      } else {
        console.error('Failed to start packet monitoring:', result.message);
      }
    } catch (error) {
      console.error('Error starting packet monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      // Update UI immediately for better responsiveness
      setIsMonitoring(false);
      
      const response = await fetch(API_ENDPOINTS.stopPacketMonitor, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('Stop monitoring response:', result);
      
      if (result.status === 'success') {
        console.log('Packet monitoring stopped successfully');
      } else if (result.status === 'not_running') {
        console.log('Packet monitoring was not running');
      } else {
        console.error('Failed to stop packet monitoring:', result.message);
        // Re-enable monitoring if stop failed
        setIsMonitoring(true);
      }
    } catch (error) {
      console.error('Error stopping packet monitoring:', error);
      // Re-enable monitoring if there was an error
      setIsMonitoring(true);
    }
  };

  const clearPackets = () => {
    setPackets([]);
    setStats({ total: 0, tcp: 0, udp: 0, icmp: 0, other: 0 });
  };

  // Filter packets based on protocol and search
  const filteredPackets = packets.filter(packet => {
    const matchesProtocol = protocolFilter === 'all' || packet.protocol?.toLowerCase() === protocolFilter.toLowerCase();
    const matchesSearch = searchFilter === '' || 
      packet.src_ip?.includes(searchFilter) || 
      packet.dst_ip?.includes(searchFilter) ||
      packet.src_port?.toString().includes(searchFilter) ||
      packet.dst_port?.toString().includes(searchFilter);
    return matchesProtocol && matchesSearch;
  });

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProtocolColor = (protocol) => {
    switch (protocol?.toLowerCase()) {
      case 'tcp': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'udp': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'icmp': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Packet Monitor</h2>
            <p className="text-slate-400">Real-time network packet visualization</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-slate-300 text-sm">
              {connectionStatus === 'connected' ? '🟢 Connected' :
               connectionStatus === 'error' ? '🔴 Connection Error' :
               '⚫ Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex space-x-4">
            <button
              onClick={startMonitoring}
              disabled={isMonitoring || connectionStatus !== 'connected'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isMonitoring || connectionStatus !== 'connected'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
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
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              ⏹️ Stop Monitoring
            </button>
            
            <button
              onClick={clearPackets}
              className="px-6 py-3 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>

          {monitoringStatus && (
            <div className={`text-sm px-3 py-1 rounded ${
              monitoringStatus.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {monitoringStatus.message}
            </div>
          )}
        </div>

        {/* Filtering Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-2">
            <label className="text-slate-300 text-sm">Protocol:</label>
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-slate-300 text-sm">Search:</label>
            <input
              type="text"
              placeholder="IP or port..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-slate-300 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoScroll"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoScroll" className="text-slate-300 text-sm">Auto-scroll</label>
          </div>

          <div className="text-slate-400 text-sm">
            Showing {filteredPackets.length} of {packets.length} packets
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Packets</p>
              <p className="text-2xl font-bold text-slate-100">{stats.total.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-slate-300 text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">TCP</p>
              <p className="text-2xl font-bold text-blue-400">{stats.tcp.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-blue-400 text-xl">🔗</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">UDP</p>
              <p className="text-2xl font-bold text-green-400">{stats.udp.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-green-400 text-xl">📡</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">ICMP</p>
              <p className="text-2xl font-bold text-orange-400">{stats.icmp.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-orange-400 text-xl">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packets Table */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-100">Live Packets</h3>
          <span className="text-slate-400 text-sm">
            Showing {filteredPackets.length} of {packets.length} packets (Last 50 captured)
          </span>
        </div>
        
        {filteredPackets.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-slate-400 text-lg">
              {isMonitoring ? 'Waiting for packets...' : 'Start monitoring to see packets'}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Source</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Destination</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-medium">Protocol</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-medium">Size</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-medium">Ports</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackets.map((packet, index) => (
                  <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 text-slate-300 text-xs">
                      {formatTime(packet.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-slate-100 font-mono text-sm">
                      {packet.src_ip}
                    </td>
                    <td className="py-3 px-4 text-slate-100 font-mono text-sm">
                      {packet.dst_ip}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded border ${getProtocolColor(packet.protocol)}`}>
                        {packet.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-center text-sm">
                      {packet.size}B
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-center text-sm font-mono">
                      {packet.src_port && packet.dst_port 
                        ? `${packet.src_port}→${packet.dst_port}`
                        : packet.src_port || packet.dst_port || '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
