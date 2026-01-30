import React, { useState } from 'react';
import { ScanButton } from './Dashboard/ScanButton';
import { ScanResults } from './Dashboard/ScanResults';
import { AttackTrends } from './Dashboard/AttackTrends';
import { EventHistory } from './Dashboard/EventHistory';

export const Dashboard = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [attackTrends, setAttackTrends] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);

  const handleScanStart = async () => {
    setIsScanning(true);
    
    try {
      // Call your backend API here
      const response = await fetch('http://localhost:8000/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Update UI with scan results
      setScanResults({
        safe: data.safe || 0,
        warnings: data.warnings || 0,
        threats: data.threats || 0,
        findings: data.findings || []
      });
      
      setAttackTrends(data.trends || []);
      setEventHistory(data.events || []);
      
    } catch (error) {
      console.error('Scan failed:', error);
      // Fallback dummy data for demo
      setScanResults({
        safe: 15,
        warnings: 3,
        threats: 2,
        findings: [
          { type: 'safe', message: 'Network traffic normal', ip: '192.168.1.1' },
          { type: 'warning', message: 'Unusual port activity detected', ip: '192.168.1.100' },
          { type: 'threat', message: 'Potential DDoS attack detected', ip: '203.0.113.45' }
        ]
      });
      
      setAttackTrends([
        { date: 'Mon', attacks: 12, maxAttacks: 50 },
        { date: 'Tue', attacks: 8, maxAttacks: 50 },
        { date: 'Wed', attacks: 15, maxAttacks: 50 },
        { date: 'Thu', attacks: 22, maxAttacks: 50 },
        { date: 'Fri', attacks: 18, maxAttacks: 50 },
        { date: 'Sat', attacks: 5, maxAttacks: 50 },
        { date: 'Sun', attacks: 7, maxAttacks: 50 }
      ]);
      
      setEventHistory([
        { type: 'Port Scan', ip: '192.168.1.100', time: '2 min ago', severity: 'medium' },
        { type: 'DDoS Attempt', ip: '203.0.113.45', time: '5 min ago', severity: 'high' },
        { type: 'Normal Traffic', ip: '192.168.1.1', time: '8 min ago', severity: 'low' }
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
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
