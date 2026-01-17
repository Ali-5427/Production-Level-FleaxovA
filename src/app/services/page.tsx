
"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getServices } from '@/lib/firebase/firestore';
import type { Service } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  
  const placeholderImage = "https://picsum.photos/seed/placeholder/600/400";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Marketplace</h1>
        <Button asChild>
            <Link href={user ? "/dashboard/services/create" : "/register"}>
                <PlusCircle className="mr-2" />
                Create Service
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="p-0">
                  <Link href={`/services/${service.id}`}>
                      <Image 
                        src={service.imageUrl || placeholderImage} 
                        alt={service.title} 
                        width={600} 
                        height={400} 
                        className="rounded-t-lg object-cover aspect-video" 
                      />
                  </Link>
              </CardHeader>
              <CardContent className="p-4">
                <Link href={`/services/${service.id}`}>
                  <CardTitle className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">{service.title}</CardTitle>
                </Link>
                {/* <p className="text-sm text-muted-foreground mt-1">by {service.author}</p> */}
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 pt-0">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">{service.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground ml-1">({service.reviewsCount})</span>
                </div>
                <div className="text-lg font-bold">
                  ${service.price}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
