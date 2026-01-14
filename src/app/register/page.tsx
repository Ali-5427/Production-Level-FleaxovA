
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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 12.66C34.956 9.167 29.863 7 24 7C12.955 7 4 15.955 4 27s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691L12.722 19.46C14.655 13.842 18.989 10 24 10c3.059 0 5.842 1.154 7.961 3.039L38.802 12.66C34.956 9.167 29.863 7 24 7C16.3 7 9.853 11.237 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 48c5.863 0 10.956-2.167 14.802-5.66l-6.418-4.766C29.842 41.846 27.059 44 24 44c-5.011 0-9.345-3.842-11.278-9.46l-6.418 4.766C9.853 43.763 16.3 48 24 48z" />
        <path fill="#1976D2" d="M43.611 20.083H24v8h19.611c.251-1.26.389-2.576.389-3.917c0-2.6-1.04-5-2.8-6.961l-6.418 4.766C39.842 24.846 42 22.059 42 20h1.611z" />
    </svg>
)

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'client' | 'freelancer'>('freelancer');
    const [isLoading, setIsLoading] = useState(false);
    const { register, registerWithGoogle } = useAuth();
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
    
    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        try {
            await registerWithGoogle(role === 'freelancer');
        } catch (error) {
            // Error is already toasted in context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <Card className="w-full max-w-md mx-4 my-8">
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
                        
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                                </span>
                            </div>
                        </div>

                        <div>
                            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignUp} disabled={isLoading}>
                                <GoogleIcon className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                        </div>


                        <div className="space-y-3 pt-4">
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
                        <Link href="/signin" className="font-semibold text-primary hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
