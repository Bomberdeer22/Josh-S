import { motion } from 'framer-motion';
import { Wifi, HardDrive, Cpu, Globe } from 'lucide-react';
import type { Device } from '../data/devices';
import DeviceIcon from './DeviceIcon';
import BatteryIndicator from './BatteryIndicator';
import StorageBar from './StorageBar';

interface HostCardProps {
  device: Device;
  connectedCount: number;
}

export default function HostCard({ device, connectedCount }: HostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl"
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center">
                <DeviceIcon type={device.type} className="w-7 h-7 text-violet-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0f0f1a] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{device.name}</h2>
              <p className="text-sm text-white/40">{device.model}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Host Device
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Devices</span>
            </div>
            <p className="text-xl font-semibold text-white">{connectedCount}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">IP</span>
            </div>
            <p className="text-sm font-medium text-white/80 mt-1">{device.ip}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">OS</span>
            </div>
            <p className="text-sm font-medium text-white/80 mt-1 truncate">{device.os}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Battery</span>
            </div>
            <BatteryIndicator level={device.battery} />
          </div>
        </div>

        <StorageBar used={device.storage.used} total={device.storage.total} />
      </div>
    </motion.div>
  );
}
