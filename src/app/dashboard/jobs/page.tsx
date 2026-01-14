
"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  const { user } = useAuth();
  const jobs = [
    {
      id: '1',
      title: 'Looking for a React Developer for a short-term project',
      budget: 500,
      skills: ['React', 'TypeScript', 'Next.js'],
      description: 'We need an experienced React developer to help us build a new feature for our e-commerce platform...'
    },
    {
      id: '2',
      title: 'UI/UX Designer Needed for Mobile App',
      budget: 800,
      skills: ['Figma', 'UI/UX', 'Mobile Design'],
      description: 'Seeking a talented designer to create a modern and intuitive interface for our new fitness application.'
    },
    {
        id: '3',
        title: 'Backend Engineer (Node.js/Express) for API development',
        budget: 1200,
        skills: ['Node.js', 'Express', 'MongoDB'],
        description: 'We are looking to hire a backend engineer to develop and maintain our RESTful APIs.'
    },
  ];
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Job Board</h1>
            <Button asChild>
                <Link href={user ? "/dashboard/jobs/create" : "/register"}>
                    <PlusCircle className="mr-2" />
                    Post a Job
                </Link>
            </Button>
        </div>
        <div className="space-y-6">
            {jobs.map(job => (
                <Card key={job.id}>
                    <CardHeader>
                        <Link href={`/dashboard/jobs/${job.id}`}>
                            <CardTitle className="hover:text-primary transition-colors">{job.title}</CardTitle>
                        </Link>
                        <CardDescription>Budget: ${job.budget}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {job.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/jobs/${job.id}`}>View Details</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  )
}
