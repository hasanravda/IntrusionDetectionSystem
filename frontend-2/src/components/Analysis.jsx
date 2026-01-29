import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Shield, Activity, Target, Clock, Globe, AlertTriangle } from 'lucide-react';

export const Analysis = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('attacks');

  // Dummy data for different time ranges
  const generateTimeSeriesData = () => {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const dataPoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    
    return Array.from({ length: dataPoints }, (_, i) => ({
      time: timeRange === '24h' ? `${i}:00` : timeRange === '7d' ? `Day ${i + 1}` : `Day ${i + 1}`,
      attacks: Math.floor(Math.random() * 100) + 20,
      blocked: Math.floor(Math.random() * 80) + 10,
      traffic: Math.floor(Math.random() * 10000) + 2000,
      threats: Math.floor(Math.random() * 50) + 5
    }));
  };

  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());

  const [attackPatterns, setAttackPatterns] = useState([
    { name: 'DDoS', value: 35, color: '#ef4444' },
    { name: 'Port Scan', value: 25, color: '#f59e0b' },
    { name: 'Brute Force', value: 20, color: '#8b5cf6' },
    { name: 'Malware', value: 15, color: '#10b981' },
    { name: 'SQL Injection', value: 5, color: '#3b82f6' }
  ]);

  const [threatIntelligence, setThreatIntelligence] = useState([
    { country: 'China', attacks: 245, severity: 'high' },
    { country: 'Russia', attacks: 189, severity: 'high' },
    { country: 'United States', attacks: 156, severity: 'medium' },
    { country: 'North Korea', attacks: 134, severity: 'high' },
    { country: 'Iran', attacks: 98, severity: 'medium' },
    { country: 'Brazil', attacks: 67, severity: 'low' }
  ]);

  const [featureImportance, setFeatureImportance] = useState([
    { feature: 'Packet Size', importance: 92, A: 92, fullMark: 100 },
    { feature: 'Flow Duration', importance: 85, A: 85, fullMark: 100 },
    { feature: 'Protocol Type', importance: 78, A: 78, fullMark: 100 },
    { feature: 'Port Number', importance: 71, A: 71, fullMark: 100 },
    { feature: 'TCP Flags', importance: 65, A: 65, fullMark: 100 },
    { feature: 'Inter-arrival Time', importance: 58, A: 58, fullMark: 100 }
  ]);

  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 94.5,
    precision: 92.3,
    recall: 89.7,
    f1Score: 91.0,
    falsePositiveRate: 2.3,
    falseNegativeRate: 1.8
  });

  useEffect(() => {
    setTimeSeriesData(generateTimeSeriesData());
  }, [timeRange]);

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-green-500'
    };
    return colors[severity] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Threat Analysis & Intelligence</h2>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="attacks">Attack Volume</option>
              <option value="blocked">Blocked Attacks</option>
              <option value="traffic">Traffic Volume</option>
              <option value="threats">Threat Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Accuracy</p>
              <p className="text-xl font-bold text-green-500">{modelMetrics.accuracy}%</p>
            </div>
            <Target className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Precision</p>
              <p className="text-xl font-bold text-blue-500">{modelMetrics.precision}%</p>
            </div>
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Recall</p>
              <p className="text-xl font-bold text-purple-500">{modelMetrics.recall}%</p>
            </div>
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">F1 Score</p>
              <p className="text-xl font-bold text-yellow-500">{modelMetrics.f1Score}%</p>
            </div>
            <TrendingUp className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">False Positive</p>
              <p className="text-xl font-bold text-orange-500">{modelMetrics.falsePositiveRate}%</p>
            </div>
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">False Negative</p>
              <p className="text-xl font-bold text-red-500">{modelMetrics.falseNegativeRate}%</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Analysis */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Attack Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#ef4444" 
                strokeWidth={2}
                name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attack Pattern Distribution */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Attack Pattern Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attackPatterns}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attackPatterns.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Feature Importance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={featureImportance}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="feature" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="Importance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Intelligence by Country */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Threat Intelligence by Origin</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={threatIntelligence}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="country" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Bar dataKey="attacks" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Threat Intelligence Table */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Threat Intelligence Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Country</th>
                <th className="text-left py-3 px-4">Attack Count</th>
                <th className="text-left py-3 px-4">Severity</th>
                <th className="text-left py-3 px-4">Common Attack Types</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {threatIntelligence.map((threat, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{threat.country}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{threat.attacks}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${getSeverityColor(threat.severity)}`}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {['DDoS', 'Port Scan', 'Malware'].slice(0, Math.floor(Math.random() * 3) + 1).map((type, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      threat.severity === 'high' ? 'bg-red-900 text-red-200' :
                      threat.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-green-900 text-green-200'
                    }`}>
                      {threat.severity === 'high' ? 'MONITORING' : threat.severity === 'medium' ? 'WATCH' : 'LOW RISK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attack Correlation Matrix */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Attack Correlation Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-3">Peak Attack Times</h4>
            <div className="space-y-2">
              {[
                { time: '14:00 - 16:00', attacks: 234, percentage: 35 },
                { time: '22:00 - 00:00', attacks: 189, percentage: 28 },
                { time: '08:00 - 10:00', attacks: 156, percentage: 23 },
                { time: '02:00 - 04:00', attacks: 89, percentage: 14 }
              ].map((period, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{period.time}</p>
                    <p className="text-sm text-gray-400">{period.attacks} attacks</p>
                  </div>
                  <div className="text-right">
                    <div className="w-20 bg-gray-600 rounded-full h-2 mb-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${period.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{period.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-3">Attack Success Rate</h4>
            <div className="space-y-2">
              {[
                { type: 'DDoS', attempted: 450, blocked: 412, successRate: 8.4 },
                { type: 'Port Scan', attempted: 320, blocked: 298, successRate: 6.9 },
                { type: 'Brute Force', attempted: 180, blocked: 165, successRate: 8.3 },
                { type: 'Malware', attempted: 95, blocked: 87, successRate: 8.4 }
              ].map((attack, index) => (
                <div key={index} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{attack.type}</span>
                    <span className={`text-sm ${
                      attack.successRate < 10 ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {attack.successRate}% success
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{attack.attempted} attempted</span>
                    <span>→</span>
                    <span className="text-green-500">{attack.blocked} blocked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
