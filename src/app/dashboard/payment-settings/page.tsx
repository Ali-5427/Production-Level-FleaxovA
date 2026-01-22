
"use client"

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import type { PaymentDetails } from '@/lib/types';
import { useRouter } from 'next/navigation';

const paymentSettingsSchema = z.object({
  accountHolderName: z.string().min(3, "Name must be at least 3 characters long."),
  preferredMethod: z.enum(['bank', 'upi'], { required_error: "You must select a preferred payment method." }),
  upiId: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.preferredMethod === 'upi') {
    if (!data.upiId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'UPI ID is required.', path: ['upiId'] });
    } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(data.upiId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid UPI ID format (e.g., username@okhdfcbank).', path: ['upiId'] });
    }
  } else if (data.preferredMethod === 'bank') {
    if (!data.bankName || data.bankName.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bank name is required and must be at least 3 characters.', path: ['bankName'] });
    }
    if (!data.accountNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Account number is required.', path: ['accountNumber'] });
    } else if (!/^\d{9,18}$/.test(data.accountNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Account number must be between 9 and 18 digits.', path: ['accountNumber'] });
    }
    if (!data.ifscCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'IFSC code is required.', path: ['ifscCode'] });
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid IFSC code format (e.g., SBIN0001234).', path: ['ifscCode'] });
    }
  }
});

type PaymentFormValues = z.infer<typeof paymentSettingsSchema>;

export default function PaymentSettingsPage() {
  const { profile, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      accountHolderName: '',
      preferredMethod: 'bank',
      upiId: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    },
  });

  const preferredMethod = form.watch('preferredMethod');

  useEffect(() => {
    if (profile) {
      if (profile.role !== 'freelancer') {
        toast({ title: 'Unauthorized', description: 'This page is for freelancers only.', variant: 'destructive' });
        router.push('/dashboard');
        return;
      }
      if (profile.paymentDetails) {
        form.reset(profile.paymentDetails);
      } else if (profile.fullName) {
        form.setValue('accountHolderName', profile.fullName);
      }
    }
  }, [profile, form, router, toast]);

  const onSubmit = async (values: PaymentFormValues) => {
    if (!profile) return;
    setIsSubmitting(true);
    
    const newPaymentDetails: PaymentDetails = {
      ...profile.paymentDetails,
      accountHolderName: values.accountHolderName,
      preferredMethod: values.preferredMethod,
      upiId: values.preferredMethod === 'upi' ? values.upiId : '',
      bankName: values.preferredMethod === 'bank' ? values.bankName : '',
      accountNumber: values.preferredMethod === 'bank' ? values.accountNumber : '',
      ifscCode: values.preferredMethod === 'bank' ? values.ifscCode : '',
      isVerified: false, // Always reset verification on update
      rejectionReason: '', // Clear previous rejection reason
      updatedAt: serverTimestamp(),
      addedAt: profile.paymentDetails?.addedAt || serverTimestamp(),
    };

    try {
      await updateProfile({ paymentDetails: newPaymentDetails });
      toast({
        title: 'Details Submitted',
        description: 'Your payment details have been submitted for verification.',
      });
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const VerificationStatus = () => {
    if (!profile?.paymentDetails) return null;

    if (profile.paymentDetails.isVerified) {
      return (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
          <ShieldCheck className="h-4 w-4 !text-green-600" />
          <AlertTitle>Verified!</AlertTitle>
          <AlertDescription>Your payment details have been verified. You can now request withdrawals.</AlertDescription>
        </Alert>
      );
    }

    if (profile.paymentDetails.rejectionReason) {
       return (
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Verification Rejected</AlertTitle>
          <AlertDescription>
            <p className="font-semibold">Reason: {profile.paymentDetails.rejectionReason}</p>
            <p>Please review and correct your details below, then resubmit for verification.</p>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Pending Verification</AlertTitle>
        <AlertDescription>Your payment details have been submitted and are awaiting admin approval. This can take up to 48 hours.</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Manage how you receive payments for your work. Changes will require re-verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <VerificationStatus />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl><Input placeholder="Your full name as per bank records" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Preferred Payout Method</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col md:flex-row gap-4">
                          <FormItem className="flex-1">
                            <FormControl>
                              <RadioGroupItem value="bank" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                              Bank Transfer
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex-1">
                            <FormControl>
                              <RadioGroupItem value="upi" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                              UPI
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {preferredMethod === 'bank' && (
                  <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl><Input placeholder="e.g., State Bank of India" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl><Input placeholder="Enter account number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code</FormLabel>
                            <FormControl><Input placeholder="Enter IFSC code" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {preferredMethod === 'upi' && (
                   <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                    <FormField
                      control={form.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID</FormLabel>
                          <FormControl><Input placeholder="yourname@bank" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
                  {isSubmitting ? 'Submitting for Verification...' : 'Save & Submit for Verification'}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
