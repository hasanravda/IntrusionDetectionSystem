// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // General
  root: `${API_BASE_URL}/`,
  health: `${API_BASE_URL}/health`,
  
  // Model
  modelInfo: `${API_BASE_URL}/model/info`,
  modelReload: `${API_BASE_URL}/model/reload`,
  labels: `${API_BASE_URL}/labels`,
  
  // Prediction
  predict: `${API_BASE_URL}/predict`,
  predictCsv: `${API_BASE_URL}/predict/csv`,
  
  // Live Capture
  liveScan: `${API_BASE_URL}/scan/live`,
  scanResults: `${API_BASE_URL}/scan-results`,
  scanStatus: `${API_BASE_URL}/scan-status`,
  scanHistory: `${API_BASE_URL}/scan-history`,
  
  // Continuous Monitoring
  startMonitoring: `${API_BASE_URL}/monitoring/start`,
  stopMonitoring: `${API_BASE_URL}/monitoring/stop`,
  monitoringStatus: `${API_BASE_URL}/monitoring/status`,
  websocket: `${API_BASE_URL.replace('http', 'ws')}/ws`,
  
  // Packet Monitor
  startPacketMonitor: `${API_BASE_URL}/packet-monitor/start`,
  stopPacketMonitor: `${API_BASE_URL}/packet-monitor/stop`,
  packetMonitorStatus: `${API_BASE_URL}/packet-monitor/status`,
  
  // Statistics
  attackStatistics: `${API_BASE_URL}/attack-statistics`,
  stats: `${API_BASE_URL}/stats`,
};

export default API_ENDPOINTS;
