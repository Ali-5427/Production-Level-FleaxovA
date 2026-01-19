
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseAuthUser | null>(null);
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        // This listener handles auth state changes
        const authListenerUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is signed in, fetch their profile document
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(userDocRef);
            
            setUser(firebaseUser); // Set the Firebase user object
            if (docSnap.exists()) {
                setProfile(docSnap.data() as User); // Set the Firestore profile
            } else {
                // This might happen if the user record isn't created yet during registration.
                setProfile(null);
            }
          } else {
            // User is signed out
            setUser(null);
            setProfile(null);
          }
          // Once auth state is determined and profile is fetched, stop loading.
          setLoading(false);
        });
    
        // Cleanup the listener when the component unmounts
        return () => {
          authListenerUnsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // This effect handles route protection and redirection logic
    useEffect(() => {
        if (loading) return; // Don't run routing logic until auth state is determined

        const publicOnlyPaths = ['/signin', '/register'];
        const isAuthPage = publicOnlyPaths.includes(pathname);
        const isAdminPath = pathname.startsWith('/admin');
        const isDashboardPath = pathname.startsWith('/dashboard');

        if (user && profile) {
            // User is logged in with a profile
            const targetDashboard = profile.role === 'admin' ? '/admin' : '/dashboard';

            if (isAuthPage) {
                router.push(targetDashboard);
                return;
            }

            if (profile.role === 'admin' && isDashboardPath) {
                router.push('/admin');
                return;
            }
            
            if (profile.role !== 'admin' && isAdminPath) {
                router.push('/dashboard');
                return;
            }

        } else if (!user) {
            // User is not logged in, protect routes
            if (isDashboardPath || isAdminPath) {
                router.push('/signin');
            }
        }
    }, [user, profile, loading, pathname, router, toast]);

    const handleLogin = async (email: string, password: string) => {
        try {
            await firebaseLogin(email, password);
            toast({ title: "Login Successful", description: "Welcome back!" });
            // Redirection is handled by the useEffect hook
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

    const handleRegister = async (email: string, password: string, fullName: string, isSeller: boolean) => {
        try {
            await firebaseRegister(email, password, fullName, isSeller);
            toast({ title: "Registration Successful", description: "Welcome to Fleaxova!" });
             // Redirection is handled by the useEffect hook
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

    const handleRegisterWithGoogle = async (isSeller: boolean) => {
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
                    rating: 0,
                    reviewsCount: 0,
                    walletBalance: 0,
                    createdAt: serverTimestamp(),
                    status: 'active',
                };
                await setDoc(userDocRef, newUser);
                setProfile(newUser);
            }
            toast({ title: "Registration Successful", description: "Welcome to Fleaxova!" });
            // Redirection is handled by the useEffect hook

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
            // Redirection is handled by the useEffect hook
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
            throw error;
        }
    };

    const handleUpdateProfile = async (updates: Partial<User>, newAvatarFile?: File) => {
        if (!user || !profile) {
            toast({ title: "Update Failed", description: "You must be logged in to update your profile.", variant: "destructive" });
            throw new Error("User not authenticated");
        }
        try {
            const updatedProfileFields = await updateUserProfile(user, updates, newAvatarFile);
            
            setProfile(prevProfile => ({ ...prevProfile!, ...updatedProfileFields }));
            setUser(auth.currentUser); // Refresh user to get new photoURL
            
            toast({ title: "Profile Updated", description: "Your changes have been saved." });
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update profile.",
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
        loginWithGoogle: handleLoginWithGoogle,
        updateProfile: handleUpdateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
