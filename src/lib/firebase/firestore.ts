
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
  onSnapshot,
  updateDoc,
  getCountFromServer,
  limit,
} from "firebase/firestore";
import { app } from "./config";
import type { Service, Job, User, Application, Review, Conversation, Message, Order } from '../types';

// Initialize Firestore with long-polling enabled to prevent connection issues in some environments
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Services
const servicesCollection = collection(db, 'services');
const ordersCollection = collection(db, 'orders');

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
        const data = docSnap.data();
        return { 
            id: docSnap.id,
             ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as User;
    }
    return null;
}

// --- ORDERS ---
export async function createOrder(service: Service, client: User) {
    if (service.freelancerId === client.id) {
        throw new Error("You cannot order your own service.");
    }
    const seller = await getUser(service.freelancerId);
    if (!seller) {
        throw new Error("Seller not found.");
    }

    const orderData: Omit<Order, 'id' | 'createdAt'> = {
        serviceId: service.id,
        serviceTitle: service.title,
        serviceImageUrl: service.imageUrl || '',
        clientId: client.id,
        clientName: client.fullName,
        clientAvatarUrl: client.avatarUrl || '',
        freelancerId: service.freelancerId,
        freelancerName: seller.fullName,
        freelancerAvatarUrl: seller.avatarUrl || '',
        participantIds: [client.id, service.freelancerId],
        price: service.price,
        // For this non-payment flow, we'll mark it as 'active' immediately.
        // In a real scenario, this would be 'pending_payment'.
        status: 'active', 
    };

    return await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp()
    });
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
    const clientQuery = query(collection(db, 'orders'), where('clientId', '==', userId));
    const freelancerQuery = query(collection(db, 'orders'), where('freelancerId', '==', userId));

    const [clientSnapshot, freelancerSnapshot] = await Promise.all([
        getDocs(clientQuery),
        getDocs(freelancerQuery)
    ]);

    const orders = [
        ...clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)),
        ...freelancerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)),
    ];
    
    // Sort by creation date
    orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    // Convert timestamps
    return orders.map(order => ({
        ...order,
        createdAt: order.createdAt?.toDate ? order.createdAt.toDate() : new Date(),
    }));
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
    const orderRef = doc(db, 'orders', orderId);
    return await updateDoc(orderRef, { status });
}

export async function hasCompletedOrder(userId: string, serviceId: string): Promise<boolean> {
    const q = query(
        collection(db, 'orders'),
        where('clientId', '==', userId),
        where('serviceId', '==', serviceId),
        where('status', '==', 'completed')
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count > 0;
}


// Reviews
const reviewsCollection = collection(db, 'reviews');

export async function getReviewsForService(serviceId: string): Promise<Review[]> {
    const q = query(reviewsCollection, where('serviceId', '==', serviceId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Review;
    });
}

export async function addReviewAndRecalculateRating(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
    const serviceRef = doc(db, 'services', reviewData.serviceId);
    const freelancerRef = doc(db, 'users', reviewData.revieweeId);
    const reviewRef = doc(collection(db, 'reviews'));

    try {
        await runTransaction(db, async (transaction) => {
            const serviceDoc = await transaction.get(serviceRef);
            const freelancerDoc = await transaction.get(freelancerRef);

            if (!serviceDoc.exists() || !freelancerDoc.exists()) {
                throw new Error("Service or Freelancer not found!");
            }

            const serviceData = serviceDoc.data() as Service;
            const freelancerData = freelancerDoc.data() as User;
            
            // Recalculate service rating
            const serviceOldRating = serviceData.rating || 0;
            const serviceOldCount = serviceData.reviewsCount || 0;
            const serviceNewCount = serviceOldCount + 1;
            const serviceNewRating = ((serviceOldRating * serviceOldCount) + reviewData.rating) / serviceNewCount;

            // Recalculate freelancer's overall rating
            const freelancerOldRating = freelancerData.rating || 0;
            const freelancerOldCount = freelancerData.reviewsCount || 0;
            const freelancerNewCount = freelancerOldCount + 1;
            const freelancerNewRating = ((freelancerOldRating * freelancerOldCount) + reviewData.rating) / freelancerNewCount;
            
            // 1. Create the new review
            transaction.set(reviewRef, { ...reviewData, createdAt: serverTimestamp() });
            
            // 2. Update the service
            transaction.update(serviceRef, { rating: serviceNewRating, reviewsCount: serviceNewCount });

            // 3. Update the freelancer's profile
            transaction.update(freelancerRef, { rating: freelancerNewRating, reviewsCount: freelancerNewCount });
        });
    } catch (e) {
        console.error("Review transaction failed: ", e);
        throw e; // Re-throw the error to be caught by the calling component
    }
}


// --- MESSAGING ---

// Contact-prevention regex
const CONTACT_INFO_REGEX = {
    email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    phone: /(?:\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    social: /(^|[^@\w])@(\w{1,15})\b/,
};

function containsContactInfo(text: string): boolean {
    return CONTACT_INFO_REGEX.email.test(text) || 
           CONTACT_INFO_REGEX.phone.test(text) ||
           CONTACT_INFO_REGEX.social.test(text);
}


export function getConversationsListener(
  userId: string, 
  callback: (conversations: Conversation[]) => void
) {
  const q = query(
    collection(db, 'conversations'), 
    where('participants', 'array-contains', userId),
    orderBy('lastUpdatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastUpdatedAt: doc.data().lastUpdatedAt?.toDate(),
    } as Conversation));
    callback(conversations);
  }, (error) => {
      console.error("Conversation listener error: ", error);
  });
}

export function getMessagesListener(
  conversationId: string, 
  callback: (messages: Message[]) => void
) {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    } as Message));
    callback(messages);
  }, (error) => {
      console.error("Message listener error: ", error);
  });
}


export async function sendMessage({
    conversationId,
    senderId,
    content,
}: {
    conversationId: string;
    senderId: string;
    content: string;
}) {
    if (containsContactInfo(content)) {
        throw new Error("Message blocked: Please do not share contact information.");
    }
    
    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');
    const newMessageRef = doc(messagesRef); // Create a ref for the new message

    const conversationSnap = await getDoc(conversationRef);
    if (!conversationSnap.exists()) {
        throw new Error("Conversation not found.");
    }
    const conversationData = conversationSnap.data() as Conversation;
    const unreadCounts = conversationData.unreadCounts || {};

    // Increment unread count for all other participants
    conversationData.participants.forEach(participantId => {
        if (participantId !== senderId) {
            unreadCounts[participantId] = (unreadCounts[participantId] || 0) + 1;
        }
    });

    const batch = writeBatch(db);

    // 1. Set the new message
    batch.set(newMessageRef, {
        senderId,
        content,
        createdAt: serverTimestamp(),
    });

    // 2. Update the parent conversation
    batch.update(conversationRef, {
        lastMessageContent: content,
        lastMessageSenderId: senderId,
        lastUpdatedAt: serverTimestamp(),
        unreadCounts: unreadCounts,
    });
    
    await batch.commit();
}

export async function markConversationAsRead(conversationId: string, userId: string) {
    const conversationRef = doc(db, 'conversations', conversationId);
    const fieldToUpdate = `unreadCounts.${userId}`;
    
    try {
        await updateDoc(conversationRef, {
            [fieldToUpdate]: 0
        });
    } catch (error) {
        console.error("Failed to mark conversation as read:", error);
    }
}


// --- DASHBOARD FUNCTIONS ---
export async function getFreelancerDashboardData(userId: string) {
    const servicesQuery = query(servicesCollection, where('freelancerId', '==', userId));
    const ordersQuery = query(ordersCollection, where('freelancerId', '==', userId));
    const recentOrdersQuery = query(ordersCollection, where('freelancerId', '==', userId), orderBy('createdAt', 'desc'), limit(5));

    const [servicesSnapshot, ordersSnapshot, recentOrdersSnapshot] = await Promise.all([
        getCountFromServer(servicesQuery),
        getDocs(ordersQuery),
        getDocs(recentOrdersQuery)
    ]);

    const totalServices = servicesSnapshot.data().count;
    const activeOrders = ordersSnapshot.docs.filter(doc => doc.data().status === 'active').length;
    const totalEarnings = ordersSnapshot.docs.reduce((sum, doc) => sum + doc.data().price, 0);

    const recentOrders = recentOrdersSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Order));

    return { totalServices, activeOrders, totalEarnings, recentOrders };
}

export async function getClientDashboardData(userId: string) {
    const jobsQuery = query(jobsCollection, where('clientId', '==', userId));
    const ordersQuery = query(ordersCollection, where('clientId', '==', userId));
    const recentOrdersQuery = query(ordersCollection, where('clientId', '==', userId), orderBy('createdAt', 'desc'), limit(5));

    const [jobsSnapshot, ordersSnapshot, recentOrdersSnapshot] = await Promise.all([
        getCountFromServer(jobsQuery),
        getDocs(ordersQuery),
        getDocs(recentOrdersQuery)
    ]);

    const totalJobs = jobsSnapshot.data().count;
    const activeOrders = ordersSnapshot.docs.filter(doc => doc.data().status === 'active').length;

    const recentOrders = recentOrdersSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Order));

    return { totalJobs, activeOrders, recentOrders };
}


// --- ADMIN FUNCTIONS ---

export async function getAdminDashboardStats() {
    const usersCol = collection(db, 'users');
    const servicesCol = collection(db, 'services');
    const jobsCol = collection(db, 'jobs');

    const [usersSnapshot, servicesSnapshot, jobsSnapshot] = await Promise.all([
        getCountFromServer(usersCol),
        getCountFromServer(servicesCol),
        getCountFromServer(jobsCol),
    ]);

    return {
        totalUsers: usersSnapshot.data().count,
        totalServices: servicesSnapshot.data().count,
        totalJobs: jobsSnapshot.data().count,
        // Placeholders, as per plan
        totalRevenue: 12350, 
        pendingWithdrawals: 0,
    };
}

export async function getAllUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as User;
    });
}

export function getUsersListener(callback: (users: User[]) => void) {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as User;
        });
        callback(users);
    }, (error) => {
        console.error("Failed to listen for user updates:", error);
    });

    return unsubscribe;
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status });
}


export { db };
