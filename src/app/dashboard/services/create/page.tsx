
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateServicePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create a New Service</CardTitle>
                    <CardDescription>Fill out the details below to list your service on the marketplace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Service Title</Label>
                            <Input id="title" placeholder="e.g., I will design a modern minimalist logo" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Describe your service in detail..." rows={6} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input id="price" type="number" placeholder="e.g., 500" min="100" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" placeholder="e.g., Graphic Design" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="image">Image</Label>
                            <Input id="image" type="file" />
                        </div>
                        <Button type="submit" className="w-full">Create Service</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
