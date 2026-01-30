import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const ScanResults = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Scan Results</h3>
        <p className="text-gray-400">No scan results yet. Click "Start Security Scan" to begin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Scan Results</h3>
      
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{results.safe}</div>
            <div className="text-sm text-gray-400">Safe</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{results.warnings}</div>
            <div className="text-sm text-gray-400">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{results.threats}</div>
            <div className="text-sm text-gray-400">Threats</div>
          </div>
        </div>

        {/* Findings */}
        <div className="space-y-2">
          <h4 className="text-white font-medium">Findings:</h4>
          {results.findings.map((finding, index) => (
            <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                finding.type === 'safe' ? 'bg-green-500/20' :
                finding.type === 'warning' ? 'bg-yellow-500/20' :
                'bg-red-500/20'
              }`}>
                {finding.type === 'safe' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {finding.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                {finding.type === 'threat' && <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{finding.message}</p>
                <p className="text-gray-400 text-xs">{finding.ip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
