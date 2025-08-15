
'use client';

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ADMIN_DISCORD_ID = "949172257345921045";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="mb-8">You must be logged in to view this page.</p>
                <Button onClick={() => signIn('discord')}>Login with Discord</Button>
            </div>
        )
    }
    
    if (session?.user?.id !== ADMIN_DISCORD_ID) {
         return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="mb-8">You do not have permission to view this page.</p>
                <Link href="/">
                    <Button variant="outline">Go to Homepage</Button>
                </Link>
            </div>
        )
    }

    return <div className="container mx-auto py-8">{children}</div>;
}
