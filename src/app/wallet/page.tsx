"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function WalletPage() {
    const transactions = [
        { id: '1', type: 'deposit', amount: 500.00, date: '2023-10-26', status: 'Completed' },
        { id: '2', type: 'withdrawal', amount: 200.00, date: '2023-10-24', status: 'Completed' },
        { id: '3', type: 'earning', amount: 150.00, date: '2023-10-22', description: 'Logo Design Project', status: 'Completed' },
        { id: '4', type: 'withdrawal', amount: 300.00, date: '2023-10-21', status: 'Pending' },
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
                        <p className="text-4xl font-bold">$1,250.75</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button className="flex-1">
                            <ArrowUpCircle className="mr-2" />
                            Deposit
                        </Button>
                        <Button variant="secondary" className="flex-1">
                             <ArrowDownCircle className="mr-2" />
                            Withdraw
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your recent deposits, withdrawals, and earnings.</CardDescription>
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
                                        {t.type === 'withdrawal' ? '-' : '+'}${t.amount.toFixed(2)}
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
