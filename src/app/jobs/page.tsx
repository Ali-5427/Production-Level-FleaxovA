
"use client"
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getJobs } from '@/lib/firebase/firestore';
import type { Job } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const fetchedJobs = await getJobs();
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Job Board</h1>
            {user?.uid && (
                <Button asChild>
                    <Link href={user.uid ? "/dashboard/jobs/create" : "/register"}>
                        <PlusCircle className="mr-2" />
                        Post a Job
                    </Link>
                </Button>
            )}
        </div>
        {loading ? (
           <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                </CardFooter>
              </Card>
            ))}
           </div>
        ) : (
            <div className="space-y-6">
                {jobs.map(job => (
                    <Card key={job.id}>
                        <CardHeader>
                            <Link href={`/jobs/${job.id}`}>
                                <CardTitle className="hover:text-primary transition-colors">{job.title}</CardTitle>
                            </Link>
                            <CardDescription>
                                Posted by {job.clientName} &middot; Budget: ${job.budget} &middot; Deadline: {format(new Date(job.deadline), 'PPP')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="flex gap-2 flex-wrap">
                                {job.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={`/jobs/${job.id}`}>View Details</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
    </div>
  )
}
