
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ServicesPage() {
  const { user } = useAuth();
  const getImage = (hint: string) => {
    return PlaceHolderImages.find(img => img.imageHint === hint) || { imageUrl: "https://picsum.photos/seed/placeholder/600/400", imageHint: "placeholder" };
  }

  const services = [
    {
      id: "1",
      title: "I will design a modern minimalist logo",
      author: "CreativeGuy",
      rating: 4.9,
      reviews: 120,
      price: 50,
      image: getImage("logo design").imageUrl,
      imageHint: getImage("logo design").imageHint,
    },
    {
      id: "2",
      title: "I will develop a responsive WordPress website",
      author: "WebAppWizard",
      rating: 5.0,
      reviews: 88,
      price: 250,
      image: getImage("website development").imageUrl,
      imageHint: getImage("website development").imageHint,
    },
    {
      id: "3",
      title: "I will write SEO-friendly blog posts",
      author: "WordSmith",
      rating: 4.8,
      reviews: 250,
      price: 25,
      image: getImage("content writing").imageUrl,
      imageHint: getImage("content writing").imageHint,
    },
    {
        id: "4",
        title: "I will create a stunning video animation",
        author: "MotionMaster",
        rating: 4.9,
        reviews: 75,
        price: 300,
        image: getImage("video animation").imageUrl,
        imageHint: getImage("video animation").imageHint,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Marketplace</h1>
        <Button asChild>
            <Link href={user ? "/services/create" : "/login"}>
                <PlusCircle className="mr-2" />
                Create Service
            </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="p-0">
                <Link href={`/services/${service.id}`}>
                    <Image 
                      src={service.image} 
                      alt={service.title} 
                      width={600} 
                      height={400} 
                      className="rounded-t-lg object-cover aspect-video" 
                      data-ai-hint={service.imageHint}
                    />
                </Link>
            </CardHeader>
            <CardContent className="p-4">
              <Link href={`/services/${service.id}`}>
                <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">{service.title}</CardTitle>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">by {service.author}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 pt-0">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-semibold">{service.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">({service.reviews})</span>
              </div>
              <div className="text-lg font-bold">
                ${service.price}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
