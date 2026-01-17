
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getApplicationsByFreelancer } from '@/lib/firebase/firestore';
import type { Application } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function MyApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchApplications = async () => {
            setLoading(true);
            try {
                const apps = await getApplicationsByFreelancer(user.uid);
                setApplications(apps);
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [user]);

    const getStatusVariant = (status: Application['status']) => {
        switch (status) {
            case 'accepted': return 'default';
            case 'rejected': return 'destructive';
            case 'pending': return 'secondary';
            default: return 'outline';
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Applications</h1>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Applications</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Submitted Applications</CardTitle>
                    <CardDescription>Track the status of all your job applications here.</CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length > 0 ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Your Bid</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/dashboard/jobs/${app.jobId}`} className="hover:text-primary">
                                                {app.jobTitle}
                                            </Link>
                                        </TableCell>
                                        <TableCell>${app.bidAmount.toFixed(2)}</TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(app.status)} className="capitalize">{app.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You have not applied to any jobs yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
