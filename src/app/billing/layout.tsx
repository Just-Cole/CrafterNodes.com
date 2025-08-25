
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession, signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";


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

    if (!session?.user) {
        return <Button onClick={() => signIn('discord')}>Login with Discord</Button>;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image!} alt={session.user.name!} />
                        <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/billing">Billing</Link>
                </DropdownMenuItem>
                {session.user.isAdmin && (
                     <DropdownMenuItem asChild>
                        <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <Link href="/">
                  <Logo />
                </Link>
                <div className="flex items-center gap-4">
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}

function Footer() {
    return (
        <footer className="border-t border-border/40">
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-2">
                        <Link href="/">
                            <Logo />
                        </Link>
                        <p className="text-muted-foreground mt-4 text-sm max-w-xs">The ultimate open-source panel to manage your game servers, powered by Next.js and Google Genkit.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/#features" className="text-muted-foreground hover:text-primary">Features</a></li>
                            <li><a href="/#games" className="text-muted-foreground hover:text-primary">Pricing</a></li>
                             <li><a href="#" className="text-muted-foreground hover:text-primary">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-foreground">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-primary">Support Portal</a></li>
                            <li><a href="/#faq" className="text-muted-foreground hover:text-primary">FAQ</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary">Contact Us</a></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                            <li><a href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">&copy; 2025 CrafterNodes. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/api/auth/signin');
        },
    });

    if (status === 'loading') {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div>Loading...</div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </div>
    )
}
