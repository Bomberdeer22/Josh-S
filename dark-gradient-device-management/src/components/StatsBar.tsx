import { motion } from 'framer-motion';
import { Wifi, ArrowUpDown, HardDrive, Shield } from 'lucide-react';

interface StatsBarProps {
  connectedCount: number;
  totalDevices: number;
}

export default function StatsBar({ connectedCount, totalDevices }: StatsBarProps) {
  const stats = [
    {
      icon: Wifi,
      label: 'Online',
      value: `${connectedCount}/${totalDevices}`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: ArrowUpDown,
      label: 'Total Transfer',
      value: '2.4 GB',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: HardDrive,
      label: 'Shared Storage',
      value: '1.8 TB',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      icon: Shield,
      label: 'Security',
      value: 'Encrypted',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <p className="text-lg font-semibold text-white">{stat.value}</p>
          </div>
        );
      })}
    </motion.div>
  );
}
