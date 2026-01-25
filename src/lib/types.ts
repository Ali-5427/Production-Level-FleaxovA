

// Add a new interface for a single portfolio item
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export interface PaymentDetails {
  accountHolderName: string;
  preferredMethod: 'bank' | 'upi';
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  isVerified: boolean;
  addedAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  rejectionReason?: string;
}

// Base user from Firebase Authentication
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Corresponds to the 'users' collection in Firestore
export interface User {
  id: string; // User UID
  fullName: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  walletBalance: number;
  createdAt: any; // Firestore Timestamp
  status: "active" | "suspended";
  title?: string;
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
  portfolio?: PortfolioItem[]; // Use the new interface
  socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
  };
  rating: number; 
  reviewsCount: number;
  paymentDetails?: PaymentDetails;
}


// Corresponds to the 'services' collection
export interface Service {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatarUrl?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTime: number;
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  createdAt: Date;
}

// Corresponds to the 'jobs' collection
export interface Job {
  id: string;
  clientId: string; 
  clientName: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  skills: string[];
  deadline: any; // Can be Date or Firestore Timestamp
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  assignedFreelancerId?: string | null;
  createdAt: any; // Can be Date or Firestore Timestamp
  applicationCount: number;
}

// Corresponds to the 'applications' collection
export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatarUrl?: string;
  coverLetter: string;
  bidAmount: number;
  createdAt: any; // Firestore Timestamp
  status: 'pending' | 'accepted' | 'rejected';
}

// Corresponds to the 'orders' collection
export interface Order {
  id: string;
  title: string;
  imageUrl?: string;
  price: number;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled' | 'disputed' | 'delivered' | 'payment_failed';
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatarUrl?: string;
  participantIds: string[];
  createdAt: any; // Firestore Timestamp
  source: 'service' | 'job';
  sourceId: string; // will be either serviceId or jobId
  paymentId?: string;
  commission?: number;
  freelancerEarning?: number;
}


// Corresponds to the 'reviews' collection
export interface Review {
  id: string;
  serviceId: string; // The service being reviewed
  reviewerId: string; // The user who wrote the review
  reviewerName: string;
  reviewerAvatarUrl?: string;
  revieweeId: string; // The freelancer who owns the service
  rating: number; // 1-5
  comment: string;
  createdAt: any; // Firestore Timestamp
}


// Corresponds to the 'conversations' collection
export interface Conversation {
  id: string;
  participants: string[]; // array of user UIDs
  participantDetails: {
    [uid: string]: {
      fullName: string;
      avatarUrl?: string;
    }
  };
  lastMessageContent: string;
  lastMessageSenderId: string;
  lastUpdatedAt: any; // Firestore Timestamp
  // unread count for each participant, keyed by UID
  unreadCounts: {
    [uid: string]: number;
  };
}

// Corresponds to the 'messages' sub-collection
export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: any; // Firestore Timestamp
}

// Corresponds to the 'notifications' collection
export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: any; // Can be Date or Firestore Timestamp
  link?: string;
}

// Corresponds to the 'withdrawals' collection
export interface Withdrawal {
    id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    paymentDetails: PaymentDetails;
    createdAt: any;
    processedAt?: any;
}
