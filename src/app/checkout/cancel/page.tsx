
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
    return (
        <div className="container mx-auto py-20 md:py-32">
            <Card className="max-w-lg mx-auto">
                <CardHeader className="items-center text-center">
                    <XCircle className="h-16 w-16 text-destructive mb-4" />
                    <CardTitle className="text-3xl">Payment Canceled</CardTitle>
                    <CardDescription>Your transaction was not completed. You have not been charged.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6">
                        It looks like you've canceled the checkout process. If this was a mistake, you can go back and try again.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asChild>
                            <Link href="/#games">View Pricing</Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href="/">Go to Homepage</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
