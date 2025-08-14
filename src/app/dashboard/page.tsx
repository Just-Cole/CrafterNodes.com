
'use client';

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
                    <p className="text-muted-foreground">Here's an overview of your account.</p>
                </div>
                <Button>Create New Server</Button>
            </div>
        </div>
    )
}
