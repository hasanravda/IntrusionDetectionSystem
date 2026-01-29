import React from 'react';
import { Target, AlertTriangle, Shield, Zap, ArrowUp, ArrowDown } from 'lucide-react';

export const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            12%
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.totalAttacks.toLocaleString()}</p>
        <p className="text-blue-300 text-sm">Total Attacks</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md border border-orange-500/30 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center text-red-400 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            8%
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.activeThreats}</p>
        <p className="text-orange-300 text-sm">Active Threats</p>
      </div>

      <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            24%
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.blockedIPs}</p>
        <p className="text-red-300 text-sm">Blocked IPs</p>
      </div>

      <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <ArrowDown className="w-4 h-4 mr-1" />
            3%
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{stats.packetsPerSec.toLocaleString()}</p>
        <p className="text-green-300 text-sm">Packets/Sec</p>
      </div>
    </div>
  );
};
