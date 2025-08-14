import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { Header } from '@/components/dashboard/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
