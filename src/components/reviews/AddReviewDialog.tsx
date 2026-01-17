
"use client"

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addReviewAndRecalculateRating } from '@/lib/firebase/firestore';
import type { Service } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(500, "Comment cannot exceed 500 characters."),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface AddReviewDialogProps {
  service: Service;
  children: React.ReactNode;
  onReviewAdded: () => void;
}

export function AddReviewDialog({ service, children, onReviewAdded }: AddReviewDialogProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    if (!user || !profile) {
      toast({ title: "Authentication Error", description: "You must be logged in to leave a review.", variant: "destructive" });
      return;
    }
    if (user.uid === service.freelancerId) {
      toast({ title: "Action not allowed", description: "You cannot review your own service.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addReviewAndRecalculateRating({
        serviceId: service.id,
        revieweeId: service.freelancerId,
        reviewerId: user.uid,
        reviewerName: profile.fullName,
        reviewerAvatarUrl: profile.avatarUrl,
        rating: values.rating,
        comment: values.comment,
      });

      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      onReviewAdded(); // Callback to refresh the parent component's data
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast({ title: "Error", description: "Failed to submit review. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave a review for: {service.title}</DialogTitle>
          <DialogDescription>
            Your feedback helps others and the freelancer.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating</FormLabel>
                  <FormControl>
                    <StarRating rating={field.value} onRatingChange={field.onChange} size={24} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this service..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
