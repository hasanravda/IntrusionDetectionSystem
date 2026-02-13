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
  
  // Files
  download: (filename) => `${API_BASE_URL}/download/${filename}`,
  results: `${API_BASE_URL}/results`,
  
  // Statistics
  stats: `${API_BASE_URL}/stats`,
};

export default API_ENDPOINTS;
