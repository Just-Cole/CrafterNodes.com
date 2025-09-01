
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { getUserSubscriptions, type Subscription } from "@/app/actions/billing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import Link from "next/link";

function SubscriptionStatusBadge({ status }: { status: string }) {
    const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
        'active': 'default',
        'trialing': 'default',
        'canceled': 'secondary',
        'past_due': 'destructive',
        'unpaid': 'destructive',
    };

    return <Badge variant={statusVariant[status] || 'secondary'}>{status}</Badge>;
}

export default function BillingPage() {
    const { data: session } = useSession();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            getUserSubscriptions()
                .then(setSubscriptions)
                .finally(() => setLoading(false));
        }
    }, [session]);


    return (
        <div className="container mx-auto py-12 md:py-20">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Billing & Subscriptions</h1>
                    <p className="text-muted-foreground">Manage your active and past subscriptions.</p>
                </div>
                <div>
                    <a href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                        <Button>Manage Billing</Button>
                    </a>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Subscriptions</CardTitle>
                    <CardDescription>
                        Here is a list of all your current and past game server subscriptions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Server</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : subscriptions.length > 0 ? (
                                subscriptions.map(sub => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.gameName}</TableCell>
                                        <TableCell>{sub.planName}</TableCell>
                                        <TableCell>
                                            <SubscriptionStatusBadge status={sub.status} />
                                        </TableCell>
                                        <TableCell>{format(new Date(sub.createdAt), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            {sub.status === 'active' && (
                                                <Button asChild>
                                                    <Link href={`/dashboard/server/${sub.id}`}>Manage</Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        You don't have any subscriptions yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
    );
}
