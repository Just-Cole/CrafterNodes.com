
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePterodactylWebSocket } from "@/hooks/use-pterodactyl-socket";
import { cn } from "@/lib/utils";
import { Circle, Cpu, HardDrive, Play, Power, RefreshCcw, Send, ServerCrash, StopCircle } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


const statusClasses = {
    running: 'text-green-500',
    starting: 'text-yellow-500 animate-pulse',
    stopping: 'text-orange-500 animate-pulse',
    offline: 'text-red-500',
};

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


function ResourceChart({ data, dataKey, name, unit, color }) {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer>
                <LineChart data={data}>
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))"
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}${unit}`} />
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function ServerPage({ params }: { params: { serverId: string } }) {
    const { isConnected, console, serverStatus, stats, sendCommand, setPowerState } = usePterodactylWebSocket(params.serverId);
    const [command, setCommand] = useState('');
    const consoleRef = useRef<HTMLDivElement>(null);

    const [cpuHistory, setCpuHistory] = useState<{ time: string, value: number }[]>([]);
    const [memoryHistory, setMemoryHistory] = useState<{ time: string, value: number }[]>([]);

    useEffect(() => {
        if (stats) {
            const now = new Date().toLocaleTimeString();
            setCpuHistory(prev => [...prev, { time: now, value: stats.cpu_absolute }].slice(-20));
            setMemoryHistory(prev => [...prev, { time: now, value: stats.memory_bytes / (1024 * 1024) }].slice(-20));
        }
    }, [stats]);


    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [console]);

    const handleCommandSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (command.trim()) {
            sendCommand(command);
            setCommand('');
        }
    };

    return (
        <div className="py-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Server</h1>
                    <p className="text-muted-foreground">Server ID: {params.serverId}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Circle className={cn("h-3 w-3 fill-current", isConnected ? "text-green-500" : "text-red-500")} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                     <div className="flex items-center gap-2 text-sm font-medium">
                        <Power className={cn("h-4 w-4", statusClasses[serverStatus] || 'text-gray-500')} />
                        <span className={cn(statusClasses[serverStatus] || 'text-gray-500')}>{serverStatus.charAt(0).toUpperCase() + serverStatus.slice(1)}</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Power Controls</CardTitle>
                    <CardDescription>Control the power state of your server.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <Button variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10" onClick={() => setPowerState('start')} disabled={serverStatus === 'running' || serverStatus === 'starting'}><Play className="mr-2"/> Start</Button>
                    <Button variant="outline" className="text-orange-500 border-orange-500 hover:bg-orange-500/10" onClick={() => setPowerState('restart')} disabled={serverStatus === 'offline'}><RefreshCcw className="mr-2"/> Restart</Button>
                    <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10" onClick={() => setPowerState('stop')} disabled={serverStatus === 'offline' || serverStatus === 'stopping'}><StopCircle className="mr-2"/> Stop</Button>
                    <Button variant="destructive" onClick={() => setPowerState('kill')} disabled={serverStatus === 'offline'}><ServerCrash className="mr-2"/> Kill</Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.cpu_absolute.toFixed(2) ?? 0}%</div>
                        <Progress value={stats?.cpu_absolute ?? 0} className="mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                        <ServerCrash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(stats?.memory_bytes ?? 0)} / {formatBytes(stats?.memory_limit_bytes ?? 0)}</div>
                        <Progress value={stats ? (stats.memory_bytes / stats.memory_limit_bytes) * 100 : 0} className="mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(stats?.disk_bytes ?? 0)}</div>
                         <p className="text-xs text-muted-foreground">Total disk usage on the node.</p>
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Resource Monitoring</CardTitle>
                    <CardDescription>Real-time CPU and Memory usage history.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <ResourceChart data={cpuHistory} dataKey="value" name="CPU" unit="%" color="#8884d8" />
                   <ResourceChart data={memoryHistory} dataKey="value" name="Memory" unit="MB" color="#82ca9d" />
                </CardContent>
            </Card>

            <Card className="h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Live Console</CardTitle>
                    <CardDescription>Interact with your server in real-time. Console is read-only for now.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col overflow-hidden">
                    <ScrollArea className="flex-grow h-full bg-secondary rounded-md border p-4">
                        <div ref={consoleRef} className="text-xs font-mono space-y-1">
                            {console.map((line, index) => (
                                <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\[\d{1,2}m/g, '') }}></p>
                            ))}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleCommandSubmit} className="flex gap-2 mt-4">
                        <Input
                            placeholder="Type a command..."
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            disabled={!isConnected || serverStatus !== 'running'}
                            className="font-mono"
                        />
                        <Button type="submit" disabled={!isConnected || serverStatus !== 'running'}><Send className="mr-2"/>Send</Button>
                    </form>
                </CardContent>
            </Card>

        </div>
    );
}
