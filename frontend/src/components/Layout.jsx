import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Shield, Activity, AlertTriangle, BarChart3, Settings, History, Menu, X, Bell, Search } from 'lucide-react';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600', path: '/' },
  ];

  const isActive = (path) => {
    return location.pathname === path || (path === '/' && location.pathname === '/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">NIDS</h1>
                  <p className="text-xs text-gray-400">Network Intrusion Detection System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threats, IPs, events..."
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all w-64"
                />
              </div>
              <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-green-400">System Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white/5 backdrop-blur-md border-r border-white/10 overflow-hidden`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full group transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                      : 'hover:bg-white/10 text-gray-300 hover:text-white'
                  } rounded-xl p-4 flex items-center space-x-3`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive(item.path) 
                      ? 'bg-white/20' 
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs opacity-70">
                      {item.id === 'dashboard' && 'System Overview'}
                      {item.id === 'monitoring' && 'Real-time Detection'}
                      {item.id === 'alerts' && 'Security Events'}
                      {item.id === 'analysis' && 'Threat Intelligence'}
                      {item.id === 'history' && 'Historical Data'}
                      {item.id === 'settings' && 'Configuration'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* System Status Card */}
          <div className="p-4 m-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">System Health</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">CPU Usage</span>
                <span className="text-white">34%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full" style={{width: '34%'}}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Memory</span>
                <span className="text-white">62%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full" style={{width: '62%'}}></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
