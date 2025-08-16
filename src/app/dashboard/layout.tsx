

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { CreditCard, Home, PanelLeft, Server, Shield } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_DISCORD_ID = "949172257345921045";

function Logo() {
    return (
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="text-xl font-bold text-foreground">CrafterNodes</span>
        </div>
    );
}

function UserMenu() {
    const { data: session } = useSession();
    return (
         <div className="flex items-center gap-4">
            {session ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
                                <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/billing">Billing</Link></DropdownMenuItem>
                        {session?.user?.id === ADMIN_DISCORD_ID && (
                          <DropdownMenuItem asChild><Link href="/admin">Admin</Link></DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button onClick={() => signIn("discord")}>
                    Login
                </Button>
            )}
        </div>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    if (status === 'loading') {
        return <div>Loading...</div>;
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
  
    return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <Link href="/" className="block">
                <Logo />
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                    <Link href="/dashboard">
                        <Home />
                        Dashboard
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/servers')}>
                    <Link href="/dashboard/servers">
                        <Server />
                        Servers
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/billing'}>
                    <Link href="/billing">
                        <CreditCard />
                        Billing
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             {session?.user?.id === ADMIN_DISCORD_ID && (
               <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')}>
                      <Link href="/admin">
                          <Shield />
                          Admin
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="/"
                            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                        >
                            <Logo />
                            <span className="sr-only">CrafterNodes</span>
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <Home className="h-5 w-5" />
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/servers"
                            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <Server className="h-5 w-5" />
                            Servers
                        </Link>
                        <Link
                            href="/billing"
                            className="flex items-center gap-4 px-2.5 text-foreground"
                        >
                            <CreditCard className="h-5 w-5" />
                            Billing
                        </Link>
                        {session?.user?.id === ADMIN_DISCORD_ID && (
                            <Link href="/admin" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                                <Shield className="h-5 w-5" />
                                Admin
                            </Link>
                        )}
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="relative ml-auto flex-1 md:grow-0">
               <UserMenu />
            </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </SidebarProvider>
  )
}
