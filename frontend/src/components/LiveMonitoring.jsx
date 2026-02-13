import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Activity, Globe, Shield, AlertTriangle, Info } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

export const LiveMonitoring = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState([]);
  const [stats, setStats] = useState({
    packetsPerSecond: 0,
    totalPackets: 0,
    activeConnections: 0,
    suspiciousActivity: 0
  });

  const [protocols, setProtocols] = useState({
    TCP: 45,
    UDP: 30,
    ICMP: 15,
    Other: 10
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [captureError, setCaptureError] = useState(null);

  // Generate dummy packet data (for demo purposes when backend is not capturing live)
  const generatePacket = () => {
    const protocols = ['TCP', 'UDP', 'ICMP'];
    const sources = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45', '198.51.100.22'];
    const destinations = ['10.0.0.1', '192.168.1.1', '172.16.0.1', '8.8.8.8', '1.1.1.1'];
    const flags = ['SYN', 'ACK', 'FIN', 'RST', 'PSH'];
    
    return {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      src: sources[Math.floor(Math.random() * sources.length)],
      dst: destinations[Math.floor(Math.random() * destinations.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      length: Math.floor(Math.random() * 1500) + 20,
      flags: Math.random() > 0.5 ? flags[Math.floor(Math.random() * flags.length)] : '',
      suspicious: Math.random() > 0.9
    };
  };

  // Generate dummy alert
  const generateAlert = () => {
    const alertTypes = ['DDoS Attack', 'Port Scan', 'Brute Force Attempt', 'Suspicious Traffic'];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    return {
      id: Date.now() + Math.random(),
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: `Detected suspicious activity from ${generatePacket().src}`,
      timestamp: new Date().toLocaleTimeString()
    };
  };

  useEffect(() => {
    let interval;
    
    if (isCapturing) {
      // Demo mode: Generate dummy packets for visualization
      // In production, this would poll the backend or use WebSockets
      interval = setInterval(() => {
        // Add new packets
        const newPackets = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, generatePacket);
        setPackets(prev => [...newPackets, ...prev].slice(0, 100));
        
        // Update stats
        setStats(prev => ({
          packetsPerSecond: Math.floor(Math.random() * 100) + 50,
          totalPackets: prev.totalPackets + newPackets.length,
          activeConnections: Math.floor(Math.random() * 500) + 200,
          suspiciousActivity: prev.suspiciousActivity + (Math.random() > 0.8 ? 1 : 0)
        }));
        
        // Update protocol distribution
        setProtocols({
          TCP: Math.floor(Math.random() * 30) + 40,
          UDP: Math.floor(Math.random() * 20) + 25,
          ICMP: Math.floor(Math.random() * 10) + 10,
          Other: Math.floor(Math.random() * 10) + 5
        });
        
        // Occasionally add alerts
        if (Math.random() > 0.7) {
          setRecentAlerts(prev => [generateAlert(), ...prev].slice(0, 5));
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isCapturing]);

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'border-red-500 bg-red-900',
      high: 'border-orange-500 bg-orange-900',
      medium: 'border-yellow-500 bg-yellow-900',
      low: 'border-blue-500 bg-blue-900'
    };
    return colors[severity] || 'border-gray-500 bg-gray-900';
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold">Demo Mode - Live Visualization</h4>
            <p className="text-sm text-gray-300 mt-1">
              This is a live packet visualization demo. For real network analysis, go to the Dashboard and click "Start Security Scan" to capture and analyze actual network traffic.
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Live Packet Monitoring</h2>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isCapturing ? 'bg-green-600' : 'bg-gray-600'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isCapturing ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`} />
              <span>{isCapturing ? 'Capturing' : 'Stopped'}</span>
            </div>
            <button
              onClick={() => setIsCapturing(!isCapturing)}
              className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                isCapturing 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isCapturing ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Stop Capture</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Capture</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Packets/Sec</p>
                <p className="text-2xl font-bold">{stats.packetsPerSecond}</p>
              </div>
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Packets</p>
                <p className="text-2xl font-bold">{stats.totalPackets.toLocaleString()}</p>
              </div>
              <Globe className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Connections</p>
                <p className="text-2xl font-bold">{stats.activeConnections}</p>
              </div>
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Suspicious Activity</p>
                <p className="text-2xl font-bold text-orange-500">{stats.suspiciousActivity}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Distribution */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Protocol Distribution</h3>
          <div className="space-y-3">
            {Object.entries(protocols).map(([protocol, percentage]) => (
              <div key={protocol} className="flex items-center justify-between">
                <span className="font-medium">{protocol}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Recent Security Alerts</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No alerts yet. Start monitoring to see alerts.</p>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{alert.type}</p>
                      <p className="text-sm text-gray-300">{alert.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{alert.timestamp}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.severity === 'critical' ? 'bg-red-800 text-red-200' :
                        alert.severity === 'high' ? 'bg-orange-800 text-orange-200' :
                        alert.severity === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                        'bg-blue-800 text-blue-200'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Packet Feed */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Live Packet Feed</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-4">Time</th>
                <th className="text-left py-2 px-4">Source</th>
                <th className="text-left py-2 px-4">Destination</th>
                <th className="text-left py-2 px-4">Protocol</th>
                <th className="text-left py-2 px-4">Length</th>
                <th className="text-left py-2 px-4">Flags</th>
                <th className="text-left py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {packets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    {isCapturing ? 'Waiting for packets...' : 'Start capture to see packets'}
                  </td>
                </tr>
              ) : (
                packets.map((packet) => (
                  <tr key={packet.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 px-4">{packet.timestamp}</td>
                    <td className="py-2 px-4">{packet.src}</td>
                    <td className="py-2 px-4">{packet.dst}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        packet.protocol === 'TCP' ? 'bg-blue-900 text-blue-200' :
                        packet.protocol === 'UDP' ? 'bg-green-900 text-green-200' :
                        'bg-gray-900 text-gray-200'
                      }`}>
                        {packet.protocol}
                      </span>
                    </td>
                    <td className="py-2 px-4">{packet.length}</td>
                    <td className="py-2 px-4">{packet.flags || '-'}</td>
                    <td className="py-2 px-4">
                      {packet.suspicious ? (
                        <span className="px-2 py-1 bg-red-900 text-red-200 rounded text-xs">SUSPICIOUS</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">NORMAL</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
