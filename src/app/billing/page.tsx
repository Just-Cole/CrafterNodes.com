
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function BillingPage() {
    const { data: session } = useSession();

    // In a real app, you'd fetch subscription status from your backend
    const subscription = {
        plan: 'Pro',
        status: 'Active',
        nextBilling: 'September 15, 2024'
    }

    return (
        <div className="container mx-auto py-12 md:py-20">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Billing</h1>
                    <p className="text-muted-foreground">Manage your subscription and payment details.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the <strong>{subscription.plan}</strong> plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Status: <span className="font-semibold text-green-500">{subscription.status}</span></p>
                        <p className="text-muted-foreground">Your next bill is on {subscription.nextBilling}.</p>
                        <div className="mt-4 flex gap-2">
                             <Button>Upgrade Plan</Button>
                             <Button variant="outline">Cancel Subscription</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Your primary payment method.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Visa ending in <strong>4242</strong></p>
                        <p className="text-muted-foreground">Expires 12/2028</p>
                        <Button variant="outline" className="mt-4">Update Payment Method</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
