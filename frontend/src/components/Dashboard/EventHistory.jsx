import React from 'react';

export const EventHistory = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Event History</h3>
        <p className="text-gray-400">No events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Recent Events</h3>
      
      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white text-sm font-medium">{event.type}</p>
                <p className="text-gray-400 text-xs">{event.ip}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">{event.time}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  event.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                  event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {event.severity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
