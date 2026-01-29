import React, { useState } from 'react';
import { Save, RotateCcw, Shield, Bell, Database, Network, AlertTriangle } from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Network Intrusion Detection System',
    refreshInterval: 5,
    maxLogEntries: 10000,
    timezone: 'UTC',
    language: 'English'
  });

  // Detection Settings
  const [detectionSettings, setDetectionSettings] = useState({
    sensitivityLevel: 'medium',
    confidenceThreshold: 75,
    autoBlockEnabled: true,
    blockDuration: 3600,
    enableMLModel: true,
    enableSignatureBased: true,
    enableAnomalyDetection: true
  });

  // Alert Settings
  const [alertSettings, setAlertSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    webhookEnabled: false,
    webhookUrl: '',
    emailRecipients: ['admin@company.com', 'security@company.com'],
    alertCooldown: 300,
    severityThreshold: 'medium'
  });

  // Network Settings
  const [networkSettings, setNetworkSettings] = useState({
    captureInterface: 'auto',
    packetBufferSize: 1000000,
    maxFlowTimeout: 300,
    enableIPv6: true,
    excludedNetworks: ['127.0.0.0/8', '192.168.0.0/16'],
    enablePromiscuousMode: false
  });

  // Database Settings
  const [databaseSettings, setDatabaseSettings] = useState({
    retentionPeriod: 90,
    autoCleanup: true,
    compressionEnabled: true,
    backupEnabled: true,
    backupInterval: 'daily',
    maxDatabaseSize: '10GB'
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Shield },
    { id: 'detection', label: 'Detection', icon: AlertTriangle },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'database', label: 'Database', icon: Database }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // In a real app, this would save to backend
  };

  const handleReset = () => {
    // Reset to defaults
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">System Name</label>
          <input
            type="text"
            value={generalSettings.systemName}
            onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Refresh Interval (seconds)</label>
          <input
            type="number"
            value={generalSettings.refreshInterval}
            onChange={(e) => setGeneralSettings({...generalSettings, refreshInterval: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Log Entries</label>
          <input
            type="number"
            value={generalSettings.maxLogEntries}
            onChange={(e) => setGeneralSettings({...generalSettings, maxLogEntries: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
          <select
            value={generalSettings.timezone}
            onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
            <option value="PST">PST</option>
            <option value="GMT">GMT</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDetectionSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sensitivity Level</label>
          <select
            value={detectionSettings.sensitivityLevel}
            onChange={(e) => setDetectionSettings({...detectionSettings, sensitivityLevel: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="paranoid">Paranoid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confidence Threshold (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={detectionSettings.confidenceThreshold}
            onChange={(e) => setDetectionSettings({...detectionSettings, confidenceThreshold: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Block Duration (seconds)</label>
          <input
            type="number"
            value={detectionSettings.blockDuration}
            onChange={(e) => setDetectionSettings({...detectionSettings, blockDuration: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium">Detection Methods</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={detectionSettings.enableMLModel}
            onChange={(e) => setDetectionSettings({...detectionSettings, enableMLModel: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Machine Learning Model</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={detectionSettings.enableSignatureBased}
            onChange={(e) => setDetectionSettings({...detectionSettings, enableSignatureBased: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Signature-based Detection</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={detectionSettings.enableAnomalyDetection}
            onChange={(e) => setDetectionSettings({...detectionSettings, enableAnomalyDetection: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Anomaly Detection</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={detectionSettings.autoBlockEnabled}
            onChange={(e) => setDetectionSettings({...detectionSettings, autoBlockEnabled: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Automatic IP Blocking</span>
        </label>
      </div>
    </div>
  );

  const renderAlertSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Notification Channels</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={alertSettings.emailNotifications}
            onChange={(e) => setAlertSettings({...alertSettings, emailNotifications: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Email Notifications</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={alertSettings.smsNotifications}
            onChange={(e) => setAlertSettings({...alertSettings, smsNotifications: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>SMS Notifications</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={alertSettings.webhookEnabled}
            onChange={(e) => setAlertSettings({...alertSettings, webhookEnabled: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Webhook Notifications</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
          <input
            type="url"
            value={alertSettings.webhookUrl}
            onChange={(e) => setAlertSettings({...alertSettings, webhookUrl: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="https://your-webhook-url.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Alert Cooldown (seconds)</label>
          <input
            type="number"
            value={alertSettings.alertCooldown}
            onChange={(e) => setAlertSettings({...alertSettings, alertCooldown: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Severity Threshold</label>
          <select
            value={alertSettings.severityThreshold}
            onChange={(e) => setAlertSettings({...alertSettings, severityThreshold: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email Recipients</label>
        <textarea
          value={alertSettings.emailRecipients.join('\n')}
          onChange={(e) => setAlertSettings({...alertSettings, emailRecipients: e.target.value.split('\n').filter(email => email.trim())})}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          rows={4}
          placeholder="admin@company.com&#10;security@company.com"
        />
      </div>
    </div>
  );

  const renderNetworkSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Capture Interface</label>
          <select
            value={networkSettings.captureInterface}
            onChange={(e) => setNetworkSettings({...networkSettings, captureInterface: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="auto">Auto-detect</option>
            <option value="eth0">eth0</option>
            <option value="wlan0">wlan0</option>
            <option value="any">Any Interface</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Packet Buffer Size</label>
          <input
            type="number"
            value={networkSettings.packetBufferSize}
            onChange={(e) => setNetworkSettings({...networkSettings, packetBufferSize: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Flow Timeout (seconds)</label>
          <input
            type="number"
            value={networkSettings.maxFlowTimeout}
            onChange={(e) => setNetworkSettings({...networkSettings, maxFlowTimeout: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium">Network Options</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={networkSettings.enableIPv6}
            onChange={(e) => setNetworkSettings({...networkSettings, enableIPv6: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable IPv6 Support</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={networkSettings.enablePromiscuousMode}
            onChange={(e) => setNetworkSettings({...networkSettings, enablePromiscuousMode: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Promiscuous Mode</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Excluded Networks</label>
        <textarea
          value={networkSettings.excludedNetworks.join('\n')}
          onChange={(e) => setNetworkSettings({...networkSettings, excludedNetworks: e.target.value.split('\n').filter(net => net.trim())})}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          rows={4}
          placeholder="127.0.0.0/8&#10;192.168.0.0/16"
        />
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Data Retention Period (days)</label>
          <input
            type="number"
            value={databaseSettings.retentionPeriod}
            onChange={(e) => setDatabaseSettings({...databaseSettings, retentionPeriod: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Database Size</label>
          <select
            value={databaseSettings.maxDatabaseSize}
            onChange={(e) => setDatabaseSettings({...databaseSettings, maxDatabaseSize: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="1GB">1 GB</option>
            <option value="5GB">5 GB</option>
            <option value="10GB">10 GB</option>
            <option value="50GB">50 GB</option>
            <option value="100GB">100 GB</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Backup Interval</label>
          <select
            value={databaseSettings.backupInterval}
            onChange={(e) => setDatabaseSettings({...databaseSettings, backupInterval: e.target.value})}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium">Database Options</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={databaseSettings.autoCleanup}
            onChange={(e) => setDatabaseSettings({...databaseSettings, autoCleanup: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Automatic Cleanup</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={databaseSettings.compressionEnabled}
            onChange={(e) => setDatabaseSettings({...databaseSettings, compressionEnabled: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Data Compression</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={databaseSettings.backupEnabled}
            onChange={(e) => setDatabaseSettings({...databaseSettings, backupEnabled: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span>Enable Automatic Backups</span>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'detection':
        return renderDetectionSettings();
      case 'alerts':
        return renderAlertSettings();
      case 'network':
        return renderNetworkSettings();
      case 'database':
        return renderDatabaseSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Settings</h2>
          <div className="flex items-center space-x-3">
            {saved && (
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Settings saved successfully!
              </span>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
