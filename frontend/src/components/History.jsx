import React, { useEffect, useState } from 'react';
import { Calendar, Search, Download, Clock, AlertTriangle, Shield } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

export const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapScanToHistoryRow = (scan, index) => {
    const attackTypes = scan.attack_breakdown && Object.keys(scan.attack_breakdown).length > 0
      ? Object.keys(scan.attack_breakdown).join(', ')
      : 'Benign Traffic';
    const totalFlows = Number(scan.total_flows || 0);
    const benignCount = Number(scan.benign_count || 0);
    const benignRate = totalFlows > 0 ? Math.round((benignCount / totalFlows) * 100) : 0;

    return {
      id: index + 1,
      timestamp: scan.timestamp,
      type: attackTypes,
      severity: scan.risk_level || 'Low',
      source: scan.csv_file || 'N/A',
      destination: `${totalFlows} flows`,
      status: Number(scan.attack_count || 0) > 0 ? 'Detected' : 'Clean',
      confidence: benignRate,
    };
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(API_ENDPOINTS.scanHistory);
        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
          throw new Error(data.message || data.detail || 'Failed to load history');
        }

        const mapped = (data.history || []).map(mapScanToHistoryRow);
        setHistoryData(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load history');
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
      case 'clean': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const isWithinDateRange = (timestamp, range) => {
    if (!timestamp) return false;
    const eventDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - eventDate;

    if (range === '24h') return diffMs <= 24 * 60 * 60 * 1000;
    if (range === '7d') return diffMs <= 7 * 24 * 60 * 60 * 1000;
    if (range === '30d') return diffMs <= 30 * 24 * 60 * 60 * 1000;
    return true;
  };

  const filteredData = historyData.filter(event => 
    isWithinDateRange(event.timestamp, dateRange) && (
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const avgConfidence = filteredData.length > 0
    ? Math.round(filteredData.reduce((sum, e) => sum + e.confidence, 0) / filteredData.length)
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
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h2 className="text-xl font-bold text-white mb-2">Event History</h2>
        <p className="text-gray-400">Historical security events and attack logs</p>
        {isLoading && <p className="text-blue-300 text-sm mt-2">Loading history...</p>}
        {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
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
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{filteredData.length}</p>
            <p className="text-gray-400 text-sm">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {filteredData.filter(e => e.severity === 'High' || e.severity === 'Critical').length}
            </p>
            <p className="text-gray-400 text-sm">High Severity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {filteredData.filter(e => e.status === 'Blocked').length}
            </p>
            <p className="text-gray-400 text-sm">Blocked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {avgConfidence}%
            </p>
            <p className="text-gray-400 text-sm">Avg Confidence</p>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Security Events</h3>
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
                  <td className="py-3 px-4 text-gray-300 text-sm">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 text-white text-sm">{event.type}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.source}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.destination}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.confidence}%</td>
                </tr>
              ))}
              {!isLoading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-gray-400 text-sm">
                    No history found for the selected filters.
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
