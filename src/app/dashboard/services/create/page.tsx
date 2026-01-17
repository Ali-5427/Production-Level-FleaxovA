
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createService } from '@/lib/firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const serviceSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title must be less than 100 characters"),
    description: z.string().min(30, "Description must be at least 30 characters"),
    price: z.coerce.number().min(100, "Price must be at least ₹100"),
    deliveryTime: z.coerce.number().min(1, "Delivery time must be at least 1 day"),
    category: z.string().min(1, "Category is required"),
    tags: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const categories = [
    "Graphic Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Business",
    "Lifestyle"
];

export default function CreateServicePage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 100,
            deliveryTime: 1,
            category: '',
            tags: ''
        }
    });

    const onSubmit = async (values: ServiceFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create a service.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await createService({
                ...values,
                tags: values.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
                freelancerId: user.uid,
            });
            toast({ title: "Service Created!", description: "Your service is now live on the marketplace." });
            router.push('/dashboard/services');
        } catch (error) {
            console.error("Service creation failed:", error);
            toast({ title: "Error", description: "Failed to create service. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create a New Service</CardTitle>
                    <CardDescription>Fill out the details below to list your service on the marketplace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., I will design a modern minimalist logo" {...field} />
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
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe your service in detail..." rows={6} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="100" placeholder="e.g., 5000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="deliveryTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Delivery Time (in days)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" placeholder="e.g., 3" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags (comma-separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., logo design, branding, modern" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="space-y-2">
                                <Label htmlFor="image">Image (Optional)</Label>
                                <Input id="image" type="file" disabled />
                                <p className="text-sm text-muted-foreground">Image uploads are not yet implemented.</p>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Service'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
