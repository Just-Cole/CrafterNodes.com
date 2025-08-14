'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { CheckCircle, Gamepad2, Puzzle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const features = [
    { icon: <Gamepad2 className="h-10 w-10" />, title: "Instant Server Setup", description: "Get your game server online in seconds. Our automated system provisions your server instantly after purchase." },
    { icon: <ShieldCheck className="h-10 w-10" />, title: "DDoS Protection", description: "We provide enterprise-level DDoS protection to keep your game server online 24/7, no matter what." },
    { icon: <Puzzle className="h-10 w-10" />, title: "Mod & Plugin Support", description: "Easily install your favorite mods and plugins with our one-click installer. Customize your server to your liking." },
]

const supportedGames = [
    {
        name: 'Minecraft',
        image: 'https://placehold.co/400x300.png',
        hint: 'minecraft scene'
    },
    {
        name: 'Counter-Strike 2',
        image: 'https://placehold.co/400x300.png',
        hint: 'counter strike soldier'
    },
    {
        name: 'Valheim',
        image: 'https://placehold.co/400x300.png',
        hint: 'valheim viking'
    },
    {
        name: 'Rust',
        image: 'https://placehold.co/400x300.png',
        hint: 'rust apocalyptic'
    },
    {
        name: 'Palworld',
        image: 'https://placehold.co/400x300.png',
        hint: 'palworld character'
    },
];

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
        }, 3000)

        return () => clearInterval(interval)
    }, [api])


    return (
        <>
            <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            Lag-Free Game Hosting, Powered for Victory.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            CrafterNodes provides high-performance game servers with an intuitive control panel. Focus on your community, we'll handle the rest.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Button size="lg" asChild>
                                <Link href="/#pricing">Get Started</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#features">Learn More</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="w-full py-20 md:py-32 bg-secondary">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The Ultimate Game Hosting Experience</h2>
                        <p className="mt-4 text-lg text-muted-foreground">The best features to power your gaming community.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            
            <section id="pricing" className="w-full py-20 md:py-32 bg-background">
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
                                <CarouselItem key={game.name} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <Card className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="relative aspect-[4/3]">
                                                    <Image src={game.image} alt={game.name} fill className="object-cover" data-ai-hint={game.hint} />
                                                </div>
                                                <div className="p-6">
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

             <section className="w-full py-20 md:py-32 bg-secondary">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ready to Launch?</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Your new game server is just a few clicks away. Get started now and be online in minutes.</p>
                             <div className="mt-8">
                                <Button size="lg" asChild>
                                    <Link href="/#pricing">Deploy Your Server</Link>
                                </Button>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative aspect-square rounded-lg overflow-hidden">
                                <Image src="https://placehold.co/400x400.png" alt="Minecraft" fill className="object-cover" data-ai-hint="minecraft video game" />
                            </div>
                             <div className="relative aspect-square rounded-lg overflow-hidden">
                                <Image src="https://placehold.co/400x400.png" alt="Counter Strike 2" fill className="object-cover" data-ai-hint="counter strike" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}