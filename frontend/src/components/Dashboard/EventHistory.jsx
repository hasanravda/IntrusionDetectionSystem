
export const EventHistory = ({ events, loading = false }) => {
  if (loading) {
    return (
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Scan History</h3>
        <p className="text-sm text-slate-400">Loading recent scans...</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Scan History</h3>
        <p className="text-sm text-slate-400">No scan history available yet.</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (risk_level) => {
    switch (risk_level?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getAttackTypesDisplay = (attack_breakdown) => {
    if (!attack_breakdown || Object.keys(attack_breakdown).length === 0) {
      return 'None';
    }
    return Object.keys(attack_breakdown).join(', ');
  };

  return (
    <div className="panel p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Scan History</h3>
      
      <div className="space-y-3">
        {events.map((scan, index) => (
          <div key={index} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-medium text-slate-100">Network Security Scan</p>
                <p className="text-xs text-slate-400">{formatDate(scan.timestamp)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded capitalize ${getSeverityColor(scan.risk_level)}`}>
                {scan.risk_level || 'Unknown'} Risk
              </span>
            </div>
            
            {/* Main Stats Grid */}
            <div className="mb-3 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Duration:</span>
                <span className="ml-2 text-slate-100">{scan.duration}s</span>
              </div>
              <div>
                <span className="text-slate-400">Total Flows:</span>
                <span className="ml-2 text-slate-100">{scan.total_flows}</span>
              </div>
              <div>
                <span className="text-slate-400">Benign:</span>
                <span className="ml-2 text-green-400">{scan.benign_count}</span>
              </div>
              <div>
                <span className="text-slate-400">Attacks:</span>
                <span className="ml-2 text-red-400">{scan.attack_count}</span>
              </div>
            </div>
            
            {/* Attack Types */}
            {scan.attack_types > 0 && (
              <div className="border-t border-slate-700 pt-2">
                <p className="mb-1 text-xs text-slate-400">Attack Types ({scan.attack_types}):</p>
                <p className="text-xs text-slate-300">{getAttackTypesDisplay(scan.attack_breakdown)}</p>
              </div>
            )}
            
            {/* Additional Info */}
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{scan.threats || 0} threats detected</span>
              <span>{scan.warnings || 0} warnings</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
