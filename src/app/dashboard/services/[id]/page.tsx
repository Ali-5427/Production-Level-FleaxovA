
"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import Image from "next/image";

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = {
    id: "1",
    title: "I will design a modern minimalist logo",
    description: "I will create a unique and professional logo for your brand. My design process is collaborative, and I will work with you to ensure the final product aligns perfectly with your vision. You'll receive multiple concepts and unlimited revisions.",
    author: "CreativeGuy",
    authorImage: "https://picsum.photos/seed/author1/100/100",
    rating: 4.9,
    reviews: 120,
    price: 50,
    image: "https://picsum.photos/seed/service1/800/600",
    tags: ["Logo Design", "Minimalist", "Branding", "Graphic Design"]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <Avatar>
              <AvatarImage src={service.authorImage} alt={service.author} />
              <AvatarFallback>{service.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="font-semibold">{service.author}</div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="font-bold text-lg">{service.rating}</span>
              <span className="text-muted-foreground ml-1">({service.reviews} reviews)</span>
            </div>
          </div>
          <Card className="mb-6">
            <CardContent className="p-0">
              <Image src={service.image} alt={service.title} width={800} height={600} className="rounded-lg object-cover w-full" />
            </CardContent>
          </Card>
          <h2 className="text-2xl font-bold mb-4">About this service</h2>
          <p className="text-muted-foreground leading-relaxed">{service.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {service.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-baseline">
                <span>Basic Package</span>
                <span className="text-2xl font-bold">${service.price}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">A professional logo with 2 concepts and source files.</p>
              <Button className="w-full" size="lg">Continue (${service.price})</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
