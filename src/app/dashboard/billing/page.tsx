
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { createCustomerPortalFlow } from "@/ai/flows/create-customer-portal-flow";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function BillingDashboardPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleManageBilling = async () => {
        if (!session?.user?.id) return;
        
        setIsLoading(true);
        try {
            const response = await createCustomerPortalFlow({
                discordId: session.user.id,
                returnUrl: window.location.href,
            });

            if (response.url) {
                window.location.href = response.url;
            } else {
                 toast({
                    title: "Error",
                    description: "Could not create a billing portal session. You may not have any active subscriptions.",
                    variant: "destructive"
                });
            }

        } catch (error) {
            console.error("Error creating customer portal session:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again later.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="py-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Billing</h1>
                    <p className="text-muted-foreground">Manage your subscription, payment methods, and view your invoice history.</p>
                </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Your Subscription</CardTitle>
                        <CardDescription>Click the button below to be redirected to our secure billing portal, powered by Stripe. You can update your payment method, cancel subscriptions, and download invoices there.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleManageBilling} disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Redirecting..." : "Open Secure Billing Portal"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">You will be securely redirected to Stripe to manage your billing information.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Servers</CardTitle>
                        <CardDescription>View your active game servers and manage their configurations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button asChild>
                           <Link href="/billing">Go to My Servers</Link>
                       </Button>
                        <p className="text-xs text-muted-foreground mt-4">This will take you to the list of your active and past subscriptions.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
