'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Power, Terminal, Play, Trash2 } from 'lucide-react';
import ResourceChart from './resource-chart';
import type { services } from '@/lib/data';

type Service = (typeof services)[0];

const statusStyles: { [key: string]: string } = {
  active: 'bg-green-500',
  stopped: 'bg-gray-500',
  error: 'bg-red-500',
};

export function ServiceCard({ service }: { service: Service }) {
  const chartData = [
    { name: 'CPU', value: service.cpuUsage, color: 'hsl(var(--chart-1))' },
    { name: 'RAM', value: service.ramUsage, color: 'hsl(var(--chart-2))' },
    { name: 'Sto', value: service.storageUsage, color: 'hsl(var(--chart-3))' },
    { name: 'Net', value: service.bandwidthUsage, color: 'hsl(var(--chart-4))' },
  ];

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
                <Link href={`/dashboard/services/${service.id}`} className="hover:underline">
                    {service.name}
                </Link>
            </CardTitle>
            <CardDescription>{service.plan}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{service.status === 'active' ? <Power className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>} {service.status === 'active' ? 'Stop' : 'Start'}</DropdownMenuItem>
              <DropdownMenuItem><Terminal className="mr-2 h-4 w-4"/>Console</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 hover:!text-red-500"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${statusStyles[service.status]}`}></span>
                <span className="capitalize">{service.status}</span>
            </div>
        </div>
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Region</span>
            <span>{service.region}</span>
        </div>
        <div className="pt-2">
            <ResourceChart data={chartData} />
        </div>
      </CardContent>
      <CardFooter>
          <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/services/${service.id}`}>Manage</Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
