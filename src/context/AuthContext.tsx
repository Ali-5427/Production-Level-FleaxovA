
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User as FirebaseAuthUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
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
    login: typeof firebaseLogin;
    logout: () => Promise<void>;
    register: typeof firebaseRegister;
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
        let profileListenerUnsubscribe: (() => void) | null = null;
    
        const authListenerUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (profileListenerUnsubscribe) {
            profileListenerUnsubscribe(); // Clean up old profile listener
          }
    
          if (firebaseUser) {
            setUser(firebaseUser);
            // setLoading(true) is important here to wait for profile
            setLoading(true); 
            profileListenerUnsubscribe = onSnapshot(
              doc(db, 'users', firebaseUser.uid),
              (doc) => {
                setProfile(doc.exists() ? (doc.data() as User) : null);
                setLoading(false);
              },
              (error) => {
                console.error("Error listening to profile:", error);
                setProfile(null);
                setLoading(false);
              }
            );
          } else {
            // No user, clear state
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        });
    
        return () => {
          authListenerUnsubscribe();
          if (profileListenerUnsubscribe) {
            profileListenerUnsubscribe();
          }
        };
      }, []);
    
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
    
    useEffect(() => {
        if (loading) return;

        const publicOnlyPaths = ['/signin', '/register'];
        const isAuthPage = publicOnlyPaths.includes(pathname);
        const isAdminPath = pathname.startsWith('/admin');
        const isDashboardPath = pathname.startsWith('/dashboard');

        if (user && profile) {
            // User is logged in with a profile
            const targetDashboard = profile.role === 'admin' ? '/admin' : '/dashboard';

            // 1. If user is on a login/register page, redirect them to their correct dashboard
            if (isAuthPage) {
                router.push(targetDashboard);
                return;
            }

            // 2. If an admin lands on any regular user dashboard page, redirect to the admin dashboard
            if (profile.role === 'admin' && isDashboardPath) {
                router.push('/admin');
                return;
            }
            
            // 3. If a regular user lands on any admin page, redirect them to the regular dashboard
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
        // The case where (user && !profile) is now implicitly handled. 
        // The app will show a loading state until the profile listener resolves, 
        // which fixes the registration race condition.
    }, [user, profile, loading, pathname, router, toast]);

    const handleLogin: typeof firebaseLogin = async (email, password) => {
        try {
            const userCredential = await firebaseLogin(email, password);
            toast({ title: "Login Successful", description: "Welcome back!" });
            // Redirection is now handled by the useEffect hook
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
        }
    }

    const handleRegister: typeof firebaseRegister = async (email, password, fullName, isSeller) => {
        try {
            const userCredential = await firebaseRegister(email, password, fullName, isSeller);
            toast({ title: "Registration Successful", description: "Welcome to Fleaxova!" });
             // Redirection is now handled by the useEffect hook
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
        }
    }

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
            // Redirection is now handled by the useEffect hook

        } catch (error: any) {
             toast({
                title: "Registration Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleLoginWithGoogle = async () => {
        try {
            await signInWithGoogle();
            toast({ title: "Login Successful", description: "Welcome back!" });
            // Redirection is now handled by the useEffect hook
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
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
