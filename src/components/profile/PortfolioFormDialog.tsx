
"use client"

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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { PortfolioItem } from '@/lib/types';
import { useEffect } from 'react';

const portfolioSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100),
  description: z.string().min(20, "Description must be at least 20 characters.").max(500),
  url: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  // imageUrl is not handled in this form for now
});

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

interface PortfolioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<PortfolioItem, 'id' | 'imageUrl'> & { id?: string }) => void;
  initialData?: PortfolioItem | null;
}

export function PortfolioFormDialog({ open, onOpenChange, onSave, initialData }: PortfolioFormDialogProps) {
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
    },
  });

  useEffect(() => {
    if (open) {
        if (initialData) {
            form.reset(initialData);
        } else {
            form.reset({
                title: '',
                description: '',
                url: '',
            });
        }
    }
  }, [initialData, form, open]);

  const onSubmit = (values: PortfolioFormValues) => {
    onSave({ id: initialData?.id, ...values });
  };

  const dialogTitle = initialData ? "Edit Portfolio Item" : "Add Portfolio Item";
  const dialogDescription = initialData ? "Update the details of your project." : "Showcase your best work to potential clients.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., E-commerce Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the project, your role, and the outcome."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Placeholder for image upload */}
            <div className="space-y-2">
                <FormLabel>Project Image</FormLabel>
                <Input type="file" disabled />
                <p className="text-sm text-muted-foreground">Image uploads are not yet implemented.</p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
