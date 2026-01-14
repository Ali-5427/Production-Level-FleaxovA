
"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function JobDetailPage({ params }: { params: { id: string } }) {
    const job = {
        id: '1',
        title: 'Looking for a React Developer for a short-term project',
        budget: 500,
        skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
        description: 'We need an experienced React developer to help us build a new feature for our e-commerce platform. The project involves creating a new product comparison tool. The ideal candidate should have strong experience with modern frontend technologies and be able to work independently.',
        client: {
            name: 'John Doe',
            avatar: 'https://picsum.photos/seed/client1/100/100',
            rating: 4.8,
            reviews: 25,
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">{job.title}</CardTitle>
                            <CardDescription>Posted by {job.client.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
                            <p className="text-muted-foreground leading-relaxed mb-6">{job.description}</p>
                            
                            <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">${job.budget}</p>
                            <Button className="w-full mt-4">Apply Now</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>About the Client</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={job.client.avatar} />
                                <AvatarFallback>{job.client.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{job.client.name}</p>
                                <p className="text-sm text-muted-foreground">Rating: {job.client.rating} ({job.client.reviews} reviews)</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
