
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getClientDashboardData } from "@/lib/firebase/firestore";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Package, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ClientStats {
  totalJobs: number;
  activeOrders: number;
  recentOrders: Order[];
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getClientDashboardData(user.uid);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch client dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Jobs Posted" value={stats?.totalJobs ?? 0} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Active Orders" value={stats?.activeOrders ?? 0} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                Your most recent orders as a client.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/my-orders">
                View All
                <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : stats && stats.recentOrders.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.recentOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <div className="font-medium">Service Title Placeholder</div>
                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                        Freelancer Name Placeholder
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge className="text-xs" variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">₹{order.price.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">You have no recent orders.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
