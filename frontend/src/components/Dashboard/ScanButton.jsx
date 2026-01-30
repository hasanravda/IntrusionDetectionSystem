import React, { useState } from 'react';
import { Play, Shield, AlertTriangle } from 'lucide-react';

export const ScanButton = ({ onScanStart, isScanning }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-4">Network Security Scan</h3>
        <p className="text-gray-400 mb-6">
          Click the button below to start scanning your network for potential threats
        </p>
        
        <button
          onClick={onScanStart}
          disabled={isScanning}
          className={`px-8 py-4 rounded-lg font-semibold transition-all ${
            isScanning 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
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
          {isScanning ? 'Analyzing network traffic...' : 'Ready to scan'}
        </div>
      </div>
    </div>
  );
};
