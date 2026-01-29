import React from 'react';
import { AlertTriangle, Clock, Eye } from 'lucide-react';

export const RecentAlerts = ({ recentAlerts, getSeverityColor, getStatusColor }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Security Events</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          View All →
        </button>
      </div>
      <div className="space-y-3">
        {recentAlerts.map((alert) => (
          <div key={alert.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${getSeverityColor(alert.severity)} rounded-lg flex items-center justify-center`}>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{alert.type}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </span>
                    <span>{alert.src} → {alert.dst}</span>
                    <span>Confidence: {alert.confidence}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
