
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
            const publicPaths = ['/', '/login', '/register'];
            const isPublicPath = publicPaths.some(p => p === pathname) || pathname.startsWith('/services') || pathname.startsWith('/jobs');

            if (firebaseUser) {
                setUser(firebaseUser);
                const profileDocRef = doc(db, "profiles", firebaseUser.uid);
                const profileDoc = await getDoc(profileDocRef);
                if (profileDoc.exists()) {
                    setProfile(profileDoc.data() as Profile);
                }
                
                if ((pathname === '/login' || pathname === '/register') && profileDoc.exists()) {
                    router.push('/dashboard');
                }

            } else {
                setUser(null);
                setProfile(null);
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
            router.push('/dashboard');

        } catch (error: any) {
             toast({
                title: "Registration Failed",
                description: error.message,
                variant: "destructive"
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
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div className="flex items-center justify-center h-screen">Loading...</div> : children}
        </AuthContext.Provider>
    );
};
