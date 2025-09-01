
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Power, PowerOff, RefreshCw, Trash2, HardDrive, Cpu, MemoryStick } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { GameServer } from "@/lib/types";
import Link from "next/link";

interface ServerCardProps {
  server: GameServer;
  onDelete: (server: GameServer) => void;
  onStartServer: (server: GameServer) => void;
  onStopServer: (server: GameServer) => void;
  onRestartServer: (server: GameServer) => void;
  canEdit: boolean;
}

function ServerStatusBadge({ status }: { status: GameServer['status'] }) {
    const statusInfo = {
        running: { variant: "default", text: "Running" },
        stopped: { variant: "secondary", text: "Stopped" },
        starting: { variant: "outline", text: "Starting" },
        stopping: { variant: "outline", text: "Stopping" },
        error: { variant: "destructive", text: "Error" },
    } as const;

    const { variant, text } = statusInfo[status] || { variant: "secondary", text: "Unknown" };
    return <Badge variant={variant as any}>{text}</Badge>;
}

export function ServerCard({ server, onDelete, onStartServer, onStopServer, onRestartServer, canEdit }: ServerCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="truncate">{server.name}</CardTitle>
        <div className="flex items-center gap-2">
            <ServerStatusBadge status={server.status} />
            {canEdit && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStartServer(server)} disabled={server.status === 'running'}>
                            <Power className="mr-2 h-4 w-4" />
                            <span>Start</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStopServer(server)} disabled={server.status !== 'running'}>
                            <PowerOff className="mr-2 h-4 w-4" />
                            <span>Stop</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRestartServer(server)} disabled={server.status !== 'running'}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Restart</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(server)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{server.game}</p>
        
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span>CPU</span>
                <Progress value={server.resources.cpu} className="h-2 flex-1" />
                <span className="font-mono text-xs">{server.resources.cpu}%</span>
            </div>
             <div className="flex items-center gap-2 text-sm">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <span>RAM</span>
                <Progress value={(server.resources.memory_used / server.resources.memory_total) * 100} className="h-2 flex-1" />
                <span className="font-mono text-xs">{server.resources.memory_used} / {server.resources.memory_total}MB</span>
            </div>
             <div className="flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span>Disk</span>
                 <Progress value={(server.resources.disk_used / server.resources.disk_total) * 100} className="h-2 flex-1" />
                <span className="font-mono text-xs">{server.resources.disk_used} / {server.resources.disk_total}GB</span>
            </div>
        </div>

      </CardContent>
       <CardFooter className="justify-between">
         <p className="text-xs text-muted-foreground">IP: {server.ip}</p>
         <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/server/${server.id}`}>Manage</Link>
         </Button>
      </CardFooter>
    </Card>
  );
}
