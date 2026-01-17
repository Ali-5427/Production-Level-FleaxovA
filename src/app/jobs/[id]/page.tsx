
"use client"

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobById, getUser } from '@/lib/firebase/firestore';
import type { Job, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function JobDetailPage({ params }: { params: { id: string } }) {
    const { user, profile } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [client, setClient] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            const fetchedJob = await getJobById(params.id);
            setJob(fetchedJob);
            if (fetchedJob) {
                const fetchedClient = await getUser(fetchedJob.clientId);
                setClient(fetchedClient);
            }
            setLoading(false);
        };
        fetchJob();
    }, [params.id]);


    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-3/4 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!job) {
        return <div className="container mx-auto px-4 py-8">Job not found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">{job.title}</CardTitle>
                            <CardDescription>Posted by {job.clientName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
                            <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">{job.description}</p>
                            
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
                             <Button className="w-full mt-4" asChild>
                                <Link href={user ? `/dashboard/jobs/${job.id}` : '/signin'}>
                                    Apply Now
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    {client && (
                        <Card>
                            <CardHeader>
                                <CardTitle>About the Client</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={client.avatarUrl} />
                                    <AvatarFallback>{client.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{client.fullName}</p>
                                    <p className="text-sm text-muted-foreground">Rating: {client.rating.toFixed(1)} ({client.reviewsCount} reviews)</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
