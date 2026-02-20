import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

export const ConnectionTest = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('checking');
        setMessage('Testing backend connection...');

        // Test basic health endpoint
        const healthResponse = await fetch(API_ENDPOINTS.health);
        const healthData = await healthResponse.json();

        // Test model info endpoint
        const modelResponse = await fetch(API_ENDPOINTS.modelInfo);
        const modelData = await modelResponse.json();

        setStatus('connected');
        setMessage('Successfully connected to NIDS backend!');
        setDetails({
          health: healthData,
          model: modelData,
          api_url: API_ENDPOINTS.health
        });

      } catch (error) {
        setStatus('error');
        setMessage(`Connection failed: ${error.message}`);
        setDetails({
          error: error.message,
          api_url: API_ENDPOINTS.health
        });
      }
    };

    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch(status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch(status) {
      case 'connected':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">Backend Connection Status</h3>
      
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <div>
          <p className="font-medium text-white capitalize">{status}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>

      {details && (
        <div className="mt-4 space-y-2">
          <h4 className="text-white font-medium mb-2">Connection Details:</h4>
          
          {details.health && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                <strong>Backend Health:</strong> {details.health.status}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Model Loaded:</strong> {details.health.model_loaded ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Timestamp:</strong> {new Date(details.health.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {details.model && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                <strong>Model Path:</strong> {details.model.model_path}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Features:</strong> {details.model.feature_count}
              </p>
            </div>
          )}

          {details.error && (
            <div className="bg-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-300">
                <strong>Error:</strong> {details.error}
              </p>
              <p className="text-sm text-red-300">
                <strong>API URL:</strong> {details.api_url}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
