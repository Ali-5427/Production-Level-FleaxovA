
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getJobById, getApplicationsForJob, acceptApplication } from '@/lib/firebase/firestore';
import type { Job, Application } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Check, User, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function JobApplicationsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { id: jobId } = params;

    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !jobId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const jobData = await getJobById(jobId);
                // Security check: ensure the current user is the client who posted the job
                if (jobData?.clientId !== user.uid) {
                    setJob(null);
                    setApplications([]);
                    toast({ title: "Unauthorized", description: "You are not allowed to view applications for this job.", variant: "destructive" });
                    return;
                }
                const appData = await getApplicationsForJob(jobId);
                setJob(jobData);
                setApplications(appData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ title: "Error", description: "Could not load job applications.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, jobId, toast]);
    
    const handleAccept = async (application: Application) => {
        if (!job) return;
        try {
            await acceptApplication(application.id, job.id, application.freelancerId);
            setApplications(apps => apps.map(app => 
                app.id === application.id ? { ...app, status: 'accepted' } : { ...app, status: 'rejected' }
            ));
            setJob(prevJob => prevJob ? { ...prevJob, status: 'assigned', assignedFreelancerId: application.freelancerId } : null);
            toast({ title: "Applicant Hired!", description: `${application.freelancerName} has been awarded the job.` });
        } catch (error) {
            console.error("Failed to accept application:", error);
            toast({ title: "Error", description: "Could not process application acceptance.", variant: "destructive" });
        }
    }

    if (loading) {
        return (
             <div className="container mx-auto px-4 py-8 space-y-8">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    if (!job) {
        return <p className="text-center text-muted-foreground mt-10">Job not found or you do not have permission to view it.</p>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-muted-foreground mb-8">Review the applications submitted for your job post.</p>

            {job.status !== 'open' && (
                <Card className="mb-8 bg-blue-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Check className="h-6 w-6 text-blue-600"/>
                        <div>
                        <CardTitle className="text-blue-800">Job Assigned</CardTitle>
                        <CardDescription className="text-blue-700">
                            This job has been assigned to a freelancer. No further actions can be taken.
                        </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}

            {applications.length > 0 ? (
                <div className="space-y-6">
                    {applications.map(app => (
                        <Card key={app.id}>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={app.freelancerAvatarUrl} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg">{app.freelancerName}</p>
                                        <p className="text-muted-foreground text-sm">Bid: <span className="font-semibold text-foreground">${app.bidAmount.toFixed(2)}</span></p>
                                    </div>
                                </div>
                                 <Badge variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">{app.status}</Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{app.coverLetter}</p>
                            </CardContent>
                            {job.status === 'open' && app.status === 'pending' && (
                                <CardContent className="flex gap-4">
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button>
                                                <Check className="mr-2 h-4 w-4" /> Accept
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to hire {app.freelancerName}?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will award the job to this freelancer and automatically reject all other pending applications. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleAccept(app)}>
                                                    Confirm & Hire
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground mt-10">There are no applications for this job yet.</p>
            )}
        </div>
    )
}
