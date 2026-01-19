
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User as FirebaseAuthUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from '@/lib/firebase/config';
import { db } from '@/lib/firebase/firestore';
import { 
    login as firebaseLogin, 
    logout as firebaseLogout, 
    register as firebaseRegister,
    signInWithGoogle,
    updateUserProfile
} from '@/lib/firebase/auth';
import type { User } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

// Define the shape of the context data
interface AuthContextType {
    user: FirebaseAuthUser | null;
    profile: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, fullName: string, isSeller: boolean) => Promise<void>;
    registerWithGoogle: (isSeller: boolean) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    updateProfile: (updates: Partial<User>, newAvatarFile?: File) => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseAuthUser | null>(null);
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    // Central listener for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await getDoc(userDocRef);
                
                setUser(firebaseUser);
                if (docSnap.exists()) {
                    setProfile(docSnap.data() as User);
                } else {
                    setProfile(null);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
        });

        return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Effect for handling redirection logic and success toasts
    useEffect(() => {
        if (loading || isInitialLoad) return;

        const publicOnlyPaths = ['/signin', '/register'];
        const isAuthPage = publicOnlyPaths.includes(pathname);

        if (user && profile) {
            const targetDashboard = profile.role === 'admin' ? '/admin' : '/dashboard';
            
            if (isAuthPage) {
                toast({ title: "Success!", description: "You are now logged in." });
                router.push(targetDashboard);
            }
        } else if (!user) {
            if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
                router.push('/signin');
            }
        }
    }, [user, profile, loading, isInitialLoad, pathname, router, toast]);

    const handleLogin = async (email: string, password: string) => {
        try {
            await firebaseLogin(email, password);
        } catch (error: any) {
            const description = error.code === 'auth/invalid-credential'
                ? "Invalid email or password. Please try again."
                : error.message;
            toast({ title: "Login Failed", description, variant: "destructive" });
            throw error;
        }
    };

    const handleRegister = async (email: string, password: string, fullName: string, isSeller: boolean) => {
        try {
            await firebaseRegister(email, password, fullName, isSeller);
        } catch (error: any) {
            const description = error.code === 'auth/email-already-in-use'
                ? "This email is already in use. Please log in or use a different email."
                : error.message;
            toast({ title: "Registration Failed", description, variant: "destructive" });
            throw error;
        }
    };

    const handleLogout = async () => {
        setUser(null);
        setProfile(null);
        await firebaseLogout();
        router.push('/');
        toast({ title: "Logout Successful" });
    };
    
    const handleGoogleAuth = async (isRegister: boolean, isSeller?: boolean) => {
        try {
            const userCredential = await signInWithGoogle();
            const gUser = userCredential.user;
            
            const userDocRef = doc(db, "users", gUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const newUser: User = {
                    id: gUser.uid,
                    fullName: gUser.displayName || 'Google User',
                    email: gUser.email || '',
                    role: gUser.email === 'admin@fleaxova.com' ? 'admin' : (isSeller ? 'freelancer' : 'client'),
                    avatarUrl: gUser.photoURL || undefined,
                    rating: 0, reviewsCount: 0, walletBalance: 0,
                    createdAt: serverTimestamp(), status: 'active',
                };
                await setDoc(userDocRef, newUser);
            }
        } catch (error: any) {
            toast({ title: isRegister ? "Registration Failed" : "Login Failed", description: error.message, variant: "destructive" });
            throw error;
        }
    };

    const handleRegisterWithGoogle = (isSeller: boolean) => handleGoogleAuth(true, isSeller);
    const handleLoginWithGoogle = () => handleGoogleAuth(false);

    const handleUpdateProfile = async (updates: Partial<User>, newAvatarFile?: File) => {
        if (!user) throw new Error("User not authenticated");
        try {
            const updatedProfileFields = await updateUserProfile(user, updates, newAvatarFile);
            setProfile(prevProfile => prevProfile ? { ...prevProfile, ...updatedProfileFields } : null);
            setUser(auth.currentUser);
            toast({ title: "Profile Updated", description: "Your changes have been saved." });
        } catch (error: any) {
            toast({ title: "Update Failed", description: error.message || "Could not update profile.", variant: "destructive" });
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
        updateProfile: handleUpdateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
