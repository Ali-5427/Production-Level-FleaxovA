
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User as FirebaseAuthUser, signOut } from "firebase/auth";
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
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    // Central listener for auth state changes. This is the single source of truth.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                // User is signed in to Firebase Auth, now get our profile from Firestore
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const docSnap = await getDoc(userDocRef);
                    
                    setUser(firebaseUser);
                    if (docSnap.exists()) {
                        setProfile(docSnap.data() as User);
                    } else {
                        // This can happen briefly during registration.
                        setProfile(null);
                    }
                } catch (error) {
                    console.error("AuthContext: Error fetching user profile", error);
                    toast({ title: "Error", description: "Could not load user profile.", variant: "destructive" });
                    setUser(firebaseUser); // Keep auth state
                    setProfile(null); // But clear profile
                }
            } else {
                // User is signed out
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]); // toast is stable and safe as a dependency.

    // This separate effect handles all route protection and redirection logic.
    // It runs only when the authentication state has been fully determined.
    useEffect(() => {
        if (loading) return;

        const publicOnlyPaths = ['/signin', '/register'];
        const isAuthPage = publicOnlyPaths.includes(pathname);

        if (user && profile) {
            // User is fully logged in with a profile
            const targetDashboard = profile.role === 'admin' ? '/admin' : '/dashboard';
            if (isAuthPage) {
                toast({ title: "Success!", description: "You are now logged in." });
                router.push(targetDashboard);
            }
        } else if (!user) {
            // User is not logged in at all
            if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
                router.push('/signin');
            }
        }
    }, [user, profile, loading, pathname, router]); // `toast` is intentionally omitted to prevent re-runs


    const handleLogin = async (email: string, password: string) => {
        try {
            await firebaseLogin(email, password);
            // onAuthStateChanged will handle state updates and redirection.
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
            // onAuthStateChanged will handle state updates and redirection.
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
    
    const handleGoogleAuth = async (isRegister: boolean, isSellerRole?: boolean) => {
        try {
            const userCredential = await signInWithGoogle();
            const gUser = userCredential.user;
            
            const userDocRef = doc(db, "users", gUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                if (isRegister) {
                    const newUser: User = {
                        id: gUser.uid,
                        fullName: gUser.displayName || 'Google User',
                        email: gUser.email || '',
                        role: gUser.email === 'admin@fleaxova.com' ? 'admin' : (isSellerRole ? 'freelancer' : 'client'),
                        avatarUrl: gUser.photoURL || undefined,
                        rating: 0, reviewsCount: 0, walletBalance: 0,
                        createdAt: serverTimestamp(), status: 'active',
                    };
                    await setDoc(userDocRef, newUser);
                } else {
                    await signOut(auth);
                    throw new Error("No account found with this Google account. Please register first.");
                }
            }
        } catch (error: any) {
            const flowType = isRegister ? "Registration" : "Login";
            toast({ title: `${flowType} Failed`, description: error.message, variant: "destructive" });
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
