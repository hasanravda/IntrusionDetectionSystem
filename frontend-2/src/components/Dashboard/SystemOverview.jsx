import React from 'react';

export const SystemOverview = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-white mb-4">System Performance</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">CPU Usage</span>
              <span className="text-white">34%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{width: '34%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Memory</span>
              <span className="text-white">62%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{width: '62%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Network</span>
              <span className="text-white">45%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{width: '45%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-white mb-4">Top Attack Sources</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono text-sm">203.0.113.45</span>
            <span className="text-red-400 text-sm font-medium">47 attacks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono text-sm">198.51.100.22</span>
            <span className="text-orange-400 text-sm font-medium">32 attacks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono text-sm">172.16.0.25</span>
            <span className="text-yellow-400 text-sm font-medium">28 attacks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono text-sm">192.168.1.100</span>
            <span className="text-blue-400 text-sm font-medium">19 attacks</span>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-white mb-4">Network Statistics</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Data Processed</span>
            <span className="text-white font-medium">{stats.dataProcessed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Uptime</span>
            <span className="text-green-400 font-medium">{stats.uptime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Active Rules</span>
            <span className="text-blue-400 font-medium">1,247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">False Positives</span>
            <span className="text-yellow-400 font-medium">0.3%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
