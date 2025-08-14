import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Cpu, Feather, Server } from "lucide-react";
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

const features = [
    { icon: <Server className="h-10 w-10" />, title: "High Performance Servers", description: "Blazing fast and reliable servers to host your applications." },
    { icon: <Cpu className="h-10 w-10" />, title: "Dedicated Resources", description: "Get dedicated CPU, RAM, and storage for your projects." },
    { icon: <Feather className="h-10 w-10" />, title: "Easy-to-use Control Panel", description: "Manage your services with our intuitive and modern dashboard." },
]

const pricingTiers = [
    {
        name: 'Starter',
        price: '$10',
        features: ['1 vCPU', '2GB RAM', '50GB SSD', '1TB Bandwidth', 'Basic DDoS Protection'],
    },
    {
        name: 'Pro',
        price: '$25',
        features: ['2 vCPU', '4GB RAM', '100GB SSD', '5TB Bandwidth', 'Advanced DDoS Protection'],
        popular: true,
    },
    {
        name: 'Business',
        price: '$50',
        features: ['4 vCPU', '8GB RAM', '200GB SSD', '10TB Bandwidth', 'Premium DDoS Protection'],
    },
];

export default function LandingPage() {
    return (
        <>
            <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            Powerful Hosting, Simplified.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            CrafterNodes provides high-performance hosting solutions with an intuitive control panel. Focus on your code, we'll handle the rest.
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
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why Choose CrafterNodes?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">The best features to power your projects.</p>
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
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Flexible Pricing for Teams of All Sizes</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Choose a plan that fits your needs.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingTiers.map((tier) => (
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
                                        Choose Plan
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full py-20 md:py-32 bg-secondary text-center">
                <div className="container mx-auto">
                     <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ready to get started?</h2>
                     <p className="mt-4 text-lg text-muted-foreground">Create an account and launch your first server in minutes.</p>
                     <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href="/dashboard">Sign Up Now</Link>
                        </Button>
                     </div>
                </div>
            </section>
        </>
    );
}
