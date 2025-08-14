import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const notificationItems = [
    { id: "service_alerts", title: "Service Alerts", description: "Receive alerts for service downtime, high usage, and maintenance." },
    { id: "invoice_due", title: "Invoice Due Dates", description: "Get reminders for upcoming and overdue invoices." },
    { id: "ticket_updates", title: "Ticket Updates", description: "Be notified when a support ticket is updated." },
    { id: "promotions", title: "Promotions", description: "Receive news about promotions and new services." },
]

export function NotificationsSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications from us.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
                {notificationItems.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Switch defaultChecked={item.id !== 'promotions'} />
                    </div>
                ))}
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
                <Button>Save Preferences</Button>
            </CardFooter>
        </Card>
    );
}
