
import DashboardLayout from "../dashboard/layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    // TODO: Re-implement admin protection when auth is added back.
    return <DashboardLayout>{children}</DashboardLayout>;
}
