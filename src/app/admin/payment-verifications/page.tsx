
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getUsersListener, verifyPaymentDetails, rejectPaymentDetails } from '@/lib/firebase/firestore';
import type { User, PaymentDetails } from '@/lib/types';
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
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

const RejectDialog = ({ userId, onReject }: { userId: string; onReject: (id: string, reason: string) => void }) => {
    const [reason, setReason] = useState('');
    const [open, setOpen] = useState(false);

    const handleReject = () => {
        if (!reason.trim()) return;
        onReject(userId, reason);
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
                    <DialogTitle>Reject Payment Details?</DialogTitle>
                    <DialogDescription>
                        The freelancer will be notified and asked to resubmit. Please provide a clear reason for the rejection.
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

const PaymentDetailsView = ({ details }: { details: PaymentDetails }) => (
    <div className="text-xs space-y-1">
        <p><strong>Holder:</strong> {details.accountHolderName}</p>
        <p><strong>Method:</strong> <Badge variant="secondary" className="capitalize">{details.preferredMethod}</Badge></p>
        {details.preferredMethod === 'upi' ? (
            <p><strong>UPI ID:</strong> {details.upiId}</p>
        ) : (
            <>
                <p><strong>Bank:</strong> {details.bankName}</p>
                <p><strong>Acct No:</strong> {details.accountNumber}</p>
                <p><strong>IFSC:</strong> {details.ifscCode}</p>
            </>
        )}
    </div>
);

export default function PaymentVerificationsPage() {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = getUsersListener((users) => {
            setAllUsers(users);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredUsers = useMemo(() => {
        const freelancersWithDetails = allUsers.filter(u => u.role === 'freelancer' && u.paymentDetails);
        return {
            pending: freelancersWithDetails.filter(u => u.paymentDetails && !u.paymentDetails.isVerified && !u.paymentDetails.rejectionReason),
            verified: freelancersWithDetails.filter(u => u.paymentDetails?.isVerified),
            rejected: freelancersWithDetails.filter(u => u.paymentDetails && !!u.paymentDetails.rejectionReason),
        };
    }, [allUsers]);

    const handleVerify = async (id: string) => {
        try {
            await verifyPaymentDetails(id);
            toast({ title: 'Success', description: 'Payment details have been verified.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            await rejectPaymentDetails(id, reason);
            toast({ title: 'Success', description: 'Payment details rejected. User notified.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
    const UsersTable = ({ users, type }: { users: User[], type: 'pending' | 'verified' | 'rejected' }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Submitted / Updated</TableHead>
                    {type === 'rejected' && <TableHead>Rejection Reason</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={type === 'rejected' ? 5 : 4}><Skeleton className="h-8" /></TableCell>
                    </TableRow>
                )) : users.length > 0 ? users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-muted-foreground text-xs">{user.email}</div>
                        </TableCell>
                        <TableCell>
                           {user.paymentDetails && <PaymentDetailsView details={user.paymentDetails} />}
                        </TableCell>
                        <TableCell>
                            {user.paymentDetails?.updatedAt?.seconds && format(new Date(user.paymentDetails.updatedAt.seconds * 1000), 'PP pp')}
                        </TableCell>
                         {type === 'rejected' && (
                            <TableCell className="text-destructive text-xs max-w-xs">{user.paymentDetails?.rejectionReason}</TableCell>
                        )}
                        <TableCell className="text-right">
                            {type === 'pending' ? (
                                <div className="flex gap-2 justify-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-600/50">
                                                <CheckCircle className="mr-2 h-4 w-4" /> Verify
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Verify Payment Details?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will approve the details and allow the freelancer to request withdrawals. This action can be reversed by rejecting the details later.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleVerify(user.id)}>
                                                    Confirm & Verify
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <RejectDialog userId={user.id} onReject={handleReject} />
                                </div>
                            ) : type === 'verified' ? (
                               <div className="flex items-center justify-end">
                                <Badge variant="default" className="bg-green-600 hover:bg-green-600"><ShieldCheck className="mr-2 h-4 w-4"/>Verified</Badge>
                               </div>
                            ) : (
                                <RejectDialog userId={user.id} onReject={handleReject} />
                            )}
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">No users in this category.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Payment Verifications</h1>
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({filteredUsers.pending.length})</TabsTrigger>
                    <TabsTrigger value="verified">Verified ({filteredUsers.verified.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({filteredUsers.rejected.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Verification</CardTitle>
                            <CardDescription>Review and verify payment details submitted by freelancers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UsersTable users={filteredUsers.pending} type="pending" />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="verified">
                    <Card>
                        <CardHeader>
                            <CardTitle>Verified Users</CardTitle>
                            <CardDescription>Freelancers with approved payment details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UsersTable users={filteredUsers.verified} type="verified" />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="rejected">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Submissions</CardTitle>
                            <CardDescription>Details that were rejected. Freelancers have been notified to resubmit.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <UsersTable users={filteredUsers.rejected} type="rejected" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
