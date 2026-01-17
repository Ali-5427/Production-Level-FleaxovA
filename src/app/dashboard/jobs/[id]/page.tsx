
"use client"

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobById, getUser, getApplicationsForJob } from '@/lib/firebase/firestore';
import type { Job, User, Application } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { ApplyToJobDialog } from '@/components/jobs/ApplyToJobDialog';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardJobDetailPage({ params }: { params: { id: string } }) {
    const { user, profile } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [client, setClient] = useState<User | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [hasApplied, setHasApplied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobData = async () => {
            setLoading(true);
            const fetchedJob = await getJobById(params.id);
            setJob(fetchedJob);

            if (fetchedJob) {
                const [fetchedClient, fetchedApplications] = await Promise.all([
                    getUser(fetchedJob.clientId),
                    getApplicationsForJob(fetchedJob.id),
                ]);
                setClient(fetchedClient);
                setApplications(fetchedApplications);
                if (user) {
                    setHasApplied(fetchedApplications.some(app => app.freelancerId === user.uid));
                }
            }
            setLoading(false);
        };
        fetchJobData();
    }, [params.id, user]);


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
        return <div className="container mx-auto px-4 py-8 text-center">Job not found.</div>;
    }

    const isClientOwner = profile?.role === 'client' && profile.id === job.clientId;

    const renderApplyButton = () => {
        if (profile?.role !== 'freelancer') return null;
        if (hasApplied) {
            return <Button className="w-full mt-4" disabled>Already Applied</Button>
        }
        return (
            <ApplyToJobDialog job={job}>
                <Button className="w-full mt-4">Apply Now</Button>
            </ApplyToJobDialog>
        );
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
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Budget</p>
                                <p className="text-2xl font-bold">${job.budget}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Deadline</p>
                                <p className="font-semibold">{format(new Date(job.deadline), 'PPP')}</p>
                            </div>
                            <div>
                                 <p className="text-sm text-muted-foreground">Applications</p>
                                <p className="font-semibold flex items-center"><Users className="mr-2 h-4 w-4"/> {job.applicationCount}</p>
                            </div>
                             {isClientOwner ? (
                                <Button asChild className="w-full mt-4">
                                    <Link href={`/dashboard/my-jobs/${job.id}/applications`}>View Applications</Link>
                                </Button>
                            ) : renderApplyButton()}
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

