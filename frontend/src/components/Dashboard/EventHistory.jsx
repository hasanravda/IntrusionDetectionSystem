import React from 'react';

export const EventHistory = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Scan History</h3>
        <p className="text-gray-400">No scan history available yet.</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (risk_level) => {
    switch (risk_level?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getAttackTypesDisplay = (attack_breakdown) => {
    if (!attack_breakdown || Object.keys(attack_breakdown).length === 0) {
      return 'None';
    }
    return Object.keys(attack_breakdown).join(', ');
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Scan History</h3>
      
      <div className="space-y-3">
        {events.map((scan, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-white text-sm font-medium">Network Security Scan</p>
                <p className="text-gray-400 text-xs">{formatDate(scan.timestamp)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded capitalize ${getSeverityColor(scan.risk_level)}`}>
                {scan.risk_level || 'Unknown'} Risk
              </span>
            </div>
            
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-3">
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="text-white ml-2">{scan.duration}s</span>
              </div>
              <div>
                <span className="text-gray-400">Total Flows:</span>
                <span className="text-white ml-2">{scan.total_flows}</span>
              </div>
              <div>
                <span className="text-gray-400">Benign:</span>
                <span className="text-green-400 ml-2">{scan.benign_count}</span>
              </div>
              <div>
                <span className="text-gray-400">Attacks:</span>
                <span className="text-red-400 ml-2">{scan.attack_count}</span>
              </div>
            </div>
            
            {/* Attack Types */}
            {scan.attack_types > 0 && (
              <div className="border-t border-white/10 pt-2">
                <p className="text-gray-400 text-xs mb-1">Attack Types ({scan.attack_types}):</p>
                <p className="text-gray-300 text-xs">{getAttackTypesDisplay(scan.attack_breakdown)}</p>
              </div>
            )}
            
            {/* Additional Info */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
              <span>{scan.threats || 0} threats detected</span>
              <span>{scan.warnings || 0} warnings</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
