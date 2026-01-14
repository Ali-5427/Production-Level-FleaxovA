
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from '@/lib/firebase/config';
import { login as firebaseLogin, logout as firebaseLogout, register as firebaseRegister } from '@/lib/firebase/auth';
import type { Profile } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    login: typeof firebaseLogin;
    logout: () => Promise<void>;
    register: typeof firebaseRegister;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const db = getFirestore(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const profileDocRef = doc(db, "profiles", firebaseUser.uid);
                const profileDoc = await getDoc(profileDocRef);
                if (profileDoc.exists()) {
                    setProfile(profileDoc.data() as Profile);
                } else {
                    // If profile doesn't exist (e.g. social sign-in), create a basic one
                    const newProfile: Profile = {
                        id: firebaseUser.uid,
                        fullName: firebaseUser.displayName || 'New User',
                        email: firebaseUser.email || '',
                        isSeller: false,
                        rating: 0,
                        reviewsCount: 0,
                    };
                    await setDoc(profileDocRef, newProfile);
                    setProfile(newProfile);
                }
            } else {
                setUser(null);
                setProfile(null);
                 // Redirect to login if not authenticated and not on a public page
                const publicPaths = ['/', '/login', '/register', '/services', '/jobs'];
                const isPublicPath = publicPaths.some(path => pathname.startsWith(path) && path.length === pathname.length) || pathname.startsWith('/services/') || pathname.startsWith('/jobs/');

                if (!isPublicPath) {
                    router.push('/login');
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
            router.push('/dashboard');
            return userCredential;
        } catch (error: any) {
             toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive"
            });
            throw error;
        }
    }

    const handleRegister: typeof firebaseRegister = async (email, password, fullName, isSeller) => {
        try {
            const userCredential = await firebaseRegister(email, password, fullName, isSeller);
            toast({ title: "Registration Successful", description: "Welcome to Fleaxova!" });
            router.push('/dashboard');
            return userCredential;
        } catch (error: any) {
             toast({
                title: "Registration Failed",
                description: error.message,
                variant: "destructive"
            });
            throw error;
        }
    }


    const value = {
        user,
        profile,
        loading,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div className="flex items-center justify-center h-screen">Loading...</div> : children}
        </AuthContext.Provider>
    );
};
