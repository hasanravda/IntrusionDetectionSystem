import React from 'react';

export const AttackTrends = ({ trends }) => {
  if (!trends) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Attack Trends</h3>
        <p className="text-gray-400">No trend data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Attack Trends (Last 7 Days)</h3>
      
      <div className="space-y-3">
        {trends.map((day, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-300">{day.date}</span>
            <div className="flex items-center space-x-4">
              <span className="text-white">{day.attacks} attacks</span>
              <div className="w-32 bg-white/10 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{width: `${(day.attacks / day.maxAttacks) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
