
'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CreateServerPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="Create New Server" 
        description="Select a game to begin your server setup."
      >
        <Button asChild variant="outline">
            <Link href="/dashboard">Cancel</Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>
                This page is not yet implemented. Please check back later.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p>The server creation functionality is currently in development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
