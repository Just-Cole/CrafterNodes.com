
'use client';

import { useSession } from "next-auth/react";

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
    
    if (session?.user?.id !== ADMIN_DISCORD_ID) {
         return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="mb-8">You do not have permission to view this page.</p>
            </div>
        )
    }

    return <>{children}</>;
}
