import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download, Filter, BarChart3, Clock, AlertTriangle, Shield } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [attackType, setAttackType] = useState('all');
  const [severity, setSeverity] = useState('all');

  // Generate dummy historical data
  const generateHistoryData = () => {
    const attackTypes = ['DDoS Attack', 'Port Scan', 'Brute Force', 'Malware Detection', 'SQL Injection'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const sources = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45', '198.51.100.22'];
    const destinations = ['10.0.0.1', '192.168.1.1', '172.16.0.1', '8.8.8.8'];
    
    return Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      status: Math.random() > 0.3 ? 'blocked' : 'detected',
      confidence: Math.floor(Math.random() * 30) + 70,
      duration: Math.floor(Math.random() * 300) + 10,
      packets: Math.floor(Math.random() * 1000) + 100,
      bytes: Math.floor(Math.random() * 1000000) + 10000
    }));
  };

  // Generate daily statistics
  const generateDailyStats = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      attacks: Math.floor(Math.random() * 100) + 20,
      blocked: Math.floor(Math.random() * 80) + 10,
      detected: Math.floor(Math.random() * 40) + 5
    })).reverse();
  };

  useEffect(() => {
    const data = generateHistoryData();
    setHistoryData(data);
    setFilteredData(data);
  }, []);

  useEffect(() => {
    let filtered = historyData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.includes(searchTerm) ||
        item.destination.includes(searchTerm)
      );
    }

    // Filter by attack type
    if (attackType !== 'all') {
      filtered = filtered.filter(item => item.type === attackType);
    }

    // Filter by severity
    if (severity !== 'all') {
      filtered = filtered.filter(item => item.severity === severity);
    }

    // Filter by date range
    const now = new Date();
    let cutoffDate;
    switch (dateRange) {
      case '24h':
        cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }
    
    filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate);

    setFilteredData(filtered);
  }, [historyData, searchTerm, attackType, severity, dateRange]);

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getSeverityBgColor = (severity) => {
    const colors = {
      critical: 'bg-red-900 text-red-200',
      high: 'bg-orange-900 text-orange-200',
      medium: 'bg-yellow-900 text-yellow-200',
      low: 'bg-blue-900 text-blue-200'
    };
    return colors[severity] || 'bg-gray-900 text-gray-200';
  };

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Type', 'Severity', 'Source', 'Destination', 'Status', 'Confidence', 'Duration', 'Packets', 'Bytes'],
      ...filteredData.map(item => [
        item.timestamp,
        item.type,
        item.severity,
        item.source,
        item.destination,
        item.status,
        item.confidence,
        item.duration,
        item.packets,
        item.bytes
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nids_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const dailyStats = generateDailyStats();
  const totalAttacks = filteredData.length;
  const blockedAttacks = filteredData.filter(item => item.status === 'blocked').length;
  const detectedAttacks = filteredData.filter(item => item.status === 'detected').length;
  const avgConfidence = filteredData.length > 0 
    ? (filteredData.reduce((sum, item) => sum + item.confidence, 0) / filteredData.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Historical Data & Logs</h2>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Attacks</p>
              <p className="text-3xl font-bold">{totalAttacks}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Blocked</p>
              <p className="text-3xl font-bold text-green-500">{blockedAttacks}</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Detected</p>
              <p className="text-3xl font-bold text-yellow-500">{detectedAttacks}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Confidence</p>
              <p className="text-3xl font-bold text-purple-500">{avgConfidence}%</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 30-Day Trend Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">30-Day Attack Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Line type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} name="Total Attacks" />
            <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} name="Blocked" />
            <Line type="monotone" dataKey="detected" stroke="#f59e0b" strokeWidth={2} name="Detected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>

            <select
              value={attackType}
              onChange={(e) => setAttackType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="DDoS Attack">DDoS Attack</option>
              <option value="Port Scan">Port Scan</option>
              <option value="Brute Force">Brute Force</option>
              <option value="Malware Detection">Malware Detection</option>
              <option value="SQL Injection">SQL Injection</option>
            </select>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold">Attack History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-6">Timestamp</th>
                <th className="text-left py-3 px-6">Type</th>
                <th className="text-left py-3 px-6">Severity</th>
                <th className="text-left py-3 px-6">Source</th>
                <th className="text-left py-3 px-6">Destination</th>
                <th className="text-left py-3 px-6">Status</th>
                <th className="text-left py-3 px-6">Confidence</th>
                <th className="text-left py-3 px-6">Duration</th>
                <th className="text-left py-3 px-6">Packets</th>
                <th className="text-left py-3 px-6">Bytes</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No historical data found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredData.slice(0, 50).map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-6 text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-6">{item.type}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityBgColor(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-mono text-sm">{item.source}</td>
                    <td className="py-3 px-6 font-mono text-sm">{item.destination}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'blocked' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.confidence >= 90 ? 'bg-green-500' :
                              item.confidence >= 80 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs">{item.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">{item.duration}s</td>
                    <td className="py-3 px-6">{item.packets.toLocaleString()}</td>
                    <td className="py-3 px-6">{(item.bytes / 1000).toFixed(1)}KB</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 50 && (
          <div className="p-4 text-center text-gray-400 border-t border-gray-700">
            Showing first 50 of {filteredData.length} results. Use filters to narrow down results.
          </div>
        )}
      </div>
    </div>
  );
};
