import {
  User,
  Department,
  Category,
  MeetupLocation,
  Listing,
  Conversation,
  Message,
  Offer,
  Transaction,
  Review,
  Report,
  LookingForPost,
  Notification,
  AuditLog,
  AdminAnalytics,
} from './types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('campus_bentahan_token') || localStorage.getItem('campus_market_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Network error occurred');
  }
  return data as T;
}

export const api = {
  // Auth
  async register(body: any): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async login(universityEmail: string, password: string): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universityEmail, password }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async switchDemoUser(userId: string): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/switch-demo-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  async updateProfile(data: any): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Reference data
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    return handleResponse(res);
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },

  async getMeetupLocations(): Promise<MeetupLocation[]> {
    const res = await fetch(`${API_BASE}/meetup-locations`);
    return handleResponse(res);
  },

  // Listings
  async getListings(params?: Record<string, string | number | boolean | undefined>): Promise<Listing[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/listings?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getListingById(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createListing(data: any): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateListing(id: string, data: any): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateListingStatus(id: string, status: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async deleteListing(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Favorites
  async getFavorites(): Promise<Listing[]> {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async addFavorite(listingId: string): Promise<{ favorited: boolean; favoritesCount: number }> {
    const res = await fetch(`${API_BASE}/listings/${listingId}/favorite`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async removeFavorite(listingId: string): Promise<{ favorited: boolean; favoritesCount: number }> {
    const res = await fetch(`${API_BASE}/listings/${listingId}/favorite`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Conversations & Messages
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async startConversation(listingId: string, initialMessage?: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ listingId, initialMessage }),
    });
    return handleResponse(res);
  },

  async getMessages(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  // Offers
  async getOffers(listingId?: string): Promise<Offer[]> {
    const url = listingId ? `${API_BASE}/offers?listingId=${listingId}` : `${API_BASE}/offers`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async makeOffer(listingId: string, offeredPrice: number, note?: string): Promise<Offer> {
    const res = await fetch(`${API_BASE}/offers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ listingId, offeredPrice, note }),
    });
    return handleResponse(res);
  },

  async respondToOffer(offerId: string, action: 'ACCEPT' | 'REJECT' | 'COUNTER' | 'CANCEL', counterPrice?: number, sellerNote?: string): Promise<Offer> {
    const res = await fetch(`${API_BASE}/offers/${offerId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ action, counterPrice, sellerNote }),
    });
    return handleResponse(res);
  },

  // Transactions
  async getTransactions(status?: string): Promise<Transaction[]> {
    const url = status ? `${API_BASE}/transactions?status=${status}` : `${API_BASE}/transactions`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createTransaction(data: any): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTransaction(id: string, data: any): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Reviews
  async getUserReviews(userId: string): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews/user/${userId}`);
    return handleResponse(res);
  },

  async createReview(data: {
    transactionId: string;
    rating: number;
    communicationRating: number;
    itemAccuracyRating: number;
    meetupRating: number;
    comment: string;
  }): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Public Profile
  async getUserProfile(userId: string): Promise<{
    profile: User;
    activeListings: Listing[];
    soldCount: number;
    reviews: Review[];
  }> {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`);
    return handleResponse(res);
  },

  // Reports
  async submitReport(data: {
    reportedUserId?: string;
    listingId?: string;
    reason: string;
    description: string;
  }): Promise<{ message: string; report: Report }> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Looking For Posts
  async getLookingFor(params?: Record<string, string | number | undefined>): Promise<LookingForPost[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/looking-for?${query.toString()}`);
    return handleResponse(res);
  },

  async createLookingFor(data: any): Promise<LookingForPost> {
    const res = await fetch(`${API_BASE}/looking-for`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateLookingFor(id: string, data: any): Promise<LookingForPost> {
    const res = await fetch(`${API_BASE}/looking-for/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Admin APIs
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async toggleUserSuspend(userId: string, isSuspended: boolean): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ isSuspended }),
    });
    return handleResponse(res);
  },

  async changeUserRole(userId: string, role: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  async verifyUser(userId: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/verify`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminReports(): Promise<Report[]> {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async resolveReport(reportId: string, data: { status: string; resolutionNotes?: string; removeListing?: boolean; suspendUser?: boolean }): Promise<Report> {
    const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async moderateListing(listingId: string, data: { action: 'FLAG' | 'UNFLAG' | 'REMOVE' | 'RESTORE'; flagReason?: string }): Promise<Listing> {
    const res = await fetch(`${API_BASE}/admin/listings/${listingId}/moderate`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async createCategory(data: { name: string; parentGroup: string; description?: string; iconName?: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createMeetupLocation(data: { name: string; campusZone: string; description?: string; safetyNotes?: string }): Promise<MeetupLocation> {
    const res = await fetch(`${API_BASE}/admin/meetup-locations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deactivateMeetupLocation(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/meetup-locations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
