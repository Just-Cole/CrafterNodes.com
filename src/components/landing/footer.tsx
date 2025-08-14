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

export function Footer() {
    return (
        <footer className="border-t">
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Logo />
                        <p className="text-muted-foreground mt-4 text-sm">Your all-in-one hosting control panel.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Products</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Game Servers</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Web Hosting</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">VPS</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CrafterNodes. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
