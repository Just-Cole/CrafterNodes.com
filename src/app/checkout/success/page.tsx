
'use client';

import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getCheckoutSessionFlow } from '@/ai/flows/get-checkout-session-flow';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [metadata, setMetadata] = useState<Record<string, string> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError("No session ID provided.");
            setLoading(false);
            return;
        }

        async function fetchMetadata() {
            try {
                const result = await getCheckoutSessionFlow({ sessionId: sessionId! });
                setMetadata(result.metadata);
            } catch (err) {
                setError("Failed to fetch session details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchMetadata();
    }, [sessionId]);


    return (
        <div className="container mx-auto py-20 md:py-32">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl">Payment Successful!</CardTitle>
                    <CardDescription>Your transaction has been completed and your new server is being set up.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6">
                        You should receive a confirmation email shortly. You can now manage your new server from your dashboard.
                    </p>
                    
                    <div className="text-left bg-secondary p-4 rounded-md my-6">
                        <h3 className="font-semibold mb-2">Stripe Metadata Received:</h3>
                        {loading && (
                            <div className="flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading session data...</span>
                            </div>
                        )}
                        {error && <p className="text-destructive">{error}</p>}
                        {metadata && (
                            <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto">
                                {JSON.stringify(metadata, null, 2)}
                            </pre>
                        )}
                         {!loading && !metadata && !error && (
                            <p className="text-muted-foreground">No metadata was found for this session.</p>
                        )}
                    </div>
                    
                    <div className="flex justify-center gap-4">
                        <Button asChild>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href="/">Go to Homepage</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
