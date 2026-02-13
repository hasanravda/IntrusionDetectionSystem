import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export const ScanResults = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Scan Results</h3>
        <p className="text-gray-400">No scan results yet. Click "Start Security Scan" to begin.</p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch(type) {
      case 'safe': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'threat': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'safe': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'threat': return 'bg-red-500/20';
      case 'info': return 'bg-blue-500/20';
      case 'error': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Scan Results</h3>
      
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{results.safe}</div>
            <div className="text-sm text-gray-300 mt-1">Safe Flows</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{results.warnings}</div>
            <div className="text-sm text-gray-300 mt-1">Warnings</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{results.threats}</div>
            <div className="text-sm text-gray-300 mt-1">Threats</div>
          </div>
        </div>

        {/* Findings */}
        {results.findings && results.findings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">Findings:</h4>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {results.findings.map((finding, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getBgColor(finding.type)}`}>
                    {getIcon(finding.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{finding.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{finding.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
