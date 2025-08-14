import { Button } from "@/components/ui/button";
import Link from "next/link";

function Logo() {
    return (
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="text-xl font-semibold text-foreground">CrafterNodes</span>
        </div>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <Logo />
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
                    <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">Docs</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
