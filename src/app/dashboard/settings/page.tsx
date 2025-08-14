import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileForm } from "@/components/dashboard/user-profile-form";
import { SecuritySettings } from "@/components/dashboard/security-settings";
import { NotificationsSettings } from "@/components/dashboard/notifications-settings";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <UserProfileForm />
                </TabsContent>
                <TabsContent value="security">
                    <SecuritySettings />
                </TabsContent>
                <TabsContent value="notifications">
                    <NotificationsSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
