import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function NewTicketForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit a New Ticket</CardTitle>
                <CardDescription>Our team will get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Server connection issue" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select>
                            <SelectTrigger id="department">
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="technical">Technical Support</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Describe your issue in detail..." rows={8} />
                </div>
                <div className="flex justify-end">
                    <Button>Submit Ticket</Button>
                </div>
            </CardContent>
        </Card>
    );
}
