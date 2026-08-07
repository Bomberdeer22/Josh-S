import type { ConnectionStatus } from '../data/devices';

interface StatusBadgeProps {
  status: ConnectionStatus;
}

const statusConfig: Record<ConnectionStatus, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  connected: {
    label: 'Connected',
    dotClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    textClass: 'text-emerald-400',
  },
  syncing: {
    label: 'Syncing',
    dotClass: 'bg-blue-400 animate-pulse',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
    textClass: 'text-blue-400',
  },
  idle: {
    label: 'Idle',
    dotClass: 'bg-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    textClass: 'text-amber-400',
  },
  disconnected: {
    label: 'Offline',
    dotClass: 'bg-zinc-500',
    bgClass: 'bg-zinc-500/10 border-zinc-500/20',
    textClass: 'text-zinc-500',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bgClass} ${config.textClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
