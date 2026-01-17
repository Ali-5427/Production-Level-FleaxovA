
"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Star, Edit, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getServicesByFreelancer, deleteService } from '@/lib/firebase/firestore';
import type { Service } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/alert-dialog"

export default function MyServicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };
    const fetchServices = async () => {
      setLoading(true);
      try {
        const fetchedServices = await getServicesByFreelancer(user.uid);
        setServices(fetchedServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        toast({ title: "Error", description: "Could not fetch your services.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user, toast]);

  const handleDelete = async (serviceId: string) => {
    try {
        await deleteService(serviceId);
        setServices(prev => prev.filter(s => s.id !== serviceId));
        toast({ title: "Success", description: "Service deleted successfully." });
    } catch (error) {
        console.error("Failed to delete service:", error);
        toast({ title: "Error", description: "Could not delete service.", variant: "destructive" });
    }
  }
  
  const placeholderImage = "https://picsum.photos/seed/placeholder/600/400";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Services</h1>
        <Button asChild>
            <Link href="/dashboard/services/create">
                <PlusCircle className="mr-2" />
                Create New Service
            </Link>
        </Button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="rounded-t-lg aspect-video" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h2 className="text-xl font-semibold">No services yet</h2>
            <p className="text-muted-foreground mt-2 mb-4">Click below to create your first service and start selling.</p>
            <Button asChild>
                <Link href="/dashboard/services/create">
                    <PlusCircle className="mr-2" />
                    Create Service
                </Link>
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader className="p-0 relative">
                  <Link href={`/dashboard/services/${service.id}`}>
                      <Image 
                        src={service.imageUrl || placeholderImage} 
                        alt={service.title} 
                        width={600} 
                        height={400} 
                        className="rounded-t-lg object-cover aspect-video"
                      />
                  </Link>
                   <div className="absolute top-2 right-2">
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/services/edit/${service.id}`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4" /> Edit</Link>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your service
                                and remove its data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                   </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <Link href={`/dashboard/services/${service.id}`}>
                  <CardTitle className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">{service.title}</CardTitle>
                </Link>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 pt-0">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">{service.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground ml-1">({service.reviewsCount})</span>
                </div>
                <div className="text-lg font-bold">
                  ₹{service.price}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
