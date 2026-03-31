import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const getColor = (name) => {
  const n = (name || '').toLowerCase();
  if (n === 'benign') return '#10B981';
  if (n.includes('ddos') || n.includes('dos')) return '#EF4444';
  if (n.includes('scan') || n.includes('port')) return '#F59E0B';
  if (n.includes('brute') || n.includes('bot')) return '#8B5CF6';
  if (n.includes('web') || n.includes('xss') || n.includes('sql')) return '#EC4899';
  return '#3B82F6';
};

export const ScanResults = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Scan Results</h3>
        <p className="text-gray-400">No scan results yet. Click "Start Security Scan" to begin.</p>
      </div>
    );
  }

  const { total_flows = 0, benign_count = 0, attack_count = 0, trends = [] } = results;
  const benignPct = total_flows > 0 ? ((benign_count / total_flows) * 100).toFixed(1) : '0.0';
  const attackPct = total_flows > 0 ? ((attack_count / total_flows) * 100).toFixed(1) : '0.0';

  // Only show attack types (exclude benign) for the breakdown
  const attackBreakdown = trends.filter(t => t.name.toLowerCase() !== 'benign');

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Scan Results</h3>

      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{total_flows.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Total Flows</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{benign_count.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Benign ({benignPct}%)</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{attack_count.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Attacks ({attackPct}%)</div>
          </div>
        </div>

        {/* Attack Distribution */}
        {trends.length > 0 && (
          <>
            <div>
              <h4 className="text-white font-medium mb-3">Attack Distribution</h4>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={trends} margin={{ top: 4, right: 4, left: -20, bottom: 55 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    angle={-35}
                    textAnchor="end"
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value) => [value.toLocaleString(), 'Flows']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {trends.map((entry, i) => (
                      <Cell key={i} fill={getColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-type breakdown */}
            <div className="space-y-2">
              <h4 className="text-white font-medium">Breakdown by Type</h4>
              {trends.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(item.name) }} />
                    <span className="text-gray-100 text-sm truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                    <div className="w-20 bg-gray-700 rounded-full h-1.5 hidden sm:block">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: getColor(item.name) }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm w-12 text-right">{item.count.toLocaleString()}</span>
                    <span className="text-gray-400 text-xs w-10 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {total_flows === 0 && (
          <p className="text-gray-400 text-sm">No traffic captured. Try increasing the scan duration.</p>
        )}
      </div>
    </div>
  );
};
