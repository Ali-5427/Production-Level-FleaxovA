
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getServices } from '@/lib/firebase/firestore';
import type { Service } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ServicesPage() {
  const { user } = useAuth();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices();
        setAllServices(fetchedServices);
        setFilteredServices(fetchedServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  
  const categories = useMemo(() => ['All', ...Array.from(new Set(allServices.map(s => s.category)))], [allServices]);

  useEffect(() => {
    let services = allServices;

    if (searchTerm) {
      services = services.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedCategory !== 'All') {
      services = services.filter(s => s.category === selectedCategory);
    }
    
    setFilteredServices(services);

  }, [searchTerm, selectedCategory, allServices]);

  const placeholderImage = "https://picsum.photos/seed/placeholder/600/400";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Service Marketplace</h1>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <Input 
                placeholder="Search services..." 
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
            </Select>
            {user && (
                <Button asChild className="w-full md:w-auto">
                    <Link href="/dashboard/services/create">
                        <PlusCircle className="mr-2" />
                        Create Service
                    </Link>
                </Button>
            )}
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="rounded-t-lg aspect-video" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-4" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
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
          {filteredServices.map((service) => (
            <Card key={service.id} className="flex flex-col">
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
              <CardContent className="p-4 flex-grow">
                <Link href={`/services/${service.id}`}>
                  <CardTitle className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2 h-[56px]">{service.title}</CardTitle>
                </Link>
                <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={service.freelancerAvatarUrl} />
                        <AvatarFallback>{service.freelancerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground truncate">{service.freelancerName}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 pt-0">
                 <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold text-sm">{service.rating > 0 ? service.rating.toFixed(1) : 'New'}</span>
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
