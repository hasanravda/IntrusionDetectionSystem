import React from 'react';
import { Play } from 'lucide-react';

export const ScanButton = ({ onScanStart, isScanning }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Network Security Scan</h3>
        <p className="text-gray-400 mb-6">
          Click the button below to start a 30-second scan of your network for potential threats.
        </p>

        <button
          onClick={onScanStart}
          disabled={isScanning}
          className={`w-32 h-32 md:w-40 md:h-40 rounded-full font-semibold transition-all flex items-center justify-center mx-auto border-4 ${
            isScanning 
              ? 'bg-gray-600 border-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-500 border-blue-300 hover:bg-blue-600 hover:border-blue-200 text-white hover:scale-105 shadow-lg shadow-blue-500/40'
          }`}
        >
          {isScanning ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Scanning...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Start Security Scan</span>
            </div>
          )}
        </button>

        <div className="mt-4 text-sm text-gray-400">
          {isScanning ? 'Analyzing live network traffic for threats...' : 'Ready to run a 30-second scan'}
        </div>
      </div>
    </div>
  );
};
