interface StorageBarProps {
  used: number;
  total: number;
}

export default function StorageBar({ used, total }: StorageBarProps) {
  const percentage = Math.round((used / total) * 100);
  const getColor = () => {
    if (percentage >= 90) return 'from-red-500 to-red-400';
    if (percentage >= 70) return 'from-amber-500 to-amber-400';
    return 'from-violet-500 to-blue-400';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Storage</span>
        <span className="text-[11px] text-white/50">
          {used >= 1000 ? `${(used / 1000).toFixed(1)} TB` : `${used} GB`} / {total >= 1000 ? `${(total / 1000).toFixed(0)} TB` : `${total} GB`}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
