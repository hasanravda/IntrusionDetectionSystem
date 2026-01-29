import React from 'react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Eye, Activity } from 'lucide-react';

export const Charts = ({ attackData, trafficData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attack Distribution */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Attack Distribution</h3>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Last 24h</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={attackData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {attackData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Traffic Overview */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Traffic Analysis</h3>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Real-time</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.5)" />
            <YAxis stroke="rgba(255, 255, 255, 0.5)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fill="url(#colorTraffic)" strokeWidth={2} />
            <Area type="monotone" dataKey="attacks" stroke="#ef4444" fill="url(#colorAttacks)" strokeWidth={2} />
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
