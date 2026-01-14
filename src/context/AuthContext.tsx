
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from '@/lib/firebase/config';
import { 
    login as firebaseLogin, 
    logout as firebaseLogout, 
    register as firebaseRegister,
    signInWithGoogle 
} from '@/lib/firebase/auth';
import type { Profile } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    login: typeof firebaseLogin;
    logout: () => Promise<void>;
    register: typeof firebaseRegister;
    registerWithGoogle: (isSeller: boolean) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const db = getFirestore(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
    }, []);
    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            const publicPaths = ['/', '/signin', '/register'];
            const isPublicPath = publicPaths.some(p => p === pathname) || pathname.startsWith('/services') || pathname.startsWith('/jobs');

            if (firebaseUser) {
                setUser(firebaseUser);
                const profileDocRef = doc(db, "profiles", firebaseUser.uid);
                const profileDoc = await getDoc(profileDocRef);
                if (profileDoc.exists()) {
                    setProfile(profileDoc.data() as Profile);
                }
                
                if (pathname === '/signin' || pathname === '/register') {
                    router.push('/dashboard');
                }

            } else {
                setUser(null);
                setProfile(null);
                if (!isPublicPath) {
                    router.push('/signin');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    const handleLogout = async () => {
        try {
            await firebaseLogout();
            toast({ title: "Logout Successful" });
            router.push('/');
        } catch (error: any) {
             toast({
                title: "Logout Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };
    
    const handleLogin: typeof firebaseLogin = async (email, password) => {
        try {
            const userCredential = await firebaseLogin(email, password);
            toast({ title: "Login Successful", description: "Welcome back!" });
            // The redirect is now handled by onAuthStateChanged
            return userCredential;
        } catch (error: any) {
            let description = "An unexpected error occurred.";
            if (error.code === 'auth/invalid-credential') {
                description = "Invalid email or password. Please try again.";
            } else {
                description = error.message;
            }
             toast({
                title: "Login Failed",
                description: description,
                variant: "destructive"
            });
            throw error;
        }
    }

    const handleRegister: typeof firebaseRegister = async (email, password, fullName, isSeller) => {
        try {
            const userCredential = await firebaseRegister(email, password, fullName, isSeller);
            toast({ title: "Registration Successful", description: "Welcome to Fleaxova!" });
            // The redirect is now handled by onAuthStateChanged
            return userCredential;
        } catch (error: any) {
             let description = "An unexpected error occurred.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already in use. Please log in or use a different email.";
            } else {
                description = error.message;
            }
             toast({
                title: "Registration Failed",
                description: description,
                variant: "destructive"
            });
            throw error;
        }
    }

    const handleRegisterWithGoogle = async (isSeller: boolean) => {
        try {
            const userCredential = await signInWithGoogle();
            const gUser = userCredential.user;

            const profileDocRef = doc(db, "profiles", gUser.uid);
            const profileDoc = await getDoc(profileDocRef);

            if (!profileDoc.exists()) {
                const newProfile: Profile = {
                    id: gUser.uid,
                    fullName: gUser.displayName || 'Google User',
                    email: gUser.email || '',
                    isSeller,
                    rating: 0,
                    reviewsCount: 0,
                    avatarUrl: gUser.photoURL || undefined,
                };
                await setDoc(profileDocRef, newProfile);
                setProfile(newProfile);
            }
            toast({ title: "Registration Successful", description: "Welcome to Fleaxova!" });
            // The redirect is now handled by onAuthStateChanged

        } catch (error: any) {
             toast({
                title: "Registration Failed",
                description: error.message,
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleLoginWithGoogle = async () => {
        try {
            await signInWithGoogle();
            toast({ title: "Login Successful", description: "Welcome back!" });
            // The redirect is now handled by onAuthStateChanged
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
            throw error;
        }
    };


    const value = {
        user,
        profile,
        loading,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
        registerWithGoogle: handleRegisterWithGoogle,
        loginWithGoogle: handleLoginWithGoogle,
    };

    if (!isMounted || loading) {
        return <div className="flex items-center justify-center h-screen bg-background">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
