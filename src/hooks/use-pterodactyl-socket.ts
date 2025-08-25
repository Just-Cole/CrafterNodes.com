
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface ServerStats {
    memory_bytes: number;
    memory_limit_bytes: number;
    cpu_absolute: number;
    network: {
        rx_bytes: number;
        tx_bytes: number;
    };
    state: string;
    disk_bytes: number;
}

export function usePterodactylWebSocket(serverId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [console, setConsole] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState('offline');
  const [stats, setStats] = useState<ServerStats | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const getWebSocketToken = useCallback(async () => {
    if (!serverId) return null;
    const response = await fetch(`/api/servers/${serverId}/ws-token`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get WebSocket token');
    }
    
    const data = await response.json();
    return data.data;
  }, [serverId]);

  const connect = useCallback(async () => {
    if (!serverId || socketRef.current) return;

    try {
      const { token, socket: socketUrl } = await getWebSocketToken();

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        socket.send(JSON.stringify({ event: 'auth', args: [token] }));
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.event) {
          case 'console output':
            setConsole(prev => [...prev, message.args[0]].slice(-300)); // Keep last 300 lines
            break;
          case 'status':
            setServerStatus(message.args[0]);
            break;
          case 'stats':
            setStats(JSON.parse(message.args[0]));
            break;
          case 'token expiring':
             // The token is about to expire, get a new one and re-auth
            getWebSocketToken().then(data => {
                socket.send(JSON.stringify({ event: 'auth', args: [data.token] }));
            }).catch(e => console.error("Failed to refresh auth token", e));
            break;
        }
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        socketRef.current = null;
        if (event.code !== 1000) { // Don't reconnect on normal closure
          setTimeout(() => connect(), 5000);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setTimeout(() => connect(), 5000);
    }
  }, [getWebSocketToken, serverId]);

  const sendCommand = useCallback((command: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'send command', args: [command] }));
    }
  }, []);

  const setPowerState = useCallback((state: 'start' | 'stop' | 'restart' | 'kill') => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'set state', args: [state] }));
    }
  }, []);

  useEffect(() => {
    if (serverId) {
        connect();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
    };
  }, [serverId, connect]);

  return { isConnected, console, serverStatus, stats, sendCommand, setPowerState };
}
