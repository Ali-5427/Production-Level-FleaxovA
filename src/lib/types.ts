// Base user from Firebase Authentication
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Corresponds to the 'profiles' collection
export interface Profile {
  id: string; // Corresponds to User UID
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  isSeller: boolean;
  rating: number;
  reviewsCount: number;
}

// Corresponds to the 'services' collection
export interface Service {
  id: string;
  sellerId: string; // FK to profiles collection
  title: string;
  description: string;
  price: number; // Constraint: >= 100 will be handled in application logic
  category: string;
  tags?: string[];
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
}

// Corresponds to the 'jobs' collection
export interface Job {
  id: string;
  clientId: string; // FK to profiles collection
  title: string;
  description: string;
  budget: number;
  skills: string[];
  createdAt: Date;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
}

// Corresponds to the 'applications' collection
export interface Application {
  id: string;
  jobId: string; // FK to jobs collection
  freelancerId: string; // FK to profiles collection
  proposal: string;
  price: number;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

// Corresponds to the 'orders' collection
export interface Order {
  id: string;
  serviceId: string; // FK to services collection
  buyerId: string; // FK to profiles collection
  sellerId: string; // FK to profiles collection
  price: number;
  createdAt: Date;
  status: 'pending' | 'in-progress' | 'delivered' | 'completed' | 'disputed';
}

// Corresponds to the 'reviews' collection
export interface Review {
  id: string;
  orderId?: string; // FK to orders collection
  jobId?: string; // FK to jobs collection
  reviewerId: string; // FK to profiles collection
  revieweeId: string; // FK to profiles collection
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  type: 'service' | 'job';
}

// Corresponds to the 'messages' collection
export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // FK to profiles collection
  receiverId: string; // FK to profiles collection
  text: string;
  createdAt: Date;
}

// Corresponds to the 'notifications' collection
export interface Notification {
  id: string;
  userId: string; // FK to profiles collection
  message: string;
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

// Corresponds to the 'withdrawals' collection
export interface Withdrawal {
    id: string;
    userId: string; // FK to profiles collection
    amount: number;
    method: string; // e.g., 'PayPal', 'Bank Transfer'
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
}
