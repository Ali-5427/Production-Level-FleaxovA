
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile as updateFirebaseProfile,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseAuthUser,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./config";
import { db } from "./firestore";
import type { User } from '../types';
import imageCompression from 'browser-image-compression';

const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export async function register(email: string, password: string, fullName: string, isSeller: boolean) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateFirebaseProfile(user, {
        displayName: fullName,
    });
    
    const userData: User = {
        id: user.uid,
        fullName,
        email,
        role: isSeller ? 'freelancer' : 'client',
        walletBalance: 0,
        createdAt: serverTimestamp(),
        status: 'active',
        rating: 0,
        reviewsCount: 0,
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return userCredential;
}

export async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
    return signOut(auth);
}

export async function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}

export async function updateUserProfile(
    user: FirebaseAuthUser, 
    updates: Partial<User>, 
    newAvatarFile?: File
): Promise<Partial<User>> {
    const userDocRef = doc(db, "users", user.uid);
    let newAvatarUrl: string | undefined = undefined;

    if (newAvatarFile) {
        const options = {
          maxSizeMB: 0.5, // Max file size in MB
          maxWidthOrHeight: 800, // Max width or height in pixels
          useWebWorker: false,
        };

        try {
            const compressedFile = await imageCompression(newAvatarFile, options);
            const avatarPath = `avatars/${user.uid}/${compressedFile.name}`;
            const storageRef = ref(storage, avatarPath);
            const uploadResult = await uploadBytes(storageRef, compressedFile);
            newAvatarUrl = await getDownloadURL(uploadResult.ref);
        } catch (error) {
            console.error('Image compression failed:', error);
            throw new Error("Could not process image. Please try another one.");
        }
    }

    const dataToUpdate: Partial<User> = { ...updates };
    if (newAvatarUrl) {
        dataToUpdate.avatarUrl = newAvatarUrl;
    }

    // Filter out undefined values to avoid overwriting fields in firestore
    Object.keys(dataToUpdate).forEach(key => (dataToUpdate as any)[key] === undefined && delete (dataToUpdate as any)[key]);

    if (Object.keys(dataToUpdate).length > 0) {
        await updateDoc(userDocRef, dataToUpdate);
    }

    const authProfileUpdates: { displayName?: string; photoURL?: string } = {};
    if (dataToUpdate.fullName) {
        authProfileUpdates.displayName = dataToUpdate.fullName;
    }
    if (dataToUpdate.avatarUrl) {
        authProfileUpdates.photoURL = dataToUpdate.avatarUrl;
    }

    if (Object.keys(authProfileUpdates).length > 0) {
        await updateFirebaseProfile(user, authProfileUpdates);
    }
    
    return dataToUpdate;
}
