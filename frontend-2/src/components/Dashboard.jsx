import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { StatsCards } from './Dashboard/StatsCards';
import { Charts } from './Dashboard/Charts';
import { RecentAlerts } from './Dashboard/RecentAlerts';
import { SystemOverview } from './Dashboard/SystemOverview';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAttacks: 1247,
    activeThreats: 23,
    blockedIPs: 156,
    networkHealth: 94,
    packetsPerSec: 1247,
    uptime: '99.8%',
    dataProcessed: '2.4TB'
  });

  const [attackData, setAttackData] = useState([
    { name: 'DDoS', value: 45, color: '#8b5cf6' },
    { name: 'Port Scan', value: 30, color: '#f59e0b' },
    { name: 'Brute Force', value: 15, color: '#ef4444' },
    { name: 'Malware', value: 10, color: '#10b981' }
  ]);

  const [trafficData, setTrafficData] = useState([
    { time: '00:00', traffic: 1200, attacks: 5, blocked: 4 },
    { time: '04:00', traffic: 800, attacks: 2, blocked: 2 },
    { time: '08:00', traffic: 2000, attacks: 12, blocked: 11 },
    { time: '12:00', traffic: 2800, attacks: 18, blocked: 17 },
    { time: '16:00', traffic: 2400, attacks: 15, blocked: 14 },
    { time: '20:00', traffic: 1600, attacks: 8, blocked: 7 },
    { time: '23:59', traffic: 1000, attacks: 3, blocked: 3 }
  ]);

  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, type: 'DDoS Attack', severity: 'HIGH', src: '192.168.1.100', dst: '10.0.0.50', time: '2 min ago', status: 'BLOCKED', confidence: 95 },
    { id: 2, type: 'Port Scanning', severity: 'MEDIUM', src: '172.16.0.25', dst: '192.168.1.1', time: '5 min ago', status: 'MONITORING', confidence: 87 },
    { id: 3, type: 'Brute Force', severity: 'HIGH', src: '203.0.113.45', dst: '10.0.0.100', time: '8 min ago', status: 'BLOCKED', confidence: 92 },
    { id: 4, type: 'Malware Detected', severity: 'CRITICAL', src: '198.51.100.22', dst: '192.168.1.200', time: '12 min ago', status: 'QUARANTINE', confidence: 98 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalAttacks: prev.totalAttacks + Math.floor(Math.random() * 3),
        activeThreats: Math.max(0, prev.activeThreats + (Math.random() > 0.7 ? 1 : -1)),
        blockedIPs: prev.blockedIPs + (Math.random() > 0.8 ? 1 : 0),
        packetsPerSec: Math.floor(Math.random() * 500) + 1000
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'from-red-500 to-red-600',
      HIGH: 'from-orange-500 to-orange-600',
      MEDIUM: 'from-yellow-500 to-yellow-600',
      LOW: 'from-blue-500 to-blue-600'
    };
    return colors[severity] || 'from-gray-500 to-gray-600';
  };

  const getStatusColor = (status) => {
    const colors = {
      BLOCKED: 'text-red-400 bg-red-500/20',
      MONITORING: 'text-yellow-400 bg-yellow-500/20',
      QUARANTINE: 'text-purple-400 bg-purple-500/20',
      RESOLVED: 'text-green-400 bg-green-500/20'
    };
    return colors[status] || 'text-gray-400 bg-gray-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      {recentAlerts.filter(a => a.severity === 'CRITICAL').length > 0 && (
        <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-red-400 font-bold text-lg">CRITICAL THREAT DETECTED</p>
                <p className="text-red-300">Malware activity detected - Immediate action required</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <Charts attackData={attackData} trafficData={trafficData} />

      {/* Recent Alerts */}
      <RecentAlerts 
        recentAlerts={recentAlerts} 
        getSeverityColor={getSeverityColor}
        getStatusColor={getStatusColor}
      />

      {/* System Overview */}
      <SystemOverview stats={stats} />
    </div>
  );
};
