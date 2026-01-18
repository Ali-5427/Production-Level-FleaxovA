
"use client";

import { useState, useEffect } from "react";
import { getUsersListener, updateUserStatus } from "@/lib/firebase/firestore";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ToggleLeft, ToggleRight, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = getUsersListener((allUsers) => {
            setUsers(allUsers);
            setLoading(false);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let results = users;
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            results = users.filter(user => {
                const nameMatch = user.fullName ? user.fullName.toLowerCase().includes(lowerCaseSearchTerm) : false;
                const emailMatch = user.email ? user.email.toLowerCase().includes(lowerCaseSearchTerm) : false;
                return nameMatch || emailMatch;
            });
        }
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const handleStatusChange = async (userId: string, currentStatus: 'active' | 'suspended') => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await updateUserStatus(userId, newStatus);
            toast({ title: "Success", description: `User status updated to ${newStatus}.` });
        } catch (error) {
            console.error("Failed to update user status:", error);
            toast({ title: "Error", description: "Could not update user status.", variant: "destructive" });
        }
    };

    const StatusBadge = ({ status }: { status: 'active' | 'suspended' }) => (
        <Badge variant={status === 'active' ? 'default' : 'destructive'} className="bg-opacity-80 capitalize">
            {status}
        </Badge>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                    <div className="pt-4">
                        <Input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Wallet</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
                                        <TableCell>{user.email || 'N/A'}</TableCell>
                                        <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                                        <TableCell><StatusBadge status={user.status} /></TableCell>
                                        <TableCell>${(user.walletBalance ?? 0).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400"/>
                                                <span>{(user.rating ?? 0).toFixed(1)}</span>
                                                <span className="text-muted-foreground">({user.reviewsCount ?? 0})</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(user.createdAt), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status)} className="cursor-pointer">
                                                        {user.status === 'active' ? 
                                                            <><ToggleLeft className="mr-2 h-4 w-4" />Suspend</> : 
                                                            <><ToggleRight className="mr-2 h-4 w-4" />Activate</>
                                                        }
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
