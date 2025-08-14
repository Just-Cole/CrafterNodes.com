import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketsList } from "@/components/dashboard/tickets-list";
import { NewTicketForm } from "@/components/dashboard/new-ticket-form";

export default function SupportPage() {
    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
                <p className="text-muted-foreground">
                    Get help and track your support requests.
                </p>
            </div>

            <Tabs defaultValue="my-tickets">
                <TabsList>
                    <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
                    <TabsTrigger value="new-ticket">Submit a Ticket</TabsTrigger>
                </TabsList>
                <TabsContent value="my-tickets" className="mt-6">
                    <TicketsList />
                </TabsContent>
                <TabsContent value="new-ticket" className="mt-6">
                    <NewTicketForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}
