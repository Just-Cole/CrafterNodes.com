
'use client';

import { checkoutFlow } from "@/ai/flows/checkout-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import { ShieldCheck, Rocket, Zap, Server, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { PricingData } from "@/lib/pricing";

// Make sure to replace with your actual Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const ADMIN_DISCORD_ID = "949172257345921045";

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

function Header() {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <Link href="/">
                    <Logo />
                </Link>
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
                        <>
                            <Button variant="outline" onClick={() => signIn("discord")}>
                                Login
                            </Button>
                            <Button onClick={() => signIn("discord")}>
                                Sign Up
                            </Button>
                        </>
                    )}
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
                        <Link href="/">
                            <Logo />
                        </Link>
                        <p className="text-muted-foreground mt-4 text-sm">The ultimate open-source panel to manage your game servers, powered by Next.js and Google Genkit.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Community</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="https://discord.gg/tgaAxZDQAa" className="text-muted-foreground hover:text-foreground">Discord</a></li>
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
                        <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
                        <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function PricingDialog({ game }: { game: PricingData['supportedGames'][0] }) {
    const planGridClass = game.plans && game.plans.length > 3 ? "md:grid-cols-3 lg:grid-cols-5" : "md:grid-cols-3";
    const [loading, setLoading] = React.useState<string | null>(null);
    const { data: session } = useSession();
    const { toast } = useToast();

    const handleCheckout = async (plan: typeof game.plans[0]) => {
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to purchase a plan.",
                variant: "destructive",
            })
            signIn('discord');
            return;
        }

        if (!plan.priceId) {
            toast({
                title: "Price ID Missing",
                description: "This plan is not available for purchase yet.",
                variant: "destructive",
            })
            return;
        }


        setLoading(plan.priceId);
        try {
            const stripe = await stripePromise;
            if (!stripe) {
                console.error("Stripe.js has not loaded yet.");
                setLoading(null);
                return;
            }

            const response = await checkoutFlow({
                priceId: plan.priceId,
                successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: window.location.href,
                gameName: game.name,
                planName: plan.name,
                userId: session.user.id
            });

            const { error } = await stripe.redirectToCheckout({
                sessionId: response.sessionId,
            });

            if (error) {
                console.error("Stripe checkout error:", error);
                 toast({
                    title: "Checkout Error",
                    description: error.message || "An unexpected error occurred.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            toast({
                title: "Error",
                description: "Could not initiate the checkout process. Please try again later.",
                variant: "destructive",
            })
        } finally {
            setLoading(null);
        }
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full">View Plans</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center">
                        {game.name} Server Hosting
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        Choose the perfect plan for your community.
                    </DialogDescription>
                </DialogHeader>
                <div className={`grid grid-cols-1 ${planGridClass} gap-6 py-8`}>
                    {game.plans ? (
                        game.plans.map(plan => (
                            <Card key={plan.name} className="flex flex-col relative overflow-hidden">
                                {plan.popular && (
                                     <div className="absolute top-4 -right-10 text-center w-36 transform rotate-45 bg-destructive py-1 text-xs font-semibold text-destructive-foreground shadow-lg">
                                        Popular
                                    </div>
                                )}
                                <CardHeader className="text-center items-center">
                                    {plan.icon && (
                                        <div className="relative h-20 w-20 mb-4 transition-transform duration-200 hover:scale-110">
                                            <Image src={plan.icon} alt={`${plan.name} icon`} fill className="object-contain" />
                                        </div>
                                    )}
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <p className="text-4xl font-bold">{plan.price}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow">
                                    <ul className="space-y-3 text-muted-foreground flex-grow">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-primary" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button 
                                        className="w-full mt-6"
                                        onClick={() => handleCheckout(plan)}
                                        disabled={!plan.priceId || loading === plan.priceId}
                                    >
                                        {loading === plan.priceId ? 'Processing...' : 'Get Started'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center">
                            <p>Pricing plans for {game.name} are coming soon!</p>
                            <Button className="mt-4">
                                <Link href="/#">Contact Sales</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function LandingPageContent({ supportedGames }: { supportedGames: PricingData['supportedGames']}) {
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
                                <Link href="https://discord.gg/tgaAxZDQAa">Join our Discord</Link>
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
                            align: "center",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {supportedGames.map((game) => (
                                <CarouselItem key={game.name} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                    <div className="p-1 h-full">
                                        <Card className="overflow-hidden h-full flex flex-col">
                                            <CardContent className="p-0 flex flex-col flex-grow">
                                                <div className="relative aspect-[2/3]">
                                                    <Image src={game.image} alt={game.name} fill className="object-cover" data-ai-hint={game.hint} />
                                                </div>
                                                <div className="p-4 flex flex-col flex-grow">
                                                    <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                                                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{game.description}</p>
                                                    <p className="text-muted-foreground mb-4">Starting from {game.plans ? game.plans[0].price : "$5"}/month</p>
                                                    <PricingDialog game={game} />
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
