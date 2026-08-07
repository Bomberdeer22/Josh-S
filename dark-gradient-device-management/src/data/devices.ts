export type DeviceType = 'macbook' | 'iphone' | 'ipad' | 'windows' | 'android' | 'watch';
export type ConnectionStatus = 'connected' | 'syncing' | 'idle' | 'disconnected';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  os: string;
  battery: number;
  storage: { used: number; total: number };
  status: ConnectionStatus;
  lastSeen: string;
  ip: string;
  transferSpeed?: string;
  notifications?: number;
}

export const hostDevice: Device = {
  id: 'host-1',
  name: 'My MacBook Pro',
  type: 'macbook',
  model: 'MacBook Pro 16" M3 Max',
  os: 'macOS Sequoia 15.2',
  battery: 87,
  storage: { used: 458, total: 1000 },
  status: 'connected',
  lastSeen: 'Now',
  ip: '192.168.1.100',
};

export const connectedDevices: Device[] = [
  {
    id: 'dev-1',
    name: 'iPhone 15 Pro',
    type: 'iphone',
    model: 'iPhone 15 Pro Max',
    os: 'iOS 18.2',
    battery: 72,
    storage: { used: 128, total: 256 },
    status: 'connected',
    lastSeen: 'Now',
    ip: '192.168.1.101',
    transferSpeed: '48 MB/s',
    notifications: 5,
  },
  {
    id: 'dev-2',
    name: 'iPad Air',
    type: 'ipad',
    model: 'iPad Air M2',
    os: 'iPadOS 18.2',
    battery: 94,
    storage: { used: 64, total: 256 },
    status: 'syncing',
    lastSeen: 'Now',
    ip: '192.168.1.102',
    transferSpeed: '112 MB/s',
    notifications: 2,
  },
  {
    id: 'dev-3',
    name: 'Gaming PC',
    type: 'windows',
    model: 'Custom Desktop',
    os: 'Windows 11 Pro',
    battery: 100,
    storage: { used: 1200, total: 2000 },
    status: 'connected',
    lastSeen: 'Now',
    ip: '192.168.1.103',
    transferSpeed: '220 MB/s',
  },
  {
    id: 'dev-4',
    name: 'Galaxy S24 Ultra',
    type: 'android',
    model: 'Samsung Galaxy S24 Ultra',
    os: 'Android 15',
    battery: 45,
    storage: { used: 180, total: 512 },
    status: 'idle',
    lastSeen: '2 min ago',
    ip: '192.168.1.104',
  },
  {
    id: 'dev-5',
    name: 'Apple Watch',
    type: 'watch',
    model: 'Apple Watch Ultra 2',
    os: 'watchOS 11.2',
    battery: 61,
    storage: { used: 18, total: 64 },
    status: 'connected',
    lastSeen: 'Now',
    ip: '192.168.1.105',
    transferSpeed: '8 MB/s',
    notifications: 12,
  },
  {
    id: 'dev-6',
    name: 'Work Laptop',
    type: 'windows',
    model: 'ThinkPad X1 Carbon',
    os: 'Windows 11 Pro',
    battery: 33,
    storage: { used: 340, total: 512 },
    status: 'disconnected',
    lastSeen: '1 hour ago',
    ip: '192.168.1.106',
  },
];

export interface Activity {
  id: string;
  deviceName: string;
  action: string;
  time: string;
  icon: 'upload' | 'download' | 'sync' | 'connect' | 'disconnect' | 'alert';
}

export const recentActivity: Activity[] = [
  { id: 'a1', deviceName: 'iPhone 15 Pro', action: 'Photos synced (243 items)', time: '2 min ago', icon: 'sync' },
  { id: 'a2', deviceName: 'Gaming PC', action: 'File transferred: project_v2.zip', time: '8 min ago', icon: 'download' },
  { id: 'a3', deviceName: 'iPad Air', action: 'Clipboard shared', time: '12 min ago', icon: 'sync' },
  { id: 'a4', deviceName: 'Apple Watch', action: 'Notifications mirrored', time: '15 min ago', icon: 'connect' },
  { id: 'a5', deviceName: 'Work Laptop', action: 'Disconnected', time: '1 hour ago', icon: 'disconnect' },
  { id: 'a6', deviceName: 'Galaxy S24 Ultra', action: 'File uploaded: report.pdf', time: '1 hour ago', icon: 'upload' },
];
