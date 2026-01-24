
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getOrderById } from '@/lib/firebase/firestore';
import type { Order } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Check, Clock, Package, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id || !user) {
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            try {
                const fetchedOrder = await getOrderById(params.id);
                // Security check: user must be part of the order
                if (fetchedOrder && fetchedOrder.participantIds.includes(user.uid)) {
                    setOrder(fetchedOrder);
                } else {
                    setOrder(null);
                    router.push('/dashboard'); // Or show an unauthorized page
                }
            } catch (error) {
                console.error("Failed to fetch order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id, user, router]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return notFound();
    }

    const isClient = profile?.role === 'client';
    const otherUserRole = isClient ? 'Freelancer' : 'Client';
    const otherUserName = isClient ? order.freelancerName : order.clientName;
    const otherUserAvatar = isClient ? order.freelancerAvatarUrl : order.clientAvatarUrl;

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'completed': return 'default';
            case 'active': case 'delivered': return 'secondary';
            case 'pending_payment': return 'outline';
            case 'cancelled': case 'payment_failed': case 'disputed': return 'destructive';
            default: return 'outline';
        }
    };
    
    const statusText = order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <p className="text-muted-foreground">Order ID: {order.id}</p>
                <h1 className="text-3xl font-bold">{order.title}</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="w-full sm:w-48 shrink-0">
                                    <Link href={order.source === 'service' ? `/services/${order.sourceId}` : `/jobs/${order.sourceId}`}>
                                        <Avatar className="w-full h-auto aspect-video rounded-md">
                                            <AvatarImage src={order.imageUrl} alt={order.title} className="object-cover" />
                                            <AvatarFallback><Package/></AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </div>
                                <div className="space-y-2">
                                    <Link href={order.source === 'service' ? `/services/${order.sourceId}` : `/jobs/${order.sourceId}`} className="hover:underline">
                                        <h3 className="font-semibold text-lg">{order.title}</h3>
                                    </Link>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>Ordered on {format(new Date(order.createdAt), 'PPP')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Check className="w-4 h-4" />
                                        <span>Status: <Badge variant={getStatusVariant(order.status)}>{statusText}</Badge></span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline & Actions</CardTitle>
                            <CardDescription>Follow the progress of your order.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground">Order timeline and actions coming soon.</p>
                        </CardContent>
                    </Card>

                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financials</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Price</span>
                                <span className="font-semibold">₹{order.price.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4"/>Platform Fee (10%)</span>
                                <span className="text-muted-foreground">- ₹{order.commission?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center font-semibold">
                                <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-green-500"/>{isClient ? "Freelancer's Earning" : "Your Earning"}</span>
                                <span>₹{order.freelancerEarning?.toFixed(2) || '0.00'}</span>
                            </div>
                            <Separator />
                             <div className="text-xs text-muted-foreground space-y-1">
                                <p><span className="font-semibold">Payment ID:</span> {order.paymentId || 'N/A'}</p>
                                <p><span className="font-semibold">Source:</span> <span className="capitalize">{order.source} Order</span></p>
                             </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>About the {otherUserRole}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={otherUserAvatar} />
                                <AvatarFallback>{otherUserName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{otherUserName}</p>
                                <p className="text-sm text-muted-foreground">Member since {format(new Date(), 'MMM yyyy')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
