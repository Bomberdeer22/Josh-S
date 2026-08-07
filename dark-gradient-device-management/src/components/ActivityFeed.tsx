import { motion } from 'framer-motion';
import { Upload, Download, RefreshCw, Plug, Unplug, AlertTriangle } from 'lucide-react';
import type { Activity } from '../data/devices';

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap = {
  upload: Upload,
  download: Download,
  sync: RefreshCw,
  connect: Plug,
  disconnect: Unplug,
  alert: AlertTriangle,
};

const colorMap = {
  upload: 'text-blue-400 bg-blue-500/10',
  download: 'text-emerald-400 bg-emerald-500/10',
  sync: 'text-violet-400 bg-violet-500/10',
  connect: 'text-green-400 bg-green-500/10',
  disconnect: 'text-zinc-400 bg-zinc-500/10',
  alert: 'text-amber-400 bg-amber-500/10',
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {activities.map((activity, i) => {
          const Icon = iconMap[activity.icon];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[activity.icon]}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 truncate">
                  <span className="font-medium text-white/90">{activity.deviceName}</span>
                  {' — '}
                  {activity.action}
                </p>
              </div>
              <span className="text-[11px] text-white/30 flex-shrink-0">{activity.time}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
