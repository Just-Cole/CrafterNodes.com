import { ServiceCard } from '@/components/dashboard/service-card';
import { services } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of your hosting services.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Service
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
