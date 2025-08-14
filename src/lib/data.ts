import type { ComponentType } from "react";
import type { Icon as LucideIcon } from "lucide-react";
import { Cpu, FileText, HardDrive, LayoutDashboard, LifeBuoy, MemoryStick, Settings, Wifi } from "lucide-react";

export const services = [
  {
    id: "prod-web-1",
    name: "Production Web Server",
    plan: "Pro Plan",
    status: "active",
    region: "US-East",
    cpuUsage: 75,
    ramUsage: 60,
    storageUsage: 85,
    bandwidthUsage: 40,
  },
  {
    id: "dev-db-1",
    name: "Development Database",
    plan: "Starter Plan",
    status: "active",
    region: "EU-West",
    cpuUsage: 30,
    ramUsage: 45,
    storageUsage: 50,
    bandwidthUsage: 15,
  },
  {
    id: "staging-api",
    name: "Staging API",
    plan: "Pro Plan",
    status: "stopped",
    region: "US-West",
    cpuUsage: 0,
    ramUsage: 0,
    storageUsage: 65,
    bandwidthUsage: 0,
  },
  {
    id: "analytics-worker",
    name: "Analytics Worker",
    plan: "Business Plan",
    status: "error",
    region: "AP-South",
    cpuUsage: 92,
    ramUsage: 80,
    storageUsage: 30,
    bandwidthUsage: 60,
  },
];

export const resourceData = [
  { name: 'CPU', Icon: Cpu, usage: 75, total: '4 Cores', color: 'var(--chart-2)' },
  { name: 'RAM', Icon: MemoryStick, usage: 60, total: '16 GB', color: 'var(--chart-3)' },
  { name: 'Storage', Icon: HardDrive, usage: 85, total: '512 GB', color: 'var(--chart-4)' },
  { name: 'Bandwidth', Icon: Wifi, usage: 40, total: '2 TB', color: 'var(--chart-5)' },
];

export const chartData = [
  { time: '12:00', value: 50 }, { time: '12:05', value: 55 },
  { time: '12:10', value: 62 }, { time: '12:15', value: 58 },
  { time: '12:20', value: 65 }, { time: '12:25', value: 70 },
  { time: '12:30', value: 75 },
];


export const files = [
  { type: "folder", name: "public", lastModified: "2024-05-15 10:30", size: "12.5 MB" },
  { type: "folder", name: "src", lastModified: "2024-05-20 09:00", size: "25.1 MB" },
  { type: "file", name: "package.json", lastModified: "2024-05-20 11:45", size: "2.3 KB" },
  { type: "file", name: "README.md", lastModified: "2024-05-10 14:00", size: "1.2 KB" },
  { type: "file", name: "server.js", lastModified: "2024-05-18 16:20", size: "8.7 KB" },
  { type: "file", name: ".env.example", lastModified: "2024-05-10 14:00", size: "0.5 KB" },
];

export const invoices = [
  { id: "INV-2024-005", date: "2024-05-01", amount: "$75.00", status: "Paid", service: "Production Web Server" },
  { id: "INV-2024-006", date: "2024-06-01", amount: "$75.00", status: "Due", service: "Production Web Server" },
  { id: "INV-2024-004", date: "2024-05-15", amount: "$25.00", status: "Paid", service: "Development Database" },
  { id: "INV-2024-007", date: "2024-06-15", amount: "$25.00", status: "Due", service: "Development Database" },
  { id: "INV-2024-003", date: "2024-04-01", amount: "$75.00", status: "Paid", service: "Staging API" },
];

export const tickets = [
  { id: "#8675", subject: "Server connection issue", updated: "2 hours ago", status: "Open" },
  { id: "#8674", subject: "Billing question", updated: "1 day ago", status: "Answered" },
  { id: "#8672", subject: "Feature request: Dark mode", updated: "3 days ago", status: "Closed" },
  { id: "#8671", subject: "PHP version upgrade", updated: "5 days ago", status: "Closed" },
];

export const activeSessions = [
  { device: "Chrome on macOS", location: "New York, USA", ip: "192.168.1.101", lastActive: "Now" },
  { device: "Safari on iPhone", location: "Los Angeles, USA", ip: "10.0.0.5", lastActive: "2 hours ago" },
  { device: "Firefox on Windows", location: "London, UK", ip: "172.16.0.12", lastActive: "1 day ago" },
];

export const notifications = [
    { id: 1, title: 'Invoice #INV-2024-006 Due', description: 'Your invoice for Production Web Server is due today.', time: '2m ago' },
    { id: 2, title: 'Service Maintenance', description: 'Scheduled maintenance for US-East region in 24 hours.', time: '1h ago' },
    { id: 3, title: 'Ticket #8675 Updated', description: 'A new reply has been posted to your support ticket.', time: '2h ago' },
    { id: 4, title: 'Service Alert', description: 'High CPU usage detected on Analytics Worker.', time: '5h ago' }
];

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }> | LucideIcon;
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];
