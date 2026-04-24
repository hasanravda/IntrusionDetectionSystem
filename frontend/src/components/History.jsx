import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Calendar, Download, Search, RefreshCw } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

export const History = () => {
  const [attackStats, setAttackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttackStatistics();
  }, []);

  const fetchAttackStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.attackStatistics);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAttackStats(data);
      } else {
        setError(data.message || 'Failed to load attack statistics');
      }
    } catch (err) {
      console.error('Error fetching attack statistics:', err);
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-slate-900/50 text-red-400 border border-slate-700/50';
      case 'high': return 'bg-slate-900/50 text-orange-400 border border-slate-700/50';
      case 'medium': return 'bg-slate-900/50 text-yellow-400 border border-slate-700/50';
      case 'low': return 'bg-slate-900/50 text-blue-400 border border-slate-700/50';
      case 'safe': return 'bg-slate-900/50 text-green-400 border border-slate-700/50';
      default: return 'bg-slate-900/50 text-slate-400 border border-slate-700/50';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-slate-900 text-red-400 border border-slate-700';
      case 'high': return 'bg-slate-900 text-orange-400 border border-slate-700';
      case 'medium': return 'bg-slate-900 text-yellow-400 border border-slate-700';
      case 'low': return 'bg-slate-900 text-blue-400 border border-slate-700';
      case 'safe': return 'bg-slate-900 text-green-400 border border-slate-700';
      default: return 'bg-slate-900 text-slate-400 border border-slate-700';
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const filteredCategories = attackStats?.attack_categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExport = () => {
    if (!attackStats?.attack_categories) return;
    
    const csv = [
      ['Attack Type', 'Count', 'Percentage', 'Severity'],
      ...filteredCategories.map(cat => [
        cat.name,
        cat.count,
        cat.percentage + '%',
        cat.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attack_statistics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 text-white animate-spin" />
          <div className="text-white text-lg">Loading attack statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 text-red-200 max-w-md">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">❌</span>
            <strong className="text-lg">Error loading data</strong>
          </div>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchAttackStatistics}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!attackStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">No data available</div>
      </div>
    );
  }

  const { summary, attack_categories, recent_scans } = attackStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Attack Statistics</h2>
            <p className="text-slate-400">Comprehensive analysis of all detected threats</p>
          </div>
          <button
            onClick={fetchAttackStatistics}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition-colors border border-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Scans</p>
              <p className="text-2xl font-bold text-slate-100">{formatNumber(summary.total_scans)}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-slate-300 text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Flows</p>
              <p className="text-2xl font-bold text-slate-100">{formatNumber(summary.total_flows)}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-slate-300 text-xl">🌐</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Attacks</p>
              <p className="text-2xl font-bold text-red-400">{formatNumber(summary.total_attacks)}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-red-400 text-xl">🚨</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Attack Types</p>
              <p className="text-2xl font-bold text-orange-400">{summary.unique_attack_types}</p>
            </div>
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600">
              <span className="text-orange-400 text-xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Export */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search attack types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 py-2 pl-10 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500 focus:bg-slate-800/70 transition-all"
              />
            </div>
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition-colors border border-slate-600"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Attack Categories Table */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Attack Categories Breakdown</h3>
        
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-slate-400 text-lg">
              {searchTerm ? 'No attack types match your search' : 'No attacks detected yet'}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Attack Type</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">Count</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">Percentage</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-medium">Severity</th>
                  <th className="text-center py-3 px-4 text-slate-300 font-medium">Visual</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((attack, index) => (
                  <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 text-slate-100 font-medium">{attack.name}</td>
                    <td className="py-3 px-4 text-right text-slate-100 font-bold">{formatNumber(attack.count)}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{attack.percentage}%</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getSeverityBadgeColor(attack.severity)}`}>
                        {attack.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: attack.color }}
                        ></div>
                        <div className="w-20 bg-slate-700 rounded-full h-2 border border-slate-600">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(attack.percentage * 2, 100)}%`,
                              backgroundColor: attack.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Attack Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {filteredCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Attack Proportions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => percentage > 5 ? `${name}: ${percentage}%` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {filteredCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Scans</h3>
        
        {recent_scans.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No scan history available</p>
        ) : (
          <div className="space-y-3">
            {recent_scans.map((scan, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-slate-100 text-sm font-medium">Security Scan</p>
                    <p className="text-slate-400 text-xs">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">{scan.total_flows} flows</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      scan.attack_count > 10 ? 'bg-red-900/50 text-red-300 border border-red-800/50' :
                      scan.attack_count > 0 ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-800/50' :
                      'bg-green-900/50 text-green-300 border border-green-800/50'
                    }`}>
                      {scan.attack_count} attacks
                    </span>
                  </div>
                </div>
                
                {Object.keys(scan.attack_breakdown).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(scan.attack_breakdown).map(([type, count]) => (
                      <span key={type} className="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300 border border-slate-600/50">
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
