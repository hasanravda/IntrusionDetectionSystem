import React, { useState } from 'react';
import { Shield, AlertTriangle, Globe, Clock } from 'lucide-react';

export const Analysis = () => {
  const [timeRange, setTimeRange] = useState('24h');

  // Simple data without complex charts
  const attackPatterns = [
    { name: 'DDoS', count: 35, percentage: '35%' },
    { name: 'Port Scan', count: 25, percentage: '25%' },
    { name: 'Brute Force', count: 20, percentage: '20%' },
    { name: 'Malware', count: 15, percentage: '15%' },
    { name: 'SQL Injection', count: 5, percentage: '5%' }
  ];

  const threatIntelligence = [
    { country: 'China', attacks: 245, severity: 'High' },
    { country: 'Russia', attacks: 189, severity: 'High' },
    { country: 'United States', attacks: 156, severity: 'Medium' },
    { country: 'North Korea', attacks: 134, severity: 'High' },
    { country: 'Iran', attacks: 98, severity: 'Medium' },
    { country: 'Brazil', attacks: 67, severity: 'Low' }
  ];

  const keyMetrics = [
    { metric: 'Total Attacks', value: '1,247', change: '+12%' },
    { metric: 'Blocked Attacks', value: '1,156', change: '+15%' },
    { metric: 'Response Time', value: '2.3s', change: '-0.5s' },
    { metric: 'Detection Rate', value: '94.2%', change: '+2.1%' }
  ];

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h2 className="text-xl font-bold text-white mb-2">Threat Analysis</h2>
        <p className="text-gray-400">Security threat intelligence and pattern analysis</p>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Analysis Period</h3>
          <div className="flex space-x-2">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === range 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-gray-400 text-sm">{item.metric}</p>
              <p className="text-green-400 text-xs">{item.change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attack Patterns */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Attack Patterns</h3>
        <div className="space-y-3">
          {attackPatterns.map((pattern, index) => (
            <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-white">{pattern.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">{pattern.count} attacks</span>
                <span className="text-blue-400 font-medium">{pattern.percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Threat Intelligence by Country */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Threat Intelligence by Origin</h3>
        <div className="space-y-3">
          {threatIntelligence.map((threat, index) => (
            <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-white">{threat.country}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">{threat.attacks} attacks</span>
                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(threat.severity)}`}>
                  {threat.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Threat Activity */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Recent Threat Activity</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">DDoS Attack Detected</span>
            <span className="text-gray-400">2 hours ago</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Port Scanning Activity</span>
            <span className="text-gray-400">5 hours ago</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Malware Signature Found</span>
            <span className="text-gray-400">8 hours ago</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Brute Force Attempt</span>
            <span className="text-gray-400">12 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
