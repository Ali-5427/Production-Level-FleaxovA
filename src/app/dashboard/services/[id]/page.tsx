
"use client"
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Clock } from "lucide-react";
import Image from "next/image";
import { getServiceById, getUser } from "@/lib/firebase/firestore";
import type { Service, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const [service, setService] = useState<Service | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    const fetchServiceData = async () => {
      setLoading(true);
      const fetchedService = await getServiceById(id);
      setService(fetchedService);
      if (fetchedService) {
        const fetchedSeller = await getUser(fetchedService.freelancerId);
        setSeller(fetchedSeller);
      }
      setLoading(false);
    };

    fetchServiceData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-1/4 mt-4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <p className="text-muted-foreground">The service you are looking for does not exist.</p>
      </div>
    );
  }
  
  const placeholderImage = "https://picsum.photos/seed/placeholder/800/450";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            {seller && (
              <>
                <Avatar>
                  <AvatarImage src={seller.avatarUrl} alt={seller.fullName} />
                  <AvatarFallback>{seller.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-semibold">{seller.fullName}</div>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="font-bold text-lg">{service.rating.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">({service.reviewsCount} reviews)</span>
            </div>
          </div>
          <Card className="mb-6">
            <CardContent className="p-0">
              <Image src={service.imageUrl || placeholderImage} alt={service.title} width={800} height={450} className="rounded-lg object-cover w-full aspect-video" />
            </CardContent>
          </Card>
          <h2 className="text-2xl font-bold mb-4">About this service</h2>
          <p className="text-muted-foreground leading-relaxed">{service.description}</p>
          {service.tags && service.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-baseline">
                <span>Basic Package</span>
                <span className="text-2xl font-bold">₹{service.price}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">A professional logo with 2 concepts and source files.</p>
               <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{service.deliveryTime} day delivery</span>
              </div>
              <Button className="w-full" size="lg">Continue (₹{service.price})</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
