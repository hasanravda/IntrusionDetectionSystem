import React from 'react';

export const Charts = ({ attackData, trafficData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Attack Types */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Attack Types</h3>
        <div className="space-y-2">
          {attackData.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <span className="text-gray-300">{item.name}</span>
              <span className="text-white font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Summary */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Traffic Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Average Traffic</span>
            <span className="text-white font-medium">1,800 packets/sec</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Peak Attacks</span>
            <span className="text-white font-medium">18 attacks/hour</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Blocked Rate</span>
            <span className="text-white font-medium">94%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
