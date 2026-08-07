import { BatteryLow, BatteryMedium, BatteryFull, BatteryCharging, Zap } from 'lucide-react';

interface BatteryIndicatorProps {
  level: number;
  charging?: boolean;
  showLabel?: boolean;
}

export default function BatteryIndicator({ level, charging = false, showLabel = true }: BatteryIndicatorProps) {
  const getColor = () => {
    if (level <= 20) return 'text-red-400';
    if (level <= 50) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getBarColor = () => {
    if (level <= 20) return 'bg-red-400';
    if (level <= 50) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  const getIcon = () => {
    if (charging) return <BatteryCharging className="w-4 h-4" />;
    if (level <= 20) return <BatteryLow className="w-4 h-4" />;
    if (level <= 60) return <BatteryMedium className="w-4 h-4" />;
    return <BatteryFull className="w-4 h-4" />;
  };

  return (
    <div className={`flex items-center gap-2 ${getColor()}`}>
      {getIcon()}
      {showLabel && (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full ${getBarColor()} transition-all duration-500`}
              style={{ width: `${level}%` }}
            />
          </div>
          <span className="text-xs font-medium text-white/60">{level}%</span>
          {charging && <Zap className="w-3 h-3 text-amber-400" />}
        </div>
      )}
    </div>
  );
}
