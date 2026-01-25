"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Briefcase, FileText, DollarSign, Landmark } from "lucide-react";
import { getAdminDashboardStats } from "@/lib/firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  totalUsers: number;
  totalServices: number;
  totalJobs: number;
  totalRevenue: number;
  pendingWithdrawals: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const fetchedStats = await getAdminDashboardStats();
        setStats(fetchedStats);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, loading }: { title: string, value: string | number, icon: React.ReactNode, loading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Active Services" value={stats?.totalServices ?? 0} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Open Jobs" value={stats?.totalJobs ?? 0} icon={<FileText className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Platform Revenue" value={`₹${stats?.totalRevenue.toFixed(2) ?? '0.00'}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Pending Withdrawals" value={stats?.pendingWithdrawals ?? 0} icon={<Landmark className="h-4 w-4 text-muted-foreground" />} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center">Recent activity feed coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
