
// Base user from Firebase Authentication
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Corresponds to the 'users' collection in Firestore
export interface UserAccount {
  id: string; // User UID
  name: string;
  email: string;
  role: "student" | "client" | "admin";
  walletBalance: number;
  createdAt: Date;
  status: "active" | "suspended";
}

// Corresponds to the 'profiles' collection
export interface Profile {
  id: string; // User UID
  fullName: string;
  email: string;
  isSeller: boolean;
  title?: string;
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
  portfolio?: {
      title: string;
      description: string;
      url: string;
      imageUrl?: string;
  }[];
  socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
  };
  rating: number; 
  reviewsCount: number;
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
  title: string;
  description: string;
  category: string;
  budget: number;
  skills: string[];
  deadline: Date;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  assignedFreelancerId?: string | null;
  createdAt: Date;
}

// Corresponds to the 'applications' collection
export interface Application {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: number;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

// Corresponds to the 'orders' collection
export interface Order {
  id: string;
  serviceId: string;
  clientId: string;
  freelancerId: string;
  price: number;
  createdAt: Date;
  paymentId?: string;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled' | 'disputed' | 'delivered';
}

// Corresponds to the 'reviews' collection
export interface Review {
  id: string;
  serviceId?: string;
  jobId?: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  type: 'service' | 'job';
}

// Corresponds to the 'messages' collection
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

// Corresponds to the 'notifications' collection
export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

// Corresponds to the 'withdrawals' collection
export interface Withdrawal {
    id: string;
    userId: string;
    amount: number;
    method: string; // e.g., 'PayPal', 'Bank Transfer'
    status: 'pending' | 'approved' | 'rejected';
    paymentDetails: object,
    createdAt: Date;
    completedAt?: Date;
}
