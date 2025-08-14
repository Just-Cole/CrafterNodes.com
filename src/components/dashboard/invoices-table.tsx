import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { invoices } from "@/lib/data";

const statusStyles: { [key: string]: string } = {
    Paid: "bg-green-400/20 text-green-300 border-green-400/30",
    Due: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
};

export function InvoicesTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                <TableCell>{invoice.service}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>{invoice.amount}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={statusStyles[invoice.status]}>{invoice.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        {invoice.status === 'Due' ? 'Pay Now' : 'View'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
