"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";
import { getAdminRevenueData } from "@/lib/firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/types";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RevenueStats {
  totalCommission: number;
  todayCommission: number;
  monthCommission: number;
  recentTransactions: Order[];
}

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const fetchedStats = await getAdminRevenueData();
        setStats(fetchedStats);
      } catch (error) {
        console.error("Failed to fetch admin revenue data:", error);
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
        {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Revenue Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-8">
        <StatCard title="Commission (Today)" value={`₹${stats?.todayCommission.toFixed(2) ?? '0.00'}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="Commission (This Month)" value={`₹${stats?.monthCommission.toFixed(2) ?? '0.00'}`} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} loading={loading} />
        <StatCard title="All-Time Commission" value={`₹${stats?.totalCommission.toFixed(2) ?? '0.00'}`} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Commission Earnings</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Date</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {loading ? [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                              <TableCell><Skeleton className="h-4 w-3/4"/></TableCell>
                              <TableCell><Skeleton className="h-4 w-1/2"/></TableCell>
                              <TableCell><Skeleton className="h-4 w-1/2"/></TableCell>
                          </TableRow>
                      )) : stats && stats.recentTransactions.length > 0 ? (
                          stats.recentTransactions.map(order => (
                              <TableRow key={order.id}>
                                  <TableCell className="font-medium max-w-xs truncate">{order.title}</TableCell>
                                  <TableCell className="text-green-600 font-semibold">+₹{order.commission?.toFixed(2)}</TableCell>
                                  <TableCell>{format(new Date(order.createdAt), 'PP')}</TableCell>
                              </TableRow>
                          ))
                      ) : (
                          <TableRow>
                              <TableCell colSpan={3} className="h-24 text-center">No completed orders yet.</TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Platform Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Alert>
                    <AlertTitle>Configuration Required</AlertTitle>
                    <AlertDescription>
                        These details should be stored securely in your environment variables (e.g., in a `.env.local` file or your deployment provider's settings) and not hardcoded here.
                    </AlertDescription>
                </Alert>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                    <p className="font-semibold">{process.env.NEXT_PUBLIC_PLATFORM_BANK_NAME || "Your Bank Name"}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                    <p className="font-semibold">{process.env.NEXT_PUBLIC_PLATFORM_ACCOUNT_NUMBER || "1234567890"}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">IFSC Code</p>
                    <p className="font-semibold">{process.env.NEXT_PUBLIC_PLATFORM_IFSC_CODE || "BANK0001234"}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">UPI ID</p>
                    <p className="font-semibold">{process.env.NEXT_PUBLIC_PLATFORM_UPI_ID || "platform@bank"}</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
