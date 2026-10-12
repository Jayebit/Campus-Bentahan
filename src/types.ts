export type UserRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  universityEmail: string;
  studentEmployeeId?: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  college?: string;
  yearLevel?: string;
  profilePictureUrl?: string;
  isVerified: boolean;
  verificationBadge: string;
  isSuspended: boolean;
  reputationRating: number;
  totalReviews: number;
  completedTransactions: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  college: string;
}

export type ParentCategoryGroup = 'Academic' | 'Electronics' | 'Personal' | 'Dormitory' | 'Organization' | 'Others';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentGroup: ParentCategoryGroup;
  description: string;
  iconName: string;
  itemCount: number;
}

export interface MeetupLocation {
  id: string;
  name: string;
  campusZone: string;
  description: string;
  safetyNotes: string;
  isActive: boolean;
}

export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED' | 'REMOVED';

export interface Listing {
  id: string;
  sellerId: string;
  sellerName?: string;
  sellerRole?: string;
  sellerDepartment?: string;
  sellerRating?: number;
  sellerCompletedCount?: number;
  sellerAvatar?: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  condition: ListingCondition;
  quantity: number;
  status: ListingStatus;
  isNegotiable: boolean;
  brand?: string;
  model?: string;
  itemYear?: string;
  originalPrice?: number;
  purchaseDate?: string;
  additionalNotes?: string;
  preferredMeetupId?: string;
  preferredMeetupName?: string;
  campusZone?: string;
  images: string[];
  viewCount: number;
  favoritesCount: number;
  offersCount: number;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  offerId?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId?: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImage?: string;
  listingStatus?: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  lastMessageText: string;
  lastMessageAt: string;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'CANCELLED';

export interface Offer {
  id: string;
  listingId: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImage?: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerName: string;
  offeredPrice: number;
  counterPrice?: number;
  status: OfferStatus;
  buyerNote?: string;
  sellerNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 'PENDING' | 'RESERVED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Transaction {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  offerId?: string;
  agreedPrice: number;
  meetupLocationId: string;
  meetupLocationName: string;
  scheduledDate: string;
  status: TransactionStatus;
  notes?: string;
  buyerConfirmedCompletion?: boolean;
  sellerConfirmedCompletion?: boolean;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewedUserId: string;
  listingId?: string;
  listingTitle?: string;
  rating: number;
  communicationRating: number;
  itemAccuracyRating: number;
  meetupRating: number;
  comment: string;
  createdAt: string;
}

export type ReportReason =
  | 'Scam / Fraud'
  | 'Prohibited Item'
  | 'Counterfeit Item'
  | 'Misleading Description'
  | 'Inappropriate Content'
  | 'Suspicious Behavior'
  | 'Harassment'
  | 'Other';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId?: string;
  reportedUserName?: string;
  listingId?: string;
  listingTitle?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type LookingForStatus = 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';

export interface LookingForPost {
  id: string;
  authorId: string;
  authorName: string;
  authorDepartment?: string;
  authorAvatar?: string;
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  minBudget?: number;
  maxBudget?: number;
  preferredMeetupName?: string;
  status: LookingForStatus;
  responseCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AdminAnalytics {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalListings: number;
    activeListings: number;
    reservedListings: number;
    soldListings: number;
    completedTxns: number;
    totalVolume: number;
    pendingReports: number;
  };
  categoryStats: { name: string; count: number }[];
  demandInsights: {
    term: string;
    queryCount: number;
    category: string;
    demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}
