'use client'

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Terminal, ChevronRight } from 'lucide-react';

const initialLog = [
    "Connecting to prod-web-1...",
    "Connection successful.",
    "Last login: Tue May 21 10:30:15 2024 from 192.168.1.101",
    "crafter@prod-web-1:~$ "
];

export function ServerConsole() {
    const [logs, setLogs] = useState<string[]>(initialLog);
    const [input, setInput] = useState('');
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const newLogs = [...logs, input];
        let output = '';

        if(input.trim().toLowerCase() === 'ls -la') {
            output = `
total 40
drwxr-xr-x 4 crafter crafter 4096 May 21 10:30 .
drwxr-xr-x 3 root    root    4096 May 10 14:00 ..
-rw-r--r-- 1 crafter crafter  220 May 10 14:00 .bash_logout
-rw-r--r-- 1 crafter crafter 3771 May 10 14:00 .bashrc
drwx------ 2 crafter crafter 4096 May 10 14:00 .cache
-rw-r--r-- 1 crafter crafter  807 May 10 14:00 .profile
drwxr-xr-x 5 crafter crafter 4096 May 20 09:00 src
-rw-r--r-- 1 crafter crafter 2300 May 20 11:45 package.json`;
        } else if (input.trim().toLowerCase() === 'help') {
            output = 'Available commands: ls -la, help, clear, status';
        } else if (input.trim().toLowerCase() === 'clear') {
            setLogs(['crafter@prod-web-1:~$ ']);
            setInput('');
            return;
        } else if (input.trim().toLowerCase() === 'status') {
            output = 'Service status: Active. CPU: 75%, RAM: 60%';
        } else if (input.trim() === '') {
            // do nothing
        }
        else {
            output = `bash: command not found: ${input}`;
        }
        
        if (output) newLogs.push(output);

        setLogs([...newLogs, 'crafter@prod-web-1:~$ ']);
        setInput('');
    }

    return (
        <Card className="font-mono">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Terminal/> Server Console</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="bg-secondary rounded-md p-4 h-96 overflow-y-auto text-sm">
                    {logs.map((log, index) => {
                        const isPrompt = log.startsWith('crafter@prod-web-1:~$');
                        if (isPrompt && index !== logs.length - 1) {
                            return <div key={index} className="flex"><span className="text-green-400">crafter@prod-web-1:~$</span><span className="flex-1 text-gray-300">{log.substring(21)}</span></div>
                        }
                        return <pre key={index} className="whitespace-pre-wrap">{isPrompt ? <span className="text-green-400">{log}</span> : log}</pre>;
                    })}
                     <div ref={endOfLogsRef} />
                </div>
                <form onSubmit={handleCommand} className="relative mt-4">
                    <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="pl-9 bg-secondary"
                        placeholder="Enter command..."
                    />
                </form>
            </CardContent>
        </Card>
    );
}
