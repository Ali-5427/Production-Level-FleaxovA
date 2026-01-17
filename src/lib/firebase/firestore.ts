
import { 
  initializeFirestore,
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc
} from "firebase/firestore";
import { app } from "./config";
import type { Service, Job, Profile } from '../types';

// Initialize Firestore with long-polling enabled to prevent connection issues in some environments
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Services
const servicesCollection = collection(db, 'services');

export async function createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>) {
    return await addDoc(servicesCollection, {
        ...serviceData,
        rating: 0,
        reviewsCount: 0,
        createdAt: serverTimestamp()
    });
}

export async function getServices(): Promise<Service[]> {
    const q = query(servicesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Convert Firestore Timestamp to JS Date
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      } as Service;
    });
}

export async function getServiceById(id: string): Promise<Service | null> {
    const docRef = doc(db, 'services', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Service;
    } else {
        return null;
    }
}

// Jobs
const jobsCollection = collection(db, 'jobs');

export async function createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'status'>) {
    return await addDoc(jobsCollection, {
        ...jobData,
        status: 'open',
        createdAt: serverTimestamp()
    });
}

export async function getJobs(): Promise<Job[]> {
    const q = query(jobsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
       const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      } as Job;
    });
}

// Profiles
export async function getProfile(userId: string): Promise<Profile | null> {
    if (!userId) return null;
    const profileDocRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(profileDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as Profile;
    }
    return null;
}


export { db };
