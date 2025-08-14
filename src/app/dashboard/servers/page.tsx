
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ServersPage() {
    // For now, we'll assume the user has no servers.
    // We can add logic here later to fetch and display servers.
    const hasServers = false;

    return (
        <div className="py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Your Servers</h1>
                    <p className="text-muted-foreground">Manage your game servers here.</p>
                </div>
                <Button asChild>
                    <Link href="/#games">
                        View Pricing Plans
                    </Link>
                </Button>
            </div>
            <div className="mt-8">
                {hasServers ? (
                    <div>
                        {/* Server list will go here */}
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-16">
                        <div className="flex flex-col items-center gap-1 text-center py-20">
                            <h3 className="text-2xl font-bold tracking-tight">
                                You have no servers yet
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Get started by creating your first game server.
                            </p>
                            <Button asChild>
                                <Link href="/#games">
                                    View Pricing Plans
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
