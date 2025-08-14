import { InvoicesTable } from "@/components/dashboard/invoices-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function InvoicesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <p className="text-muted-foreground">
                    View and manage your billing history.
                </p>
                </div>
                <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export All
                </Button>
            </div>

            <InvoicesTable />
        </div>
    );
}
