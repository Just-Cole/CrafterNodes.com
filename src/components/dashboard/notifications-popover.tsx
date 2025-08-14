import { Bell, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { notifications } from '@/lib/data';

export function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Card className="border-none">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>You have {notifications.length} new messages.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col max-h-72 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4 p-4 hover:bg-accent">
                    <div className="bg-secondary p-2 rounded-full">
                        <Server className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
                    </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-2 border-t">
              <Button variant="link" size="sm" className="w-full">View all notifications</Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
