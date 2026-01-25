
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { createWithdrawalRequest } from '@/lib/firebase/firestore';
import Link from 'next/link';

interface WithdrawalDialogProps {
  children: React.ReactNode;
}

export function WithdrawalDialog({ children }: WithdrawalDialogProps) {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withdrawalSchema = z.object({
    amount: z.coerce
      .number()
      .min(100, "Minimum withdrawal is ₹100.")
      .max(profile?.walletBalance || 0, "Amount cannot exceed your wallet balance."),
  });

  type FormValues = z.infer<typeof withdrawalSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 100,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!profile || !profile.paymentDetails?.isVerified) {
      toast({ title: "Error", description: "Payment details are not verified.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createWithdrawalRequest(profile.id, values.amount, profile.paymentDetails);
      toast({ title: "Request Submitted", description: "Your withdrawal request is being processed. It usually takes 24-48 hours." });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ title: "Withdrawal Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderContent = () => {
    if (authLoading) {
      return <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />;
    }

    if (!profile?.paymentDetails) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Payment Details Missing</AlertTitle>
          <AlertDescription>
            You need to add and verify your payment details before you can request a withdrawal.
          </AlertDescription>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button asChild>
                <Link href="/dashboard/payment-settings">Go to Settings</Link>
            </Button>
          </DialogFooter>
        </Alert>
      );
    }

    if (!profile.paymentDetails.isVerified) {
        return (
            <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Verification Pending</AlertTitle>
                <AlertDescription>
                    Your payment details are currently under review. Withdrawals will be enabled once they are approved.
                </AlertDescription>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </Alert>
        );
    }

    // Verified, show form
    return (
        <>
            <p className="text-sm text-muted-foreground">
                Your current balance is <span className="font-bold text-foreground">₹{profile.walletBalance.toFixed(2)}</span>. 
                Funds will be sent to your verified {profile.paymentDetails.preferredMethod} account.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Withdrawal Amount (₹)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Requesting...</> : 'Request Withdrawal'}
                    </Button>
                </DialogFooter>
                </form>
            </Form>
        </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Withdrawal</DialogTitle>
          <DialogDescription>
            Transfer your available balance to your linked payment method.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
