
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getJobsByClient } from '@/lib/firebase/firestore';
import type { Job } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function MyJobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const clientJobs = await getJobsByClient(user.uid);
                setJobs(clientJobs);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [user]);
    
    if (loading) {
         return (
            <div className="container mx-auto px-4 py-8">
                 <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Jobs</h1>
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/4 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                        <CardFooter>
                             <Skeleton className="h-10 w-48" />
                        </CardFooter>
                    </Card>
                    ))}
                </div>
            </div>
         );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Posted Jobs</h1>
                <Button asChild>
                    <Link href="/dashboard/jobs/create">
                        <PlusCircle className="mr-2" />
                        Post a New Job
                    </Link>
                </Button>
            </div>
            
            {jobs.length > 0 ? (
                <div className="space-y-6">
                    {jobs.map(job => (
                        <Card key={job.id}>
                            <CardHeader>
                                <CardTitle>{job.title}</CardTitle>
                                <CardDescription>
                                    Posted on {format(new Date(job.createdAt), 'PPP')} &middot; Deadline: {format(new Date(job.deadline), 'PPP')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Badge variant={job.status === 'open' ? 'secondary' : 'default'} className="capitalize">{job.status}</Badge>
                                    <div className="flex items-center text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>{job.applicationCount} Application{job.applicationCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="default" disabled={job.status !== 'open'}>
                                    <Link href={`/dashboard/my-jobs/${job.id}/applications`}>
                                        View Applications
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <h2 className="text-xl font-semibold">No jobs posted yet</h2>
                    <p className="text-muted-foreground mt-2 mb-4">Click below to post your first job and find talent.</p>
                    <Button asChild>
                        <Link href="/dashboard/jobs/create">
                            <PlusCircle className="mr-2" />
                            Post a Job
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
