"use client";

import { useState, useEffect } from "react";
import { getServices, deleteService } from "@/lib/firebase/firestore";
import type { Service } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ServiceModerationPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchServices = async () => {
        setLoading(true);
        try {
            const allServices = await getServices();
            setServices(allServices);
        } catch (error) {
            console.error("Failed to fetch services:", error);
            toast({ title: "Error", description: "Could not fetch services.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchServices();
    }, [toast]);
    
    const handleDelete = async (serviceId: string) => {
        try {
            await deleteService(serviceId);
            setServices(prev => prev.filter(s => s.id !== serviceId));
            toast({ title: "Success", description: "Service deleted successfully." });
        } catch (error) {
            console.error("Failed to delete service:", error);
            toast({ title: "Error", description: "Could not delete service.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Service Moderation</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Freelancer</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : services.length > 0 ? (
                                services.map(service => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <Image src={service.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt={service.title} width={50} height={50} className="rounded aspect-square object-cover" />
                                        </TableCell>
                                        <TableCell className="font-medium max-w-xs truncate">{service.title}</TableCell>
                                        <TableCell>{service.freelancerName}</TableCell>
                                        <TableCell>₹{service.price}</TableCell>
                                        <TableCell>{format(new Date(service.createdAt), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action will permanently delete this service from the platform. This cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Confirm Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No services found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
