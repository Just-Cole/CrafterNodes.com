'use client'

import { notFound } from 'next/navigation';
import { services, resourceData, chartData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { FileManager } from '@/components/dashboard/file-manager';
import { ServerConsole } from '@/components/dashboard/server-console';
import { ArrowLeft, Play, Power, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = services.find((s) => s.id === params.id);

  if (!service) {
    notFound();
  }

  const statusStyles: { [key: string]: string } = {
    active: 'text-green-400',
    stopped: 'text-gray-400',
    error: 'text-red-400',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
                <span className={`mt-1 h-3 w-3 rounded-full ${statusStyles[service.status].replace('text-','bg-')}`}></span>
            </div>
            <p className="text-muted-foreground capitalize">{service.status} &middot; {service.region}</p>
        </div>
        <div className="ml-auto flex gap-2">
            <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Restart
            </Button>
            <Button variant={service.status === 'active' ? 'destructive' : 'default'}>
                {service.status === 'active' ? <Power className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {service.status === 'active' ? 'Stop' : 'Start'}
            </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="files">File Manager</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {resourceData.map((resource) => (
              <Card key={resource.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{resource.name}</CardTitle>
                  <resource.Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resource.usage}%</div>
                  <p className="text-xs text-muted-foreground">of {resource.total} used</p>
                  <Progress value={resource.usage} className="mt-2 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Real-time CPU Usage</CardTitle>
              <CardDescription>CPU utilization over the last 30 minutes.</CardDescription>
            </CardHeader>
            <CardContent className="h-80 w-full">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis unit="%" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsla(var(--primary) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="console" className="mt-6">
            <ServerConsole />
        </TabsContent>
        <TabsContent value="files" className="mt-6">
            <FileManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
