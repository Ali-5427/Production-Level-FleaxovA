
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'client' | 'freelancer'>('freelancer');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast({
                title: "Registration Failed",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            await register(email, password, fullName, role === 'freelancer');
             // The redirect is now handled in the AuthContext
        } catch (error: any) {
            // Toast is now handled in the AuthContext
            console.error("Registration failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Create an Account</CardTitle>
                    <CardDescription>Join our network of freelancers and clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>I want to:</Label>
                            <RadioGroup defaultValue="freelancer" value={role} onValueChange={(value) => setRole(value as any)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="freelancer" id="r-freelancer" />
                                    <Label htmlFor="r-freelancer">Work as a Freelancer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="client" id="r-client" />
                                    <Label htmlFor="r-client">Hire for a Project</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
