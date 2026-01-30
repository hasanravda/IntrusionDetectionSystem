import React, { useState, useEffect } from 'react';
import { Search, Filter, Bell, BellOff, Trash2, Eye, AlertTriangle, Shield, X, Activity } from 'lucide-react';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [notifications, setNotifications] = useState(true);

  // Generate dummy alerts
  const generateAlerts = () => {
    const alertTypes = ['DDoS Attack', 'Port Scan', 'Brute Force', 'Malware Detection', 'SQL Injection', 'XSS Attack'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const sources = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45', '198.51.100.22'];
    const destinations = ['10.0.0.1', '192.168.1.1', '172.16.0.1', '8.8.8.8'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      description: `Suspicious activity detected from ${sources[0]} targeting ${destinations[0]}`,
      confidence: Math.floor(Math.random() * 30) + 70,
      status: Math.random() > 0.3 ? 'active' : 'resolved',
      details: {
        protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
        port: Math.floor(Math.random() * 65535),
        packets: Math.floor(Math.random() * 1000) + 100,
        duration: Math.floor(Math.random() * 300) + 10
      }
    }));
  };

  useEffect(() => {
    const dummyAlerts = generateAlerts();
    setAlerts(dummyAlerts);
    setFilteredAlerts(dummyAlerts);
  }, []);

  useEffect(() => {
    let filtered = alerts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.source.includes(searchTerm) ||
        alert.destination.includes(searchTerm)
      );
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, severityFilter, typeFilter]);

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

  const markAsResolved = (alertId) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const deleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setSelectedAlert(null);
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    setFilteredAlerts([]);
    setSelectedAlert(null);
  };

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    active: alerts.filter(a => a.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold">{alertStats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-500">{alertStats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Priority</p>
              <p className="text-3xl font-bold text-orange-500">{alertStats.high}</p>
            </div>
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-500">{alertStats.active}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="DDoS Attack">DDoS Attack</option>
              <option value="Port Scan">Port Scan</option>
              <option value="Brute Force">Brute Force</option>
              <option value="Malware Detection">Malware Detection</option>
              <option value="SQL Injection">SQL Injection</option>
              <option value="XSS Attack">XSS Attack</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNotifications(!notifications)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                notifications ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span>{notifications ? 'Notifications On' : 'Notifications Off'}</span>
            </button>

            <button
              onClick={clearAllAlerts}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold">Alert List</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-6">Severity</th>
                <th className="text-left py-3 px-6">Type</th>
                <th className="text-left py-3 px-6">Source</th>
                <th className="text-left py-3 px-6">Destination</th>
                <th className="text-left py-3 px-6">Time</th>
                <th className="text-left py-3 px-6">Confidence</th>
                <th className="text-left py-3 px-6">Status</th>
                <th className="text-left py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No alerts found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityBgColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6">{alert.type}</td>
                    <td className="py-3 px-6 font-mono text-sm">{alert.source}</td>
                    <td className="py-3 px-6 font-mono text-sm">{alert.destination}</td>
                    <td className="py-3 px-6 text-sm text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              alert.confidence >= 90 ? 'bg-green-500' :
                              alert.confidence >= 80 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${alert.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm">{alert.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded text-xs ${
                        alert.status === 'active' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-gray-900 text-gray-400'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {alert.status === 'active' && (
                          <button
                            onClick={() => markAsResolved(alert.id)}
                            className="p-1 hover:bg-gray-600 rounded text-green-500"
                            title="Mark as Resolved"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-1 hover:bg-gray-600 rounded text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <p className="font-semibold">{selectedAlert.type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Severity</p>
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityBgColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Source IP</p>
                  <p className="font-mono">{selectedAlert.source}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Destination IP</p>
                  <p className="font-mono">{selectedAlert.destination}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Protocol</p>
                  <p>{selectedAlert.details.protocol}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Port</p>
                  <p>{selectedAlert.details.port}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Packets</p>
                  <p>{selectedAlert.details.packets}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p>{selectedAlert.details.duration}s</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Confidence</p>
                  <p>{selectedAlert.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedAlert.status === 'active' 
                      ? 'bg-green-900 text-green-200' 
                      : 'bg-gray-900 text-gray-400'
                  }`}>
                    {selectedAlert.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Description</p>
                <p className="text-gray-200">{selectedAlert.description}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Timestamp</p>
                <p>{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                {selectedAlert.status === 'active' && (
                  <button
                    onClick={() => {
                      markAsResolved(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
