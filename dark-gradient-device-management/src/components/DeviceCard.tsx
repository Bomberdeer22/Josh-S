import { motion } from 'framer-motion';
import { ArrowUpDown, MoreHorizontal, Bell } from 'lucide-react';
import type { Device } from '../data/devices';
import DeviceIcon from './DeviceIcon';
import StatusBadge from './StatusBadge';
import BatteryIndicator from './BatteryIndicator';
import StorageBar from './StorageBar';

interface DeviceCardProps {
  device: Device;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function DeviceCard({ device, index, isSelected, onClick }: DeviceCardProps) {
  const isOnline = device.status !== 'disconnected';
  const accentColors: Record<string, string> = {
    iphone: 'from-blue-500/20 to-cyan-500/20',
    ipad: 'from-purple-500/20 to-pink-500/20',
    windows: 'from-sky-500/20 to-blue-500/20',
    android: 'from-green-500/20 to-emerald-500/20',
    watch: 'from-orange-500/20 to-red-500/20',
    macbook: 'from-violet-500/20 to-blue-500/20',
  };

  const iconColors: Record<string, string> = {
    iphone: 'text-blue-400',
    ipad: 'text-purple-400',
    windows: 'text-sky-400',
    android: 'text-green-400',
    watch: 'text-orange-400',
    macbook: 'text-violet-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300
        ${isSelected
          ? 'border-violet-500/30 bg-violet-500/[0.06] shadow-lg shadow-violet-500/5'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]'
        }
        ${!isOnline ? 'opacity-60' : ''}
      `}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${accentColors[device.type]} rounded-full blur-3xl`} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accentColors[device.type]} border border-white/[0.06] flex items-center justify-center`}>
              <DeviceIcon type={device.type} className={`w-5 h-5 ${iconColors[device.type]}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{device.name}</h3>
                {device.notifications && device.notifications > 0 && (
                  <span className="flex items-center gap-0.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                    <Bell className="w-2.5 h-2.5" />
                    {device.notifications}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/35 mt-0.5">{device.model}</p>
            </div>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between mb-4">
          <StatusBadge status={device.status} />
          {device.transferSpeed && isOnline && (
            <div className="flex items-center gap-1 text-xs text-white/40">
              <ArrowUpDown className="w-3 h-3" />
              {device.transferSpeed}
            </div>
          )}
        </div>

        {/* Battery */}
        <div className="mb-3">
          <BatteryIndicator level={device.battery} />
        </div>

        {/* Storage */}
        <StorageBar used={device.storage.used} total={device.storage.total} />

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
          <span className="text-[11px] text-white/30">{device.ip}</span>
          <span className="text-[11px] text-white/30">{device.lastSeen}</span>
        </div>
      </div>
    </motion.div>
  );
}
