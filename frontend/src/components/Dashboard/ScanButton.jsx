import { Play } from 'lucide-react';

export const ScanButton = ({ onScanStart, isScanning }) => {
  return (
    <div className="panel p-6">
      <div className="text-center">
        <h3 className="mb-3 text-xl font-semibold text-slate-100">Network Security Scan</h3>
        <p className="mb-6 text-sm text-slate-400">
          Click the button below to start scanning your network for potential threats
        </p>
        
        <button
          onClick={onScanStart}
          disabled={isScanning}
          className={`px-8 py-4 rounded-lg font-semibold transition-all ${
            isScanning 
              ? 'cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-400' 
              : 'border border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25'
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
