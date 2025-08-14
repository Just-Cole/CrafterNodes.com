import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tickets } from "@/lib/data";

const statusStyles: { [key: string]: string } = {
    Open: "bg-blue-400/20 text-blue-300 border-blue-400/30",
    Answered: "bg-green-400/20 text-green-300 border-green-400/30",
    Closed: "bg-gray-400/20 text-gray-300 border-gray-400/30",
};

export function TicketsList() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                                <TableCell className="font-medium">{ticket.id}</TableCell>
                                <TableCell>{ticket.subject}</TableCell>
                                <TableCell>{ticket.updated}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={statusStyles[ticket.status]}>{ticket.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">View</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
