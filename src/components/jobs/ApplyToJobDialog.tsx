
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { applyToJob } from '@/lib/firebase/firestore';
import type { Job } from '@/lib/types';

const applicationSchema = z.object({
  bidAmount: z.coerce.number().min(5, 'Bid must be at least $5.'),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters.'),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplyToJobDialogProps {
  job: Job;
  children: React.ReactNode;
}

export function ApplyToJobDialog({ job, children }: ApplyToJobDialogProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      bidAmount: job.budget,
      coverLetter: '',
    },
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    if (!user || !profile) {
      toast({ title: "Authentication Error", description: "You must be logged in to apply.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await applyToJob({
        ...values,
        jobId: job.id,
        jobTitle: job.title,
        clientId: job.clientId,
        freelancerId: user.uid,
        freelancerName: profile.fullName,
        freelancerAvatarUrl: profile.avatarUrl,
      });
      toast({ title: "Application Sent!", description: "The client has been notified of your application." });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to apply:", error);
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply to: {job.title}</DialogTitle>
          <DialogDescription>
            Submit your proposal to the client. Good luck!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bidAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bid Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 450" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why you're the best fit for this project..."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
