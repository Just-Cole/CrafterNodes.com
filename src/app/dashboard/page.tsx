
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
import { Server } from "lucide-react";

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

export default function DashboardPage() {
    const { data: session } = useSession();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            getUserSubscriptions()
                .then(subs => setSubscriptions(subs.filter(s => s.status === 'active')))
                .finally(() => setLoading(false));
        }
    }, [session]);

    return (
        <div className="py-6 space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {session?.user?.name}! Here are your active servers.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Active Servers</CardTitle>
                    <CardDescription>
                        Manage your active game servers below.
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
                                Array.from({ length: 1 }).map((_, i) => (
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
                                            <Button asChild>
                                                <Link href={`/dashboard/server/${sub.id}`}>Manage</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <div className="flex flex-col items-center gap-2">
                                            <Server className="h-8 w-8 text-muted-foreground" />
                                            <p className="font-semibold">No active servers found.</p>
                                            <p className="text-muted-foreground text-sm">Ready to start a new adventure?</p>
                                            <Button asChild variant="outline" className="mt-2">
                                                <Link href="/#games">Deploy a Server</Link>
                                            </Button>
                                        </div>
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
