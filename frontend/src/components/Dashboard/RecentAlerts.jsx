import React from 'react';

export const RecentAlerts = ({ recentAlerts }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">Recent Alerts</h3>
      <div className="space-y-3">
        {recentAlerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{alert.type}</p>
                <p className="text-gray-400 text-sm">{alert.time} • {alert.src}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                alert.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {alert.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
