import React from 'react';

export const SystemOverview = ({ stats }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-gray-400 text-sm">CPU Usage</p>
          <p className="text-white font-medium">34%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Memory</p>
          <p className="text-white font-medium">62%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Uptime</p>
          <p className="text-green-400 font-medium">{stats.uptime}</p>
        </div>
      </div>
    </div>
  );
};
