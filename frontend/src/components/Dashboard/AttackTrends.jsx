import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AttackTrends = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Attack Distribution</h3>
        <p className="text-gray-400">No trend data available yet.</p>
      </div>
    );
  }
  const getColor = (name) => {
    if (name.toLowerCase() === 'benign') return '#10B981'; // Green
    if (name.includes('DDoS') || name.includes('DoS')) return '#EF4444'; // Red
    if (name.includes('Scan')) return '#F59E0B'; // Orange
    return '#3B82F6'; // Blue
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Attack Distribution</h3>
      
      <div className="space-y-4">
        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {trends.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* List View */}
        <div className="space-y-2">
          {trends.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(item.name) }}
                ></div>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">{item.count} flows</span>
                <span className="text-gray-400 text-sm">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
