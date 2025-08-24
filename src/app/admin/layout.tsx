
'use client'

import { useSession } from "next-auth/react";
import DashboardLayout from "../dashboard/layout";
import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }

    if (!session || !session.user?.isAdmin) {
        // Or redirect to a custom "unauthorized" page
        return redirect('/');
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
