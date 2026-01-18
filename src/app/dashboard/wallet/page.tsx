
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletPage() {
    const { profile, loading } = useAuth();
    
    // This is static data. We'll make it dynamic later.
    const transactions = [
        { id: '1', type: 'earning', amount: 1500.00, date: '2023-10-22', description: 'Logo Design Project', status: 'Completed' },
        { id: '2', type: 'withdrawal', amount: 500.00, date: '2023-10-21', status: 'Pending' },
    ];
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loading ? (
                            <Skeleton className="h-10 w-36" />
                        ) : (
                            <p className="text-4xl font-bold">₹{(profile?.walletBalance || 0).toFixed(2)}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>Deposits & withdrawals are coming soon.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button className="flex-1" disabled>
                            <ArrowUpCircle className="mr-2" />
                            Deposit
                        </Button>
                        <Button variant="secondary" className="flex-1" disabled>
                             <ArrowDownCircle className="mr-2" />
                            Withdraw
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your recent deposits, withdrawals, and earnings. (Static data for now)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium capitalize">{t.type}</TableCell>
                                    <TableCell className={t.type === 'withdrawal' ? 'text-destructive' : 'text-green-600'}>
                                        {t.type === 'withdrawal' ? '-' : '+'}₹{t.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{t.date}</TableCell>
                                    <TableCell>{t.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
