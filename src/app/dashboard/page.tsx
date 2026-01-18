
"use client"
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import FreelancerDashboard from '@/components/dashboard/FreelancerDashboard';
import ClientDashboard from '@/components/dashboard/ClientDashboard';

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[350px]" />
          <Skeleton className="col-span-4 lg:col-span-3 h-[350px]" />
        </div>
      </div>
    );
  }

  if (profile.role === 'freelancer') {
    return <FreelancerDashboard />;
  }

  if (profile.role === 'client') {
    return <ClientDashboard />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p>Your dashboard is being prepared.</p>
    </div>
  );
}
