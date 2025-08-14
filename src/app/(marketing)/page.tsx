import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Gamepad2, Puzzle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const features = [
    { icon: <Gamepad2 className="h-10 w-10" />, title: "Instant Server Setup", description: "Get your game server online in seconds. Our automated system provisions your server instantly after purchase." },
    { icon: <ShieldCheck className="h-10 w-10" />, title: "DDoS Protection", description: "We provide enterprise-level DDoS protection to keep your game server online 24/7, no matter what." },
    { icon: <Puzzle className="h-10 w-10" />, title: "Mod & Plugin Support", description: "Easily install your favorite mods and plugins with our one-click installer. Customize your server to your liking." },
]

const minecraftTiers = [
    {
        name: 'Creeper',
        price: '$5',
        features: ['10 Player Slots', '2GB RAM', 'Mod Support', 'Basic DDoS Protection'],
    },
    {
        name: 'Ender Dragon',
        price: '$15',
        features: ['40 Player Slots', '6GB RAM', 'Mod Support', 'Advanced DDoS Protection'],
        popular: true,
    },
    {
        name: 'Warden',
        price: '$30',
        features: ['Unlimited Slots', '12GB RAM', 'Mod Support', 'Premium DDoS Protection'],
    },
];

const cs2Tiers = [
    {
        name: 'Silver',
        price: '$8',
        features: ['12 Player Slots', '64-Tick', 'Plugin Support', 'Basic DDoS Protection'],
    },
    {
        name: 'Global Elite',
        price: '$18',
        features: ['16 Player Slots', '128-Tick', 'Plugin Support', 'Advanced DDoS Protection'],
        popular: true,
    },
    {
        name: 'Faceit Pro',
        price: '$35',
        features: ['20 Player Slots', '128-Tick', 'Plugin Support', 'Premium DDoS Protection'],
    },
];

export default function LandingPage() {
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
                                <Link href="/dashboard">Get Started</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#pricing">View Pricing</Link>
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
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pricing That Makes Sense</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Choose a plan that fits your community's size.</p>
                    </div>

                    <div className="space-y-16">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="relative h-12 w-12">
                                    <Image src="https://placehold.co/100x100.png" alt="Minecraft Logo" data-ai-hint="minecraft grass block" fill className="object-contain" />
                                </div>
                                <h3 className="text-3xl font-bold">Minecraft Hosting</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {minecraftTiers.map((tier) => (
                                    <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary' : ''}`}>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                            <CardDescription>
                                                <span className="text-4xl font-bold text-foreground">{tier.price}</span>/month
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            {tier.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                        <div className="p-6">
                                            <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                                                Order Now
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="relative h-12 w-12">
                                    <Image src="https://placehold.co/100x100.png" alt="CS2 Logo" data-ai-hint="counter strike logo" fill className="object-contain" />
                                </div>
                                <h3 className="text-3xl font-bold">Counter-Strike 2 Hosting</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {cs2Tiers.map((tier) => (
                                    <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary' : ''}`}>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                            <CardDescription>
                                                <span className="text-4xl font-bold text-foreground">{tier.price}</span>/month
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            {tier.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                        <div className="p-6">
                                            <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                                                Order Now
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </section>

             <section className="w-full py-20 md:py-32 bg-secondary">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Featured Games</h2>
                            <p className="mt-4 text-lg text-muted-foreground">We support all the popular games and are always adding more. Instantly switch between games at any time.</p>
                             <div className="mt-8">
                                <Button size="lg" asChild>
                                    <Link href="/dashboard">Deploy Your Server</Link>
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
