import { Calendar, Download, Search } from 'lucide-react';
import { useState } from 'react';

export const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  // Simple historical data without complex charts
  const historyData = [
    { id: 1, timestamp: '2024-01-30 14:30:00', type: 'DDoS Attack', severity: 'High', source: '192.168.1.100', destination: '10.0.0.50', status: 'Blocked', confidence: 95 },
    { id: 2, timestamp: '2024-01-30 13:45:00', type: 'Port Scan', severity: 'Medium', source: '172.16.0.25', destination: '192.168.1.1', status: 'Blocked', confidence: 87 },
    { id: 3, timestamp: '2024-01-30 12:20:00', type: 'Brute Force', severity: 'High', source: '203.0.113.45', destination: '10.0.0.100', status: 'Blocked', confidence: 92 },
    { id: 4, timestamp: '2024-01-30 11:15:00', type: 'Malware Detection', severity: 'Critical', source: '198.51.100.22', destination: '192.168.1.200', status: 'Quarantine', confidence: 98 },
    { id: 5, timestamp: '2024-01-30 10:30:00', type: 'SQL Injection', severity: 'Medium', source: '10.0.0.75', destination: '192.168.1.50', status: 'Blocked', confidence: 85 },
    { id: 6, timestamp: '2024-01-30 09:45:00', type: 'Port Scan', severity: 'Low', source: '172.16.0.30', destination: '192.168.1.1', status: 'Detected', confidence: 78 },
    { id: 7, timestamp: '2024-01-30 08:20:00', type: 'DDoS Attack', severity: 'High', source: '203.0.113.50', destination: '10.0.0.1', status: 'Blocked', confidence: 94 },
    { id: 8, timestamp: '2024-01-30 07:10:00', type: 'Brute Force', severity: 'Medium', source: '192.168.1.150', destination: '10.0.0.25', status: 'Blocked', confidence: 88 }
  ];

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'blocked': return 'text-red-400 bg-red-500/20';
      case 'quarantine': return 'text-purple-400 bg-purple-500/20';
      case 'detected': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredData = historyData.filter(event => 
    event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.source.includes(searchTerm) ||
    event.destination.includes(searchTerm)
  );

  const avgConfidence = filteredData.length
    ? Math.round(filteredData.reduce((sum, event) => sum + event.confidence, 0) / filteredData.length)
    : 0;

  const handleExport = () => {
    // Simple export functionality
    const csv = [
      ['Timestamp', 'Type', 'Severity', 'Source', 'Destination', 'Status', 'Confidence'],
      ...filteredData.map(event => [
        event.timestamp,
        event.type,
        event.severity,
        event.source,
        event.destination,
        event.status,
        event.confidence
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_events.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel p-4">
        <h2 className="mb-2 text-xl font-semibold text-slate-100">Event History</h2>
        <p className="text-sm text-slate-400">Historical security events and attack logs</p>
      </div>

      {/* Filters */}
      <div className="panel p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 rounded-lg border border-cyan-400/35 bg-cyan-500/12 px-4 py-2 text-cyan-100 transition-colors hover:bg-cyan-500/25"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="panel p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-100">{filteredData.length}</p>
            <p className="text-sm text-slate-400">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {filteredData.filter(e => e.severity === 'High' || e.severity === 'Critical').length}
            </p>
            <p className="text-sm text-slate-400">High Severity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {filteredData.filter(e => e.status === 'Blocked').length}
            </p>
            <p className="text-sm text-slate-400">Blocked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-300">{avgConfidence}%</p>
            <p className="text-sm text-slate-400">Avg Confidence</p>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="panel p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Security Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Severity</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Source</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Destination</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((event) => (
                <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.timestamp}</td>
                  <td className="py-3 px-4 text-white text-sm">{event.type}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm font-mono">{event.source}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm font-mono">{event.destination}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.confidence}%</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No events match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
