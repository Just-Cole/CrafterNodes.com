import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { activeSessions } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Smartphone, Monitor } from "lucide-react";

const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
        return <Smartphone className="h-5 w-5 text-muted-foreground" />;
    }
    if (device.toLowerCase().includes('windows') || device.toLowerCase().includes('macos') || device.toLowerCase().includes('linux')) {
        return <Monitor className="h-5 w-5 text-muted-foreground" />;
    }
    return <Globe className="h-5 w-5 text-muted-foreground" />;
};


export function SecuritySettings() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Enable 2FA</p>
                            <p className="text-xs text-muted-foreground">
                                Secure your account with a time-based one-time password (TOTP).
                            </p>
                        </div>
                        <Switch defaultChecked={false} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>This is a list of devices that have logged into your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeSessions.map((session, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {getDeviceIcon(session.device)}
                                            <span className="font-medium">{session.device}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{session.location}</TableCell>
                                    <TableCell className="text-muted-foreground">{session.lastActive}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">Revoke</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button variant="destructive">Revoke All Sessions</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
