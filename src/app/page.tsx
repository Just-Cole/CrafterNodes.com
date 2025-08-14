
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { ShieldCheck, Rocket, Zap, Server } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";

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

const features = [
    { icon: <Rocket className="h-10 w-10" />, title: "Instant Setup", description: "Deploy your server in minutes. Choose a game, and our system handles the rest." },
    { icon: <Zap className="h-10 w-10" />, title: "High Performance", description: "Powered by NVMe SSDs and high-clock speed CPUs to eliminate lag and ensure smooth gameplay." },
    { icon: <ShieldCheck className="h-10 w-10" />, title: "DDoS Protection", description: "Enterprise-grade DDoS protection is included with all plans to keep your server online, always." },
    { icon: <Server className="h-10 w-10" />, title: "Full Control", description: "Access our intuitive control panel with a live console, file manager, and backup system." },
];

const supportedGames = [
    {
        name: 'Minecraft',
        image: 'https://placehold.co/1024x1536.png',
        hint: 'minecraft scene'
    },
    {
        name: 'Counter-Strike 2',
        image: 'https://placehold.co/1024x1536.png',
        hint: 'counter strike soldier'
    },
    {
        name: 'Rust',
        image: 'https://placehold.co/1024x1536.png',
        hint: 'rust apocalyptic'
    },
    {
        name: '7 Days to Die',
        image: 'https://placehold.co/1024x1536.png',
        hint: 'zombie survival'
    }
];

function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4">
                    <Button variant="outline">
                        Login
                    </Button>
                    <Button>
                        Sign Up
                    </Button>
                </div>
            </div>
        </header>
    )
}

function Footer() {
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
                            <li><a href="#games" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
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


export default function LandingPage() {
    const [api, setApi] = React.useState<CarouselApi>()
    
    React.useEffect(() => {
        if (!api) {
            return
        }

        const interval = setInterval(() => {
            if (api.canScrollNext()) {
                api.scrollNext()
            } else {
                api.scrollTo(0)
            }
        }, 10000)

        return () => clearInterval(interval)
    }, [api])


    return (
        <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
            <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            Powerful Game Server Hosting, Simplified.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            Experience blazing-fast, reliable server hosting for your favorite games with an intuitive control panel. From single servers to complex networks, CrafterNodes is your all-in-one solution.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Button size="lg" asChild>
                                <Link href="#games">View Pricing</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#">Join our Discord</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="w-full py-20 md:py-32 bg-secondary">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The Ultimate Server Toolkit</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Everything you need for a seamless hosting experience, from performance to management.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="text-center p-8 border border-border rounded-lg bg-background">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold">{feature.title}</h3>
                                <p className="mt-2 text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <section id="games" className="w-full py-20 md:py-32 bg-background">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Games We Support</h2>
                        <p className="mt-4 text-lg text-muted-foreground">We offer hosting for a variety of popular games. More are being added all the time!</p>
                    </div>

                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {supportedGames.map((game) => (
                                <CarouselItem key={game.name} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                                    <div className="p-1">
                                        <Card className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="relative aspect-[2/3]">
                                                    <Image src={game.image} alt={game.name} fill className="object-cover" data-ai-hint={game.hint} />
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                                                    <p className="text-muted-foreground mb-4">Starting from $5/month</p>
                                                    <Button className="w-full">View Plans</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </section>
        </main>
        <Footer />
        </div>
    );
}
