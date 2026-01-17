
import { 
  initializeFirestore,
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  where,
  deleteDoc,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import { app } from "./config";
import type { Service, Job, User, Application } from '../types';

// Initialize Firestore with long-polling enabled to prevent connection issues in some environments
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Services
const servicesCollection = collection(db, 'services');

export async function createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'rating' | 'reviewsCount' | 'freelancerName' | 'freelancerAvatarUrl'>) {
    const sellerProfile = await getUser(serviceData.freelancerId);
    if (!sellerProfile) {
        throw new Error("Could not find seller profile to create service.");
    }
    return await addDoc(servicesCollection, {
        ...serviceData,
        freelancerName: sellerProfile.fullName || "Unnamed Seller",
        freelancerAvatarUrl: sellerProfile.avatarUrl || "",
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

export async function getServicesByFreelancer(freelancerId: string): Promise<Service[]> {
    const q = query(servicesCollection, where('freelancerId', '==', freelancerId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      } as Service;
    });
}

export async function deleteService(serviceId: string): Promise<void> {
    const docRef = doc(db, 'services', serviceId);
    await deleteDoc(docRef);
}


// Jobs
const jobsCollection = collection(db, 'jobs');
const applicationsCollection = collection(db, 'applications');

export async function createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'status' | 'applicationCount'>) {
    return await addDoc(jobsCollection, {
        ...jobData,
        status: 'open',
        applicationCount: 0,
        createdAt: serverTimestamp()
    });
}

export async function getJobs(): Promise<Job[]> {
    const q = query(jobsCollection, where('status', '==', 'open'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
       const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        deadline: data.deadline?.toDate ? data.deadline.toDate() : new Date(),
      } as Job;
    });
}

export async function getJobById(id: string): Promise<Job | null> {
    const docRef = doc(db, 'jobs', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            deadline: data.deadline?.toDate ? data.deadline.toDate() : new Date(),
        } as Job;
    } else {
        return null;
    }
}

export async function getJobsByClient(clientId: string): Promise<Job[]> {
    const q = query(jobsCollection, where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        deadline: data.deadline?.toDate ? data.deadline.toDate() : new Date(),
      } as Job;
    });
}


// Applications
export async function applyToJob(appData: Omit<Application, 'id' | 'createdAt' | 'status'>) {
    const jobRef = doc(db, 'jobs', appData.jobId);
    const appRef = doc(collection(db, 'applications'));

    return runTransaction(db, async (transaction) => {
        const jobDoc = await transaction.get(jobRef);
        if (!jobDoc.exists()) {
            throw "Job does not exist!";
        }
        
        const newApplicationCount = (jobDoc.data().applicationCount || 0) + 1;
        
        transaction.update(jobRef, { applicationCount: newApplicationCount });

        transaction.set(appRef, {
             ...appData,
            status: 'pending',
            createdAt: serverTimestamp()
        });
    });
}

export async function getApplicationsForJob(jobId: string): Promise<Application[]> {
    const q = query(applicationsCollection, where('jobId', '==', jobId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
}

export async function getApplicationsByFreelancer(freelancerId: string): Promise<Application[]> {
    const q = query(applicationsCollection, where('freelancerId', '==', freelancerId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
       const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      } as Application;
    });
}

export async function acceptApplication(applicationId: string, jobId: string, freelancerId: string) {
    const batch = writeBatch(db);

    // 1. Update the job
    const jobRef = doc(db, 'jobs', jobId);
    batch.update(jobRef, { status: 'assigned', assignedFreelancerId: freelancerId });
    
    // 2. Accept the winning application
    const acceptedAppRef = doc(db, 'applications', applicationId);
    batch.update(acceptedAppRef, { status: 'accepted' });

    // 3. Reject other pending applications for this job
    const otherAppsQuery = query(applicationsCollection, where('jobId', '==', jobId), where('status', '==', 'pending'));
    const otherAppsSnapshot = await getDocs(otherAppsQuery);
    otherAppsSnapshot.forEach(doc => {
        if (doc.id !== applicationId) {
            batch.update(doc.ref, { status: 'rejected' });
        }
    });

    await batch.commit();
}


// Users
export async function getUser(userId: string): Promise<User | null> {
    if (!userId) return null;
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as User;
    }
    return null;
}


export { db };
