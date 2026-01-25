
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getWithdrawalsListener, approveWithdrawal, rejectWithdrawal } from '@/lib/firebase/firestore';
import type { Withdrawal, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Info, Loader2, XCircle } from 'lucide-react';

type EnrichedWithdrawal = Withdrawal & { freelancerName?: string; freelancerEmail?: string };

const RejectDialog = ({ withdrawalId, onReject }: { withdrawalId: string; onReject: (id: string, reason: string) => void }) => {
    const [reason, setReason] = useState('');
    const [open, setOpen] = useState(false);

    const handleReject = () => {
        if (!reason.trim()) return;
        onReject(withdrawalId, reason);
        setOpen(false);
        setReason('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Withdrawal Request?</DialogTitle>
                    <DialogDescription>
                        The funds will be returned to the freelancer's wallet. Please provide a clear reason for the rejection.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        placeholder="Rejection reason..." 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button variant="destructive" onClick={handleReject} disabled={!reason.trim()}>
                        Confirm Rejection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PaymentDetailsPopover = ({ withdrawal }: { withdrawal: EnrichedWithdrawal }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto">View Details</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Payment Details for {withdrawal.freelancerName}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Method: <Badge className="capitalize">{withdrawal.paymentDetails.preferredMethod}</Badge>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="text-sm space-y-2 py-4">
                    <p><strong>Account Holder:</strong> {withdrawal.paymentDetails.accountHolderName}</p>
                    {withdrawal.paymentDetails.preferredMethod === 'upi' ? (
                        <p><strong>UPI ID:</strong> {withdrawal.paymentDetails.upiId}</p>
                    ) : (
                        <>
                            <p><strong>Bank Name:</strong> {withdrawal.paymentDetails.bankName}</p>
                            <p><strong>Account No:</strong> {withdrawal.paymentDetails.accountNumber}</p>
                            <p><strong>IFSC Code:</strong> {withdrawal.paymentDetails.ifscCode}</p>
                        </>
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default function AdminWithdrawalsPage() {
    const [allWithdrawals, setAllWithdrawals] = useState<EnrichedWithdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = getWithdrawalsListener((data) => {
            setAllWithdrawals(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredWithdrawals = useMemo(() => {
        return {
            pending: allWithdrawals.filter(w => w.status === 'pending'),
            approved: allWithdrawals.filter(w => w.status === 'approved'),
            rejected: allWithdrawals.filter(w => w.status === 'rejected'),
        };
    }, [allWithdrawals]);

    const handleApprove = async (id: string) => {
        try {
            await approveWithdrawal(id);
            toast({ title: 'Success', description: 'Withdrawal approved.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            await rejectWithdrawal(id, reason);
            toast({ title: 'Success', description: 'Withdrawal rejected and funds returned.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
    const WithdrawalsTable = ({ withdrawals }: { withdrawals: EnrichedWithdrawal[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Requested</TableHead>
                    {withdrawals[0]?.status !== 'pending' && <TableHead>Processed</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={withdrawals[0]?.status === 'pending' ? 5 : 6}><Skeleton className="h-8" /></TableCell>
                    </TableRow>
                )) : withdrawals.length > 0 ? withdrawals.map(w => (
                    <TableRow key={w.id}>
                        <TableCell>
                            <div className="font-medium">{w.freelancerName}</div>
                            <div className="text-muted-foreground text-xs">{w.freelancerEmail}</div>
                        </TableCell>
                        <TableCell className="font-semibold">₹{w.amount.toFixed(2)}</TableCell>
                        <TableCell>
                            <PaymentDetailsPopover withdrawal={w} />
                        </TableCell>
                        <TableCell>{format(new Date(w.createdAt), 'PP pp')}</TableCell>
                        {w.status !== 'pending' && (
                            <TableCell>{w.processedAt ? format(new Date(w.processedAt), 'PP pp') : '-'}</TableCell>
                        )}
                        <TableCell className="text-right">
                            {w.status === 'pending' ? (
                                <div className="flex gap-2 justify-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-600/50">
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Approve Withdrawal?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action marks the withdrawal as complete. You must send the funds manually. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleApprove(w.id)}>
                                                    Confirm & Approve
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <RejectDialog withdrawalId={w.id} onReject={handleReject} />
                                </div>
                            ) : (
                                <Badge variant={w.status === 'approved' ? 'default' : 'destructive'} className="capitalize">{w.status}</Badge>
                            )}
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No requests found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({filteredWithdrawals.pending.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Requests</CardTitle>
                            <CardDescription>Review and process withdrawal requests from freelancers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WithdrawalsTable withdrawals={filteredWithdrawals.pending} />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="approved">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approved Requests</CardTitle>
                            <CardDescription>History of all approved withdrawals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WithdrawalsTable withdrawals={filteredWithdrawals.approved} />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="rejected">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Requests</CardTitle>
                            <CardDescription>History of all rejected withdrawals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <WithdrawalsTable withdrawals={filteredWithdrawals.rejected} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
