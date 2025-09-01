
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function BillingPage() {
    const { data: session } = useSession();

    return (
        <div className="py-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Billing Portal</h1>
                    <p className="text-muted-foreground">Manage your subscription, payment methods, and view your invoice history.</p>
                </div>
            </div>

            <div className="mt-8 grid gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Your Subscription</CardTitle>
                        <CardDescription>Click the button below to be redirected to our secure billing portal, powered by Stripe. You can update your payment method, cancel subscriptions, and download invoices there.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                            <Button>Open Secure Billing Portal</Button>
                        </a>
                        <p className="text-xs text-muted-foreground mt-4">You will be securely redirected to Stripe to manage your billing information.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
