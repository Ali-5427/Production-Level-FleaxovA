
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersForUser, updateOrderStatus } from '@/lib/firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Check, Truck } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userOrders = await getOrdersForUser(user.uid);
            setOrders(userOrders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast({ title: "Error", description: "Could not fetch your orders.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast({ title: "Order Updated", description: `The order status has been set to ${newStatus}.` });
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast({ title: "Error", description: "Could not update the order.", variant: "destructive" });
        }
    }

    const sellingOrders = orders.filter(o => o.freelancerId === user?.uid);
    const buyingOrders = orders.filter(o => o.clientId === user?.uid);

    const OrderList = ({ orders, type }: { orders: Order[], type: 'buying' | 'selling' }) => {
        if (loading) {
            return <div className="space-y-4 pt-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        }
        if (orders.length === 0) {
            return <p className="text-center text-muted-foreground py-10">No {type === 'buying' ? 'orders placed' : 'sales'} yet.</p>
        }

        return (
            <div className="space-y-4 pt-4">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader className="flex flex-col md:flex-row items-start gap-4 space-y-0">
                            <Avatar className="w-24 h-24 md:w-16 md:h-16 rounded-md shrink-0">
                                <AvatarImage src={order.imageUrl} alt={order.title} />
                                <AvatarFallback>{order.title.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Link href={order.source === 'service' ? `/services/${order.sourceId}` : `/jobs/${order.sourceId}`} className="hover:underline">
                                    <CardTitle className="text-lg leading-snug">{order.title}</CardTitle>
                                </Link>
                                <CardDescription>
                                    {type === 'buying' ? `Sold by ${order.freelancerName}` : `Bought by ${order.clientName}`}
                                </CardDescription>
                                <p className="text-sm text-muted-foreground mt-2">Order placed on {format(new Date(order.createdAt), 'PPP')}</p>
                            </div>
                            <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0">
                                <div className="font-bold text-lg">₹{order.price.toFixed(2)}</div>
                                <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize mt-1">{order.status.replace('_', ' ')}</Badge>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                           {type === 'selling' && order.status === 'active' && (
                               <Button onClick={() => handleStatusUpdate(order.id, 'delivered')}>
                                   <Truck className="mr-2 h-4 w-4"/>Mark as Delivered
                               </Button>
                           )}
                           {type === 'buying' && order.status === 'delivered' && (
                               <Button onClick={() => handleStatusUpdate(order.id, 'completed')}>
                                   <Check className="mr-2 h-4 w-4"/>Approve & Complete
                               </Button>
                           )}
                           <Button asChild variant="outline">
                                <Link href={`/dashboard/my-orders/${order.id}`}>
                                    View Details
                                </Link>
                           </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <Tabs defaultValue={profile?.role === 'freelancer' ? 'selling' : 'buying'} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="selling" disabled={profile?.role !== 'freelancer'}>Selling</TabsTrigger>
                    <TabsTrigger value="buying" disabled={profile?.role !== 'client'}>Buying</TabsTrigger>
                </TabsList>
                <TabsContent value="selling">
                     {profile?.role === 'freelancer' ? <OrderList orders={sellingOrders} type="selling" /> : null}
                </TabsContent>
                <TabsContent value="buying">
                     {profile?.role === 'client' ? <OrderList orders={buyingOrders} type="buying" /> : null}
                </TabsContent>
            </Tabs>
        </div>
    )
}
