
'use client';

import * as React from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Power, PowerOff, RefreshCw, ChevronRight, Terminal, Files, Settings, Wrench, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { GameServer } from '@/lib/types';
import { getGameServer } from '@/app/actions/billing';


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

// Placeholder for Console Tab
function ConsoleTab() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-black text-white font-mono text-sm h-96 p-4 overflow-y-auto rounded-lg">
          <p><span className="text-green-400">[INFO]</span>: Server starting...</p>
          <p><span className="text-green-400">[INFO]</span>: Loading world data...</p>
          <p><span className="text-yellow-400">[WARN]</span>: A deprecated plugin is being used.</p>
           <p><span className="text-green-400">[INFO]</span>: Player 'Steve' connected.</p>
           <p><span className="text-red-500">[ERROR]</span>: Failed to load a required asset.</p>
        </div>
        <div className="p-4 border-t flex gap-2">
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
            <Input placeholder="Enter a server command..." className="flex-1" />
            <Button>Send</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Placeholder for File Manager Tab
function FileManagerTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>File Manager</CardTitle>
                <CardDescription>This feature is under construction. Soon you'll be able to manage your server files here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Directory listing and file editing will be available in a future update.</p>
            </CardContent>
        </Card>
    );
}

// Placeholder for Config Editor Tab
function ConfigEditorTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuration Editor</CardTitle>
                <CardDescription>This feature is under construction. GUI-based config editors will be available soon.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">Easy-to-use forms for editing common server configuration files are coming soon.</p>
            </CardContent>
        </Card>
    );
}


// Placeholder for Settings Tab
function SettingsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Server Settings</CardTitle>
                <CardDescription>This feature is under construction. Manage server name, startup parameters, and more.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">Server settings management will be implemented here.</p>
            </CardContent>
        </Card>
    );
}


export default function ServerPage({ params }: { params: { id: string } }) {
  const [server, setServer] = React.useState<GameServer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchServer() {
      setIsLoading(true);
      const serverData = await getGameServer(params.id);
      if (serverData) {
        setServer(serverData);
      } else {
        notFound();
      }
      setIsLoading(false);
    }
    
    fetchServer();
  }, [params.id]);


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!server) {
      // This will likely not be reached due to notFound() in useEffect,
      // but it's good practice for type safety.
      return notFound();
  }
  
  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title={server.name}
        description={`Manage your ${server.game} server. IP: ${server.ip}`}
      >
        <div className="flex items-center gap-2">
          <ServerStatusBadge status={server.status} />
          <Button variant="outline" size="sm" disabled={server.status === 'running'}>
            <Power /> Start
          </Button>
          <Button variant="outline" size="sm" disabled={server.status !== 'running'}>
            <PowerOff /> Stop
          </Button>
          <Button variant="outline" size="sm" disabled={server.status !== 'running'}>
            <RefreshCw /> Restart
          </Button>
        </div>
      </PageHeader>
      
      <Tabs defaultValue="console" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="console"><Terminal className="mr-2" />Console</TabsTrigger>
          <TabsTrigger value="files"><Files className="mr-2" />File Manager</TabsTrigger>
          <TabsTrigger value="config"><Wrench className="mr-2" />Configuration</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2" />Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="console" className="mt-6">
          <ConsoleTab />
        </TabsContent>
        <TabsContent value="files" className="mt-6">
          <FileManagerTab />
        </TabsContent>
        <TabsContent value="config" className="mt-6">
          <ConfigEditorTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
            <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
