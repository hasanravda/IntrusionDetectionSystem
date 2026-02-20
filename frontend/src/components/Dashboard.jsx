import React, { useState } from 'react';
import { ScanButton } from './Dashboard/ScanButton';
import { ScanResults } from './Dashboard/ScanResults';
import { AttackTrends } from './Dashboard/AttackTrends';
import { EventHistory } from './Dashboard/EventHistory';
import { ConnectionTest } from './ConnectionTest';
import API_ENDPOINTS from '../config/api';

export const Dashboard = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [attackTrends, setAttackTrends] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [error, setError] = useState(null);
  const [scanDuration, setScanDuration] = useState(60);

  const handleScanStart = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      console.log('Starting scan with duration:', scanDuration);
      
      // Call the real backend live scan API
      const response = await fetch(`${API_ENDPOINTS.liveScan}?duration=${scanDuration}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Scan failed');
      }
      
      const data = await response.json();
      console.log('Scan response:', data);
      
      // Update UI with real scan results
      setScanResults({
        safe: data.statistics?.safe || 0,
        warnings: data.statistics?.warnings || 0,
        threats: data.statistics?.threats || 0,
        findings: data.findings || []
      });
      
      setAttackTrends(data.trends || []);
      setEventHistory(data.events || []);
      
    } catch (error) {
      console.error('Scan error:', error);
      setError(error.message);
      
      // Fallback dummy data for demo
      setScanResults({
        safe: 15,
        warnings: 3,
        threats: 2,
        findings: [
          { type: 'safe', message: 'Network traffic normal', ip: '192.168.1.1' },
          { type: 'warning', message: 'Unusual port activity detected', ip: '192.168.1.100' },
          { type: 'threat', message: 'Potential DDoS attack detected', ip: '203.0.113.45' },
          { type: 'error', message: `Scan failed: ${error.message}`, ip: 'System' }
        ]
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scan Duration Control */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Capture Duration (seconds)
        </label>
        <input
          type="number"
          min="10"
          max="300"
          value={scanDuration}
          onChange={(e) => setScanDuration(parseInt(e.target.value))}
          disabled={isScanning}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Recommended: 60 seconds for comprehensive analysis
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Scan Button */}
      <ScanButton onScanStart={handleScanStart} isScanning={isScanning} />
      
      {/* Scan Results */}
      <ScanResults results={scanResults} />
      
      {/* Attack Trends */}
      <AttackTrends trends={attackTrends} />
      
      {/* Event History */}
      <EventHistory events={eventHistory} />
    </div>
  );
};
