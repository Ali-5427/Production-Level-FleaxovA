

"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrdersForUser, getWithdrawalsForUser } from '@/lib/firebase/firestore';
import { format } from 'date-fns';
import type { Order, Withdrawal } from '@/lib/types';
import { WithdrawalDialog } from '@/components/wallet/WithdrawalDialog';
import { Badge } from '@/components/ui/badge';

interface Transaction {
    id: string;
    type: 'earning' | 'withdrawal';
    amount: number;
    date: any;
    description: string;
    status: string;
}

export default function WalletPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);

    useEffect(() => {
        if (!user || profile?.role !== 'freelancer') {
            setLoadingTransactions(false);
            return;
        }

        const fetchTransactions = async () => {
            setLoadingTransactions(true);
            try {
                const [orders, withdrawals] = await Promise.all([
                    getOrdersForUser(user.uid),
                    getWithdrawalsForUser(user.uid)
                ]);
                
                const earnings: Transaction[] = orders
                    .filter((o): o is Order & { freelancerEarning: number } => 
                        o.freelancerId === user.uid && 
                        o.status === 'completed' &&
                        typeof o.freelancerEarning === 'number'
                    )
                    .map(o => ({
                        id: `earn_${o.id}`,
                        type: 'earning' as const,
                        amount: o.freelancerEarning,
                        date: o.createdAt, 
                        description: `Earning from "${o.title}"`,
                        status: 'Completed'
                    }));
                
                const debits: Transaction[] = withdrawals.map(w => ({
                    id: `wd_${w.id}`,
                    type: 'withdrawal' as const,
                    amount: w.amount,
                    date: w.createdAt,
                    description: `Withdrawal to ${w.paymentDetails.preferredMethod === 'bank' ? 'Bank Account' : 'UPI'}`,
                    status: w.status,
                }));
                
                const allTransactions = [...earnings, ...debits]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20);

                setTransactions(allTransactions);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoadingTransactions(false);
            }
        };

        fetchTransactions();
    }, [user, profile]);

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'approved':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    }

    const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
         <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    {transaction.type === 'earning' 
                        ? <ArrowUpCircle className="h-5 w-5 text-green-500" /> 
                        : <ArrowDownCircle className="h-5 w-5 text-destructive" />
                    }
                    <div className="font-medium capitalize">{transaction.type}</div>
                </div>
                <div className="text-sm text-muted-foreground pl-7">{transaction.description}</div>
            </TableCell>
            <TableCell className={transaction.type === 'withdrawal' ? 'text-destructive' : 'text-green-600'}>
                {transaction.type === 'withdrawal' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
            </TableCell>
            <TableCell>{format(new Date(transaction.date), 'PPP')}</TableCell>
            <TableCell>
                <Badge variant={getStatusBadgeVariant(transaction.status)} className="capitalize">{transaction.status}</Badge>
            </TableCell>
        </TableRow>
    );

    const TransactionSkeleton = () => (
         <TableRow>
            <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
        </TableRow>
    )
    
    const canWithdraw = profile?.role === 'freelancer';

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {authLoading ? (
                            <Skeleton className="h-10 w-36" />
                        ) : (
                            <p className="text-4xl font-bold">₹{(profile?.walletBalance ?? 0).toFixed(2)}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>Withdraw your available earnings.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <WithdrawalDialog>
                            <Button className="flex-1" disabled={!canWithdraw || authLoading}>
                                 <ArrowDownCircle className="mr-2" />
                                Request Withdrawal
                            </Button>
                        </WithdrawalDialog>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your recent earnings and withdrawals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingTransactions ? (
                                <>
                                    <TransactionSkeleton />
                                    <TransactionSkeleton />
                                    <TransactionSkeleton />
                                </>
                            ) : transactions.length > 0 ? (
                                transactions.map(t => <TransactionRow key={t.id} transaction={t} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No transactions yet. Complete an order to see your first earning.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
