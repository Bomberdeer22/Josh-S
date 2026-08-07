import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Settings,
  Bell,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Laptop,
  ChevronDown,
  Monitor,
  Smartphone,
  Watch,
  Trash2,
  Lock,
  ExternalLink
} from 'lucide-react';
// import { hostDevice, connectedDevices, recentActivity } from './data/devices';
import type { Device, ConnectionStatus, Activity } from './data/devices';
import HostCard from './components/HostCard';
import DeviceCard from './components/DeviceCard';
import DeviceDetailPanel from './components/DeviceDetailPanel';
import ActivityFeed from './components/ActivityFeed';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | ConnectionStatus;

export default function App() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [data, setData] = useState<{host: Device, devices: Device[], activities: Activity[]}>({
    host: {
      id: 'host',
      name: 'MacBook',
      type: 'macbook',
      model: 'MacBook Pro',
      os: 'macOS',
      battery: 0,
      storage: { used: 0, total: 100 },
      status: 'connected',
      lastSeen: 'Now',
      ip: '127.0.0.1'
    },
    devices: [],
    activities: []
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin_info');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch admin info", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredDevices = data.devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = data.devices.filter((d) => d.status !== 'disconnected').length;

  const triggerAction = async (endpoint: string, payload = {}) => {
    try {
      await fetch(`/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetchData();
    } catch (e) {}
  };

  return (
    <div className="relative min-h-screen bg-[#08081a] text-white overflow-hidden font-sans">
      {/* === BACKGROUND GRADIENTS === */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c2a] via-[#0a0a1e] to-[#08081a]" />
        {/* Radial accent blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-900/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
        {/* Mesh / noise overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/[0.03] via-transparent to-transparent" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* === MAIN CONTENT === */}
      <div className={`relative z-10 min-h-screen transition-all duration-300 ${selectedDevice ? 'mr-0 sm:mr-96' : ''}`}>
        {/* Top Nav */}
        <header className="sticky top-0 z-40 border-b border-white/[0.04] bg-[#08081a]/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Laptop className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-tight">DeviceHub</h1>
                  <p className="text-[10px] text-white/30 -mt-0.5 tracking-wider uppercase">Management Console</p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button className="relative p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors">
                  <Bell className="w-4 h-4 text-white/50" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors">
                  <Settings className="w-4 h-4 text-white/50" />
                </button>
                <button className="ml-1 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all px-4 py-2 text-xs font-medium shadow-lg shadow-violet-500/20">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Device</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Host device card */}
          <HostCard device={data.host} connectedCount={onlineCount} />



          {/* Section header with search & filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Connected Devices</h2>
              <p className="text-sm text-white/30">
                {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => triggerAction('show_window')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white/60 hover:bg-white/[0.06] transition-colors mr-2"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Show Pairing Window</span>
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-56 pl-9 pr-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
                />
              </div>

              {/* Filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white/60 hover:bg-white/[0.06] transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline capitalize">{filterStatus === 'all' ? 'All Status' : filterStatus}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-40 rounded-xl border border-white/[0.08] bg-[#14142e]/95 backdrop-blur-xl shadow-2xl py-1 z-50"
                  >
                    {(['all', 'connected', 'syncing', 'idle', 'disconnected'] as FilterStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilter(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs capitalize hover:bg-white/[0.06] transition-colors ${
                          filterStatus === status ? 'text-violet-400' : 'text-white/60'
                        }`}
                      >
                        {status === 'all' ? 'All Status' : status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* View toggle */}
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/50'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/50'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Device grid / list */}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div>
              {filteredDevices.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                      : 'flex flex-col gap-3'
                  }
                >
                  {filteredDevices.map((device, i) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      index={i}
                      isSelected={selectedDevice?.id === device.id}
                      onClick={() =>
                        setSelectedDevice(selectedDevice?.id === device.id ? null : device)
                      }
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                    <Smartphone className="w-7 h-7 text-white/20" />
                  </div>
                  <p className="text-white/50 font-medium">No devices connected</p>
                  <p className="text-sm text-white/25 mt-1">Open the Josh S app on your phone to connect</p>
                </motion.div>
              )}
            </div>

            {/* Activity feed (right column on large) */}
            <div className="hidden lg:block">
              <ActivityFeed activities={data.activities} />
            </div>
          </div>

          {/* Activity feed (full width on small) */}
          <div className="lg:hidden">
            <ActivityFeed activities={data.activities} />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <p className="text-[11px] text-white/20">DeviceHub v1.0 — All connections encrypted end-to-end</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-white/30">Network Active</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Device Detail Slide-over Panel */}
      <DeviceDetailPanel
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
      />

      {/* Overlay when detail panel is open on mobile */}
      {selectedDevice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedDevice(null)}
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
        />
      )}
    </div>
  );
}
