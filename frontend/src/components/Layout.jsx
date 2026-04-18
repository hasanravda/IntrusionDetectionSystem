import { Activity, BarChart3, Bell, Circle, History, Menu, Search, Settings, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600', path: '/dashboard' },
    { id: 'monitoring', label: 'Live Monitor', icon: Activity, color: 'from-green-500 to-green-600', path: '/monitoring' },
    // { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle, color: 'from-red-500 to-red-600', path: '/alerts' },
    // { id: 'analysis', label: 'Threat Analysis', icon: Shield, color: 'from-purple-500 to-purple-600', path: '/analysis' },
    { id: 'history', label: 'Event History', icon: History, color: 'from-orange-500 to-orange-600', path: '/history' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600', path: '/settings' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.health, { method: 'GET' });
        if (!response.ok) {
          throw new Error('health endpoint unavailable');
        }
        const data = await response.json();
        if (!isMounted) {
          return;
        }

        if (data.model_loaded) {
          setServiceStatus('connected');
        } else {
          setServiceStatus('degraded');
        }
      } catch (error) {
        if (isMounted) {
          setServiceStatus('disconnected');
        }
      }
    };

    checkHealth();
    const intervalId = window.setInterval(checkHealth, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const serviceStatusClass =
    serviceStatus === 'connected'
      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
      : serviceStatus === 'degraded'
      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
      : serviceStatus === 'checking'
      ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30';

  return (
    <div className="min-h-screen text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-2 transition-colors hover:bg-slate-800"
              >
                {sidebarOpen ? <X className="h-5 w-5 text-slate-100" /> : <Menu className="h-5 w-5 text-slate-100" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/15">
                  <Shield className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wide text-slate-100">NIDS Console</h1>
                  <p className="text-xs text-slate-400">Network Intrusion Detection System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                <input
                  type="text"
                  placeholder="Search threats, IPs, events"
                  className="w-64 rounded-lg border border-slate-700 bg-slate-900/70 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <span className={`status-pill ${serviceStatusClass}`}>
                <Circle className="h-3 w-3 fill-current" />
                {serviceStatus === 'connected' && 'Connected'}
                {serviceStatus === 'degraded' && 'Model Not Ready'}
                {serviceStatus === 'checking' && 'Checking'}
                {serviceStatus === 'disconnected' && 'Disconnected'}
              </span>

              <button className="relative rounded-lg border border-slate-700 bg-slate-900/60 p-2 transition-colors hover:bg-slate-800">
                <Bell className="h-5 w-5 text-slate-100" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-slate-700" />
                <div>
                  <p className="text-sm font-medium text-slate-100">Admin</p>
                  <p className="text-xs text-cyan-300">Security Console</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden border-r border-slate-800 bg-slate-950/70 transition-all duration-300`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full group transition-all duration-200 ${
                    isActive(item.path)
                      ? 'border border-cyan-400/35 bg-cyan-500/12 text-cyan-100'
                      : 'border border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/90 hover:text-slate-100'
                  } flex items-center space-x-3 rounded-xl p-4`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive(item.path) 
                      ? 'bg-cyan-500/20 text-cyan-300' 
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs opacity-70 text-slate-400">
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
