
"use client"; 

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { GameServer } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { 
  PlusCircle, 
  ServerOff, 
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { ServerCard } from '@/components/server-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getAllGameServers } from "@/app/actions/billing";


export default function DashboardPage() {
  const [servers, setServers] = React.useState<GameServer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [serverToDelete, setServerToDelete] = React.useState<GameServer | null>(null);

  const canCreate = user?.permissions?.includes('create_servers');
  const canEdit = user?.permissions?.includes('edit_configs');

  React.useEffect(() => {
    async function fetchServers() {
      setIsLoading(true);
      try {
        const fetchedServers = await getAllGameServers();
        setServers(fetchedServers);
      } catch (err) {
        setError("Failed to load server data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchServers();
    }
  }, [user]);

  const handleDeleteInitiate = (server: GameServer) => {
    if (!canEdit) return;
    setServerToDelete(server);
  };
  
  const handleDeleteConfirm = async () => {
    if (!serverToDelete) return;
    console.log("Deleting server", serverToDelete.id);
    toast({
        title: "Deletion in Progress",
        description: `Server "${serverToDelete.name}" is being deleted. (This is a placeholder)`,
    });
    setServers(prev => prev.filter(s => s.id !== serverToDelete.id));
    setServerToDelete(null);
  };

  const handleServerAction = async (server: GameServer, action: 'start' | 'stop' | 'restart') => {
    console.log(`Action: ${action} on server: ${server.name}`);
     toast({
      title: `Action: ${action}`,
      description: `Action "${action}" on server "${server.name}" is a placeholder.`,
    });
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Dashboard" description="Overview of all your game servers.">
        {canCreate && (
          <Link href="/servers/create" passHref>
            <Button>
              <PlusCircle />
              Create Server
            </Button>
          </Link>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading servers...</p>
        </div>
      ) : error ? (
         <Alert variant="destructive" className="my-6">
          <ServerOff className="h-4 w-4" />
          <AlertTitle>Error Loading Servers</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 rounded-lg border border-dashed">
          <ServerOff className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Servers Found</h2>
          <p className="text-muted-foreground mb-4">Get started by creating a new server.</p>
          {canCreate && (
             <Link href="/#games">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Purchase a Server
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {servers.map((server) => (
            <ServerCard 
              key={server.id} 
              server={server} 
              onDelete={handleDeleteInitiate}
              onStartServer={(srv) => handleServerAction(srv, 'start')}
              onStopServer={(srv) => handleServerAction(srv, 'stop')}
              onRestartServer={(srv) => handleServerAction(srv, 'restart')}
              canEdit={canEdit ?? false}
            />
          ))}
        </div>
      )}

      {serverToDelete && (
        <AlertDialog open={!!serverToDelete} onOpenChange={() => setServerToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will stop the server (if running) and move its data to a recovery folder. 
                The server "{serverToDelete.name}" will be removed from the dashboard. This is a placeholder action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
