import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UserProfileForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is how others will see you on the site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
