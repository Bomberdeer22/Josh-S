import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, FolderSync, MonitorSmartphone, Trash2, RefreshCw, Wifi, Clock, Cpu, Globe } from 'lucide-react';
import type { Device } from '../data/devices';
import DeviceIcon from './DeviceIcon';
import StatusBadge from './StatusBadge';

import StorageBar from './StorageBar';

interface DeviceDetailPanelProps {
  device: Device | null;
  onClose: () => void;
}

export default function DeviceDetailPanel({ device, onClose }: DeviceDetailPanelProps) {
  return (
    <AnimatePresence>
      {device && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 border-l border-white/[0.06] bg-gradient-to-b from-[#12122a]/95 to-[#0a0a18]/95 backdrop-blur-2xl overflow-y-auto"
        >
          {/* Ambient glow */}
          <div className="absolute top-20 right-10 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Device Details</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Device header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center mb-4">
                <DeviceIcon type={device.type} className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{device.name}</h3>
              <p className="text-sm text-white/40 mb-3">{device.model}</p>
              <StatusBadge status={device.status} />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { icon: Send, label: 'Send', color: 'text-blue-400' },
                { icon: FolderSync, label: 'Sync', color: 'text-violet-400' },
                { icon: MonitorSmartphone, label: 'Mirror', color: 'text-emerald-400' },
                { icon: RefreshCw, label: 'Restart', color: 'text-amber-400' },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-white/[0.06] transition-colors group"
                >
                  <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] text-white/50 font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Info grid */}
            <div className="space-y-3 mb-6">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 space-y-3">
                {[
                  { icon: Cpu, label: 'Operating System', value: device.os, color: 'text-amber-400' },
                  { icon: Globe, label: 'IP Address', value: device.ip, color: 'text-blue-400' },
                  { icon: Wifi, label: 'Transfer Speed', value: device.transferSpeed || 'N/A', color: 'text-violet-400' },
                  { icon: Clock, label: 'Last Seen', value: device.lastSeen, color: 'text-emerald-400' },
                ].map(({ icon: Icon, label, value, color }, i) => (
                  <div key={label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <span className="text-xs text-white/40">{label}</span>
                      </div>
                      <span className="text-xs font-medium text-white/70">{value}</span>
                    </div>
                    {i < 3 && <div className="mt-3 border-t border-white/[0.04]" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Battery */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 mb-4">
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium block mb-2">Battery</span>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        device.battery <= 20 ? 'bg-red-400' : device.battery <= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${device.battery}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">{device.battery}%</span>
              </div>
            </div>

            {/* Storage */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 mb-6">
              <StorageBar used={device.storage.used} total={device.storage.total} />
            </div>

            {/* Danger zone */}
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors py-3 text-xs font-medium">
              <Trash2 className="w-3.5 h-3.5" />
              Remove Device
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
