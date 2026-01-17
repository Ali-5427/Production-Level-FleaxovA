
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createJob } from '@/lib/firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const jobSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title must be less than 100 characters"),
    description: z.string().min(30, "Description must be at least 30 characters"),
    budget: z.coerce.number().min(5, "Budget must be at least $5"),
    skills: z.string().min(1, "At least one skill is required"),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function CreateJobPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            description: '',
            budget: 5,
            skills: '',
        }
    });

    const onSubmit = async (values: JobFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to post a job.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await createJob({
                title: values.title,
                description: values.description,
                budget: values.budget,
                skills: values.skills.split(',').map(skill => skill.trim()).filter(Boolean),
                clientId: user.uid,
            });
            toast({ title: "Job Posted!", description: "Your job is now live on the job board." });
            router.push('/dashboard/jobs');
        } catch (error) {
            console.error("Job posting failed:", error);
            toast({ title: "Error", description: "Failed to post job. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Post a New Job</CardTitle>
                    <CardDescription>Fill out the details below to find the perfect freelancer for your project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Senior React Developer needed for a web app" {...field} />
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
                                        <FormLabel>Job Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe your project in detail..." rows={6} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <FormField
                                    control={form.control}
                                    name="budget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Budget ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 1000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                               <FormField
                                    control={form.control}
                                    name="skills"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Required Skills (comma-separated)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., React, TypeScript, Node.js" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Posting...' : 'Post Job'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
