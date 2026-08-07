import { Laptop, Smartphone, Tablet, Monitor, Watch } from 'lucide-react';
import type { DeviceType } from '../data/devices';

interface DeviceIconProps {
  type: DeviceType;
  className?: string;
}

export default function DeviceIcon({ type, className = 'w-6 h-6' }: DeviceIconProps) {
  switch (type) {
    case 'macbook':
      return <Laptop className={className} />;
    case 'iphone':
    case 'android':
      return <Smartphone className={className} />;
    case 'ipad':
      return <Tablet className={className} />;
    case 'windows':
      return <Monitor className={className} />;
    case 'watch':
      return <Watch className={className} />;
    default:
      return <Monitor className={className} />;
  }
}
