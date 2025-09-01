
export interface GameServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  game: string;
  ip: string;
  resources: {
    cpu: number;
    memory_used: number;
    memory_total: number;
    disk_used: number;
    disk_total: number;
  };
}
