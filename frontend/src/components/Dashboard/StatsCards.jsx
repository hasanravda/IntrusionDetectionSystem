import React from 'react';

export const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <p className="text-2xl font-bold text-white">{stats.totalAttacks.toLocaleString()}</p>
        <p className="text-gray-400 text-sm">Total Attacks</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <p className="text-2xl font-bold text-white">{stats.activeThreats}</p>
        <p className="text-gray-400 text-sm">Active Threats</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <p className="text-2xl font-bold text-white">{stats.blockedIPs}</p>
        <p className="text-gray-400 text-sm">Blocked IPs</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <p className="text-2xl font-bold text-white">{stats.packetsPerSec.toLocaleString()}</p>
        <p className="text-gray-400 text-sm">Packets/Sec</p>
      </div>
    </div>
  );
};
