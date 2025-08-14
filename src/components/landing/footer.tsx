import { Github, Twitter } from "lucide-react";

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
                        <p className="text-muted-foreground mt-4 text-sm">The ultimate open-source panel to manage your game servers, powered by Next.js and Google Genkit.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Our Services</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Minecraft Hosting</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">All Game Servers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Community</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Discord</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Game Panel</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground">Login</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">&copy; 2025 CrafterNodes. All rights reserved.</p>
                     <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a>
                        <a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
