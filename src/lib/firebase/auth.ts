
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile as updateFirebaseProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "./config";

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export async function register(email: string, password: string, fullName: string, isSeller: boolean) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateFirebaseProfile(user, {
        displayName: fullName,
    });
    
    const profileData = {
        id: user.uid,
        fullName,
        email,
        isSeller,
        rating: 0,
        reviewsCount: 0,
    };

    await setDoc(doc(db, "profiles", user.uid), profileData);

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
