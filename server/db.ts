import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  fullName: string;
  universityEmail: string;
  passwordHash: string;
  studentEmployeeId: string;
  role: 'STUDENT' | 'FACULTY' | 'STAFF' | 'ADMIN';
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentGroup: 'Academic' | 'Electronics' | 'Personal' | 'Dormitory' | 'Organization' | 'Others';
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

export interface ListingImage {
  id: string;
  listingId: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

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
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  quantity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED' | 'REMOVED';
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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'CANCELLED';
  buyerNote?: string;
  sellerNote?: string;
  createdAt: string;
  updatedAt: string;
}

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
  status: 'PENDING' | 'RESERVED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
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

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId?: string;
  reportedUserName?: string;
  listingId?: string;
  listingTitle?: string;
  reason: 'Scam / Fraud' | 'Prohibited Item' | 'Counterfeit Item' | 'Misleading Description' | 'Inappropriate Content' | 'Suspicious Behavior' | 'Harassment' | 'Other';
  description: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  createdAt: string;
}

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
  status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';
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

export interface DatabaseState {
  departments: Department[];
  users: User[];
  categories: Category[];
  meetupLocations: MeetupLocation[];
  listings: Listing[];
  favorites: Favorite[];
  conversations: Conversation[];
  messages: Message[];
  offers: Offer[];
  transactions: Transaction[];
  reviews: Review[];
  reports: Report[];
  lookingForPosts: LookingForPost[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'campus_market_db.json');

class RelationalDatabase {
  private state: DatabaseState = {
    departments: [],
    users: [],
    categories: [],
    meetupLocations: [],
    listings: [],
    favorites: [],
    conversations: [],
    messages: [],
    offers: [],
    transactions: [],
    reviews: [],
    reports: [],
    lookingForPosts: [],
    notifications: [],
    auditLogs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.state = JSON.parse(raw);
        console.log(`[Database] Loaded persistent data from ${DB_FILE_PATH}`);
        return;
      } catch (err) {
        console.error('[Database] Failed to read database file, re-seeding...', err);
      }
    }
    this.seed();
    this.persist();
  }

  public persist() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to persist data', err);
    }
  }

  public logAudit(action: string, targetType: string, targetId?: string, user?: { id?: string; name?: string }, metadata?: any) {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      userId: user?.id,
      userName: user?.name,
      action,
      targetType,
      targetId,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 500) {
      this.state.auditLogs.pop();
    }
    this.persist();
  }

  public createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    const item: Notification = {
      id: crypto.randomUUID(),
      ...notification,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.state.notifications.unshift(item);
    this.persist();
    return item;
  }

  // --- GETTERS & ENTITY QUERIES ---
  public getDepartments() { return this.state.departments; }
  public getUsers() { return this.state.users; }
  public getCategories() { return this.state.categories; }
  public getMeetupLocations() { return this.state.meetupLocations; }
  public getListings() { return this.state.listings; }
  public getFavorites() { return this.state.favorites; }
  public getConversations() { return this.state.conversations; }
  public getMessages() { return this.state.messages; }
  public getOffers() { return this.state.offers; }
  public getTransactions() { return this.state.transactions; }
  public getReviews() { return this.state.reviews; }
  public getReports() { return this.state.reports; }
  public getLookingForPosts() { return this.state.lookingForPosts; }
  public getNotifications() { return this.state.notifications; }
  public getAuditLogs() { return this.state.auditLogs; }

  public getUserById(id: string) {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string) {
    return this.state.users.find(u => u.universityEmail.toLowerCase() === email.toLowerCase());
  }

  public getListingById(id: string) {
    return this.state.listings.find(l => l.id === id);
  }

  public getSanitizedUser(user: User) {
    const { passwordHash, studentEmployeeId, ...safe } = user;
    return safe;
  }

  // --- SEED INITIAL DATA ---
  private seed() {
    console.log('[Database] Seeding initial campus marketplace data...');
    const defaultPasswordHash = bcrypt.hashSync('campus123', 10);

    const departments: Department[] = [
      { id: 'dept-1', name: 'College of Information and Computing Sciences', code: 'CICS', college: 'Computing' },
      { id: 'dept-2', name: 'College of Engineering and Architecture', code: 'CEA', college: 'Engineering' },
      { id: 'dept-3', name: 'College of Business and Accountancy', code: 'CBA', college: 'Business' },
      { id: 'dept-4', name: 'College of Science and Mathematics', code: 'CSM', college: 'Science' },
      { id: 'dept-5', name: 'College of Education and Arts', code: 'CEA', college: 'Education' },
      { id: 'dept-6', name: 'College of Nursing and Allied Health', code: 'CNAH', college: 'Nursing' },
    ];

    const meetupLocations: MeetupLocation[] = [
      {
        id: 'loc-1',
        name: 'University Student Center (Main Atrium)',
        campusZone: 'Central Campus',
        description: 'Open, well-lit lounge on the ground floor with security desk and student kiosks.',
        safetyNotes: 'Optimal for daytime meetups between 8:00 AM and 8:00 PM.',
        isActive: true,
      },
      {
        id: 'loc-2',
        name: 'Main University Library Lobby',
        campusZone: 'North Quad',
        description: 'Inside the entrance turnstiles opposite circulation desk with 24/7 CCTV surveillance.',
        safetyNotes: 'Quiet and highly secure. Verified campus ID required at door.',
        isActive: true,
      },
      {
        id: 'loc-3',
        name: 'University Main Gate - Visitors Reception',
        campusZone: 'South Gate',
        description: 'Adjacent to Campus Security Central Command with covered benches.',
        safetyNotes: 'Recommended for bulky or evening items; guard post staffed 24/7.',
        isActive: true,
      },
      {
        id: 'loc-4',
        name: 'University Cafeteria - East Terrace',
        campusZone: 'Student Plaza',
        description: 'Bustling dining hall tables near the coffee bar.',
        safetyNotes: 'Best during peak break periods (11:00 AM - 4:00 PM).',
        isActive: true,
      },
      {
        id: 'loc-5',
        name: 'College of Engineering - Ground Floor Lounge',
        campusZone: 'Engineering Complex',
        description: 'Near Tech Lab 102 with spacious tables and charging outlets for testing gear.',
        safetyNotes: 'Great for testing laptops, calculators, or electronics prior to deal finalization.',
        isActive: true,
      },
      {
        id: 'loc-6',
        name: 'Administration Building - Plaza Fountain',
        campusZone: 'West Oval',
        description: 'Central campus crossway with clear sightlines and constant pedestrian flow.',
        safetyNotes: 'Open campus square with daytime visibility.',
        isActive: true,
      },
    ];

    const categories: Category[] = [
      // Academic
      { id: 'cat-1', name: 'Textbooks', slug: 'textbooks', parentGroup: 'Academic', description: 'Curriculum coursebooks, reference manuals, and lecture texts.', iconName: 'BookOpen', itemCount: 18 },
      { id: 'cat-2', name: 'Calculators', slug: 'calculators', parentGroup: 'Academic', description: 'Scientific, graphing, and financial calculators approved for exams.', iconName: 'Calculator', itemCount: 12 },
      { id: 'cat-3', name: 'Laboratory Equipment', slug: 'lab-equipment', parentGroup: 'Academic', description: 'Lab coats, safety goggles, dissection kits, and glass apparatus.', iconName: 'FlaskConical', itemCount: 7 },
      { id: 'cat-4', name: 'School Supplies', slug: 'school-supplies', parentGroup: 'Academic', description: 'Notebooks, engineering pads, drafting pens, and binders.', iconName: 'PenTool', itemCount: 9 },
      { id: 'cat-5', name: 'Review Materials', slug: 'review-materials', parentGroup: 'Academic', description: 'Board exam reviewers, CPA/engineering reviewers, practice tests.', iconName: 'GraduationCap', itemCount: 11 },
      { id: 'cat-6', name: 'Uniforms', slug: 'uniforms', parentGroup: 'Academic', description: 'Official campus uniforms, college blazers, PE shirts, and scrubs.', iconName: 'Shirt', itemCount: 8 },
      { id: 'cat-7', name: 'Project Materials', slug: 'project-materials', parentGroup: 'Academic', description: 'Arduino kits, architecture boards, 3D printing filament, sensors.', iconName: 'Cpu', itemCount: 6 },
      // Electronics
      { id: 'cat-8', name: 'Laptops', slug: 'laptops', parentGroup: 'Electronics', description: 'Laptops, MacBooks, ThinkPads, and ultrabooks for coursework.', iconName: 'Laptop', itemCount: 8 },
      { id: 'cat-9', name: 'Tablets & E-Readers', slug: 'tablets', parentGroup: 'Electronics', description: 'iPads, Android tablets, Kindles, and stylus pens.', iconName: 'Tablet', itemCount: 6 },
      { id: 'cat-10', name: 'Computer Accessories', slug: 'computer-accessories', parentGroup: 'Electronics', description: 'Monitors, mechanical keyboards, mice, adapters, and flash drives.', iconName: 'HardDrive', itemCount: 14 },
      { id: 'cat-11', name: 'Earphones & Audio', slug: 'earphones', parentGroup: 'Electronics', description: 'Noise-canceling headphones, earbuds, and microphones.', iconName: 'Headphones', itemCount: 10 },
      // Personal
      { id: 'cat-12', name: 'Bags & Backpacks', slug: 'bags', parentGroup: 'Personal', description: 'Waterproof campus backpacks, tote bags, and laptop sleeves.', iconName: 'Briefcase', itemCount: 13 },
      { id: 'cat-13', name: 'Clothing & Footwear', slug: 'clothing', parentGroup: 'Personal', description: 'Hoodies, casual sneakers, campus jackets, and hats.', iconName: 'Sparkles', itemCount: 12 },
      // Dormitory
      { id: 'cat-14', name: 'Dorm Furniture & Decor', slug: 'dorm-furniture', parentGroup: 'Dormitory', description: 'Ergonomic study chairs, compact desk lamps, shoe racks.', iconName: 'Armchair', itemCount: 8 },
      { id: 'cat-15', name: 'Appliances & Kitchen', slug: 'dorm-appliances', parentGroup: 'Dormitory', description: 'Mini kettles, rice cookers, compact fans, mini refrigerators.', iconName: 'Coffee', itemCount: 7 },
      // Organization
      { id: 'cat-16', name: 'Organization & Event Merch', slug: 'org-merchandise', parentGroup: 'Organization', description: 'Club lanyards, festival jerseys, collegiate pins, and tumblers.', iconName: 'Award', itemCount: 5 },
      // Others
      { id: 'cat-17', name: 'Miscellaneous', slug: 'miscellaneous', parentGroup: 'Others', description: 'Umbrellas, sports racquets, bicycle gear, and musical instruments.', iconName: 'Package', itemCount: 4 },
    ];

    const users: User[] = [
      {
        id: 'usr-student-1',
        fullName: 'Juan Dela Cruz',
        universityEmail: 'juan.delacruz@university.edu',
        passwordHash: defaultPasswordHash,
        studentEmployeeId: '2023-10492',
        role: 'STUDENT',
        departmentId: 'dept-1',
        departmentName: 'BS Information Technology',
        college: 'Computing',
        yearLevel: '3rd Year',
        profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        isVerified: true,
        verificationBadge: '✓ Verified Campus User',
        isSuspended: false,
        reputationRating: 4.85,
        totalReviews: 23,
        completedTransactions: 23,
        createdAt: '2024-08-15T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'usr-student-2',
        fullName: 'Maria Santos',
        universityEmail: 'maria.santos@university.edu',
        passwordHash: defaultPasswordHash,
        studentEmployeeId: '2024-11822',
        role: 'STUDENT',
        departmentId: 'dept-2',
        departmentName: 'BS Civil Engineering',
        college: 'Engineering',
        yearLevel: '2nd Year',
        profilePictureUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        isVerified: true,
        verificationBadge: '✓ Verified Campus User',
        isSuspended: false,
        reputationRating: 4.90,
        totalReviews: 14,
        completedTransactions: 15,
        createdAt: '2024-09-01T08:00:00.000Z',
        updatedAt: '2026-09-02T08:00:00.000Z',
      },
      {
        id: 'usr-student-3',
        fullName: 'Carlo Reyes',
        universityEmail: 'carlo.reyes@university.edu',
        passwordHash: defaultPasswordHash,
        studentEmployeeId: '2022-09411',
        role: 'STUDENT',
        departmentId: 'dept-3',
        departmentName: 'BS Accountancy',
        college: 'Business',
        yearLevel: '4th Year',
        profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        isVerified: true,
        verificationBadge: '✓ Verified Campus User',
        isSuspended: false,
        reputationRating: 4.70,
        totalReviews: 19,
        completedTransactions: 20,
        createdAt: '2023-08-10T08:00:00.000Z',
        updatedAt: '2026-08-20T08:00:00.000Z',
      },
      {
        id: 'usr-student-4',
        fullName: 'Sophia Lim',
        universityEmail: 'sophia.lim@university.edu',
        passwordHash: defaultPasswordHash,
        studentEmployeeId: '2023-12003',
        role: 'STUDENT',
        departmentId: 'dept-4',
        departmentName: 'BS Biology',
        college: 'Science',
        yearLevel: '3rd Year',
        profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        isVerified: true,
        verificationBadge: '✓ Verified Campus User',
        isSuspended: false,
        reputationRating: 5.0,
        totalReviews: 8,
        completedTransactions: 9,
        createdAt: '2024-01-15T08:00:00.000Z',
        updatedAt: '2026-08-15T08:00:00.000Z',
      },
      {
        id: 'usr-faculty-1',
        fullName: 'Dr. Elena Gomez',
        universityEmail: 'elena.gomez@university.edu',
        passwordHash: defaultPasswordHash,
        studentEmployeeId: 'FAC-2018-044',
        role: 'FACULTY',
        departmentId: 'dept-1',
        departmentName: 'Department of Computer Science',
        college: 'Computing',
        yearLevel: 'Faculty',
        profilePictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        isVerified: true,
        verificationBadge: '✓ Verified Campus Faculty',
        isSuspended: false,
        reputationRating: 5.0,
        totalReviews: 31,
        completedTransactions: 33,
        createdAt: '2022-01-10T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'usr-admin-1',
        fullName: 'Prof. David Vance',
        universityEmail: 'david.vance@university.edu',
        passwordHash: defaultPasswordHash,
        studentEmployeeId: 'ADM-2015-002',
        role: 'ADMIN',
        departmentId: 'dept-2',
        departmentName: 'Campus Security & Student Affairs',
        college: 'Administration',
        yearLevel: 'Staff Administrator',
        profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
        isVerified: true,
        verificationBadge: '✓ Verified Campus Admin',
        isSuspended: false,
        reputationRating: 5.0,
        totalReviews: 45,
        completedTransactions: 50,
        createdAt: '2021-06-01T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
      },
    ];

    const listings: Listing[] = [
      {
        id: 'lst-1',
        sellerId: 'usr-student-1',
        sellerName: 'Juan Dela Cruz',
        sellerRole: 'STUDENT',
        sellerDepartment: 'BS Information Technology',
        sellerRating: 4.85,
        sellerCompletedCount: 23,
        sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        title: 'Casio FX-991EX ClassWiz Scientific Calculator',
        description: 'Used for two engineering mathematics semesters. High-resolution Natural Display with matrix, calculus, spreadsheet, and solver capabilities. Fully functional with minor cosmetic surface scratches on the protective slide-on hard case. Clean battery compartment with fresh battery replaced last month.',
        categoryId: 'cat-2',
        categoryName: 'Calculators',
        price: 650,
        condition: 'GOOD',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: true,
        brand: 'Casio',
        model: 'FX-991EX ClassWiz',
        itemYear: '2023',
        originalPrice: 1450,
        purchaseDate: 'October 2023',
        additionalNotes: 'Passed PRC examination inspection protocol for Board Exams.',
        preferredMeetupId: 'loc-1',
        preferredMeetupName: 'University Student Center (Main Atrium)',
        campusZone: 'Central Campus',
        images: [
          'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 142,
        favoritesCount: 12,
        offersCount: 3,
        isFlagged: false,
        createdAt: '2026-09-10T09:30:00.000Z',
        updatedAt: '2026-09-14T14:10:00.000Z',
      },
      {
        id: 'lst-2',
        sellerId: 'usr-student-2',
        sellerName: 'Maria Santos',
        sellerRole: 'STUDENT',
        sellerDepartment: 'BS Civil Engineering',
        sellerRating: 4.90,
        sellerCompletedCount: 15,
        sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        title: 'Engineering Mechanics: Statics & Dynamics (14th Edition) - Hibbeler',
        description: 'Standard textbook for Engineering Mechanics 1 & 2. Pristine condition with clear plastic protective book cover. No torn pages, clean margins, minimal neat pencil annotations in Chapter 3 only. Includes online companion quick-reference sheet.',
        categoryId: 'cat-1',
        categoryName: 'Textbooks',
        price: 580,
        condition: 'LIKE_NEW',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: true,
        brand: 'Pearson',
        model: '14th Global Edition',
        itemYear: '2024',
        originalPrice: 1600,
        purchaseDate: 'August 2024',
        preferredMeetupId: 'loc-5',
        preferredMeetupName: 'College of Engineering - Ground Floor Lounge',
        campusZone: 'Engineering Complex',
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 89,
        favoritesCount: 7,
        offersCount: 2,
        isFlagged: false,
        createdAt: '2026-09-11T11:00:00.000Z',
        updatedAt: '2026-09-12T16:00:00.000Z',
      },
      {
        id: 'lst-3',
        sellerId: 'usr-student-4',
        sellerName: 'Sophia Lim',
        sellerRole: 'STUDENT',
        sellerDepartment: 'BS Biology',
        sellerRating: 5.0,
        sellerCompletedCount: 9,
        sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        title: 'Standard Cotton Laboratory Coat (Unisex Size M) & Polycarbonate Goggles',
        description: 'Washed and sanitized heavy-duty 100% white cotton lab coat with embroidered college crest. High collar with snap buttons and two deep side pockets for pipettes and notebooks. Comes with anti-fog UV400 safety goggles.',
        categoryId: 'cat-3',
        categoryName: 'Laboratory Equipment',
        price: 320,
        condition: 'GOOD',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: false,
        brand: 'BioSafe Wear',
        model: 'Lab Pro M',
        originalPrice: 750,
        preferredMeetupId: 'loc-2',
        preferredMeetupName: 'Main University Library Lobby',
        campusZone: 'North Quad',
        images: [
          'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 64,
        favoritesCount: 5,
        offersCount: 1,
        isFlagged: false,
        createdAt: '2026-09-12T14:20:00.000Z',
        updatedAt: '2026-09-12T14:20:00.000Z',
      },
      {
        id: 'lst-4',
        sellerId: 'usr-student-3',
        sellerName: 'Carlo Reyes',
        sellerRole: 'STUDENT',
        sellerDepartment: 'BS Accountancy',
        sellerRating: 4.70,
        sellerCompletedCount: 20,
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        title: 'CPA Comprehensive Reviewer Books (Volumes 1 & 2 - Theory & Practical)',
        description: 'Complete 2-volume compilation for Accountancy majors. Features Financial Accounting & Reporting, Advanced FAR, and Tax auditing summaries with step-by-step problem walkthroughs. Very slight shelf wear.',
        categoryId: 'cat-5',
        categoryName: 'Review Materials',
        price: 490,
        condition: 'GOOD',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: true,
        brand: 'Rex Book Store',
        model: '2025 Edition',
        originalPrice: 1200,
        preferredMeetupId: 'loc-4',
        preferredMeetupName: 'University Cafeteria - East Terrace',
        campusZone: 'Student Plaza',
        images: [
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 112,
        favoritesCount: 15,
        offersCount: 4,
        isFlagged: false,
        createdAt: '2026-09-13T08:00:00.000Z',
        updatedAt: '2026-09-13T08:00:00.000Z',
      },
      {
        id: 'lst-5',
        sellerId: 'usr-faculty-1',
        sellerName: 'Dr. Elena Gomez',
        sellerRole: 'FACULTY',
        sellerDepartment: 'Department of Computer Science',
        sellerRating: 5.0,
        sellerCompletedCount: 33,
        sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        title: 'Lenovo ThinkPad T14 Gen 2 (Intel Core i5, 16GB RAM, 512GB NVMe SSD)',
        description: 'Retired university faculty research laptop in immaculate condition. Matte 14" Full HD IPS display (100% sRGB), military-grade chassis, spill-resistant backlit ThinkPad keyboard. Battery health at 92% (holds 7+ hours). Comes with original 65W USB-C fast charger. Fresh clean installation of Windows 11 Pro.',
        categoryId: 'cat-8',
        categoryName: 'Laptops',
        price: 21500,
        condition: 'LIKE_NEW',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: true,
        brand: 'Lenovo',
        model: 'ThinkPad T14 Gen 2',
        itemYear: '2023',
        originalPrice: 52000,
        preferredMeetupId: 'loc-2',
        preferredMeetupName: 'Main University Library Lobby',
        campusZone: 'North Quad',
        images: [
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 310,
        favoritesCount: 28,
        offersCount: 5,
        isFlagged: false,
        createdAt: '2026-09-08T10:15:00.000Z',
        updatedAt: '2026-09-14T09:00:00.000Z',
      },
      {
        id: 'lst-6',
        sellerId: 'usr-student-3',
        sellerName: 'Carlo Reyes',
        sellerRole: 'STUDENT',
        sellerDepartment: 'BS Accountancy',
        sellerRating: 4.70,
        sellerCompletedCount: 20,
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        title: 'Ergonomic Mid-Back Mesh Study Desk Chair',
        description: 'Bought for dorm room study corner. Breathable high-density mesh back with lumbar curve support, pneumatic seat-height adjustment, 360-degree smooth rolling casters. No tears or stains, clean hydraulic cylinder.',
        categoryId: 'cat-14',
        categoryName: 'Dorm Furniture & Decor',
        price: 1200,
        condition: 'GOOD',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: true,
        brand: 'Sihoo',
        model: 'M18 Basic',
        originalPrice: 2800,
        preferredMeetupId: 'loc-3',
        preferredMeetupName: 'University Main Gate - Visitors Reception',
        campusZone: 'South Gate',
        images: [
          'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 78,
        favoritesCount: 9,
        offersCount: 2,
        isFlagged: false,
        createdAt: '2026-09-09T13:45:00.000Z',
        updatedAt: '2026-09-12T10:30:00.000Z',
      },
      {
        id: 'lst-7',
        sellerId: 'usr-student-2',
        sellerName: 'Maria Santos',
        sellerRole: 'STUDENT',
        sellerDepartment: 'BS Civil Engineering',
        sellerRating: 4.90,
        sellerCompletedCount: 15,
        sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        title: 'Campus Water-Resistant Laptop Backpack with USB Charging Port',
        description: 'Black minimalist Oxford fabric commuter bag with padded sleeve fitting up to 15.6" laptop. Multiple interior organizer pockets, anti-theft back zipper pocket, and luggage strap.',
        categoryId: 'cat-12',
        categoryName: 'Bags & Backpacks',
        price: 480,
        condition: 'GOOD',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: false,
        brand: 'Mark Ryden',
        model: 'Campus Urban',
        originalPrice: 1100,
        preferredMeetupId: 'loc-1',
        preferredMeetupName: 'University Student Center (Main Atrium)',
        campusZone: 'Central Campus',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 95,
        favoritesCount: 11,
        offersCount: 1,
        isFlagged: false,
        createdAt: '2026-09-11T15:10:00.000Z',
        updatedAt: '2026-09-11T15:10:00.000Z',
      },
      {
        id: 'lst-8',
        sellerId: 'usr-student-3',
        sellerName: 'Carlo Reyes',
        sellerRole: 'STUDENT',
        sellerDepartment: 'BS Accountancy',
        sellerRating: 4.70,
        sellerCompletedCount: 20,
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        title: 'College University Varsity Fleece Pullover Hoodie (Size L)',
        description: 'Official collegiate navy blue heavy-blend fleece sweatshirt with embroidered university crest. Gently worn during university games, washed clean, no loose threads or fading.',
        categoryId: 'cat-16',
        categoryName: 'Organization & Event Merch',
        price: 450,
        condition: 'LIKE_NEW',
        quantity: 1,
        status: 'AVAILABLE',
        isNegotiable: true,
        brand: 'Varsity Apparel',
        model: 'Official Campus Merch',
        originalPrice: 900,
        preferredMeetupId: 'loc-1',
        preferredMeetupName: 'University Student Center (Main Atrium)',
        campusZone: 'Central Campus',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        ],
        viewCount: 130,
        favoritesCount: 14,
        offersCount: 2,
        isFlagged: false,
        createdAt: '2026-09-12T17:00:00.000Z',
        updatedAt: '2026-09-14T08:00:00.000Z',
      },
    ];

    const conversations: Conversation[] = [
      {
        id: 'conv-1',
        listingId: 'lst-1',
        listingTitle: 'Casio FX-991EX ClassWiz Scientific Calculator',
        listingPrice: 650,
        listingImage: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=800&auto=format&fit=crop&q=80',
        listingStatus: 'AVAILABLE',
        buyerId: 'usr-student-2',
        buyerName: 'Maria Santos',
        buyerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        sellerId: 'usr-student-1',
        sellerName: 'Juan Dela Cruz',
        sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        lastMessageText: 'Can we meet at the Student Center tomorrow at 2:00 PM?',
        lastMessageAt: '2026-09-14T14:30:00.000Z',
        buyerUnreadCount: 0,
        sellerUnreadCount: 1,
        createdAt: '2026-09-14T14:00:00.000Z',
        updatedAt: '2026-09-14T14:30:00.000Z',
      },
    ];

    const messages: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'usr-student-2',
        senderName: 'Maria Santos',
        receiverId: 'usr-student-1',
        content: 'Hi Juan! Is this Casio calculator still available?',
        isRead: true,
        readAt: '2026-09-14T14:05:00.000Z',
        createdAt: '2026-09-14T14:01:00.000Z',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'usr-student-1',
        senderName: 'Juan Dela Cruz',
        receiverId: 'usr-student-2',
        content: 'Yes Maria, it is available and ready for handoff!',
        isRead: true,
        readAt: '2026-09-14T14:15:00.000Z',
        createdAt: '2026-09-14T14:10:00.000Z',
      },
      {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'usr-student-2',
        senderName: 'Maria Santos',
        receiverId: 'usr-student-1',
        content: 'Can you do ₱600 if we meet today or tomorrow?',
        isRead: true,
        readAt: '2026-09-14T14:20:00.000Z',
        createdAt: '2026-09-14T14:18:00.000Z',
      },
      {
        id: 'msg-4',
        conversationId: 'conv-1',
        senderId: 'usr-student-1',
        senderName: 'Juan Dela Cruz',
        receiverId: 'usr-student-2',
        content: 'Sure! ₱600 sounds fair for a fellow campus student.',
        isRead: true,
        readAt: '2026-09-14T14:25:00.000Z',
        createdAt: '2026-09-14T14:22:00.000Z',
      },
      {
        id: 'msg-5',
        conversationId: 'conv-1',
        senderId: 'usr-student-2',
        senderName: 'Maria Santos',
        receiverId: 'usr-student-1',
        content: 'Can we meet at the Student Center tomorrow at 2:00 PM?',
        isRead: false,
        createdAt: '2026-09-14T14:30:00.000Z',
      },
    ];

    const offers: Offer[] = [
      {
        id: 'ofr-1',
        listingId: 'lst-1',
        listingTitle: 'Casio FX-991EX ClassWiz Scientific Calculator',
        listingPrice: 650,
        listingImage: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=800&auto=format&fit=crop&q=80',
        buyerId: 'usr-student-2',
        buyerName: 'Maria Santos',
        buyerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        sellerId: 'usr-student-1',
        sellerName: 'Juan Dela Cruz',
        offeredPrice: 600,
        status: 'ACCEPTED',
        buyerNote: 'Will pay cash upon inspecting calculator at Student Center.',
        sellerNote: 'Accepted! Looking forward to meeting you.',
        createdAt: '2026-09-14T14:20:00.000Z',
        updatedAt: '2026-09-14T14:22:00.000Z',
      },
    ];

    const transactions: Transaction[] = [
      {
        id: 'txn-past-1',
        listingId: 'lst-past-1',
        listingTitle: 'Thomas Calculus Early Transcendentals (13th Edition)',
        listingImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        buyerId: 'usr-student-1',
        buyerName: 'Juan Dela Cruz',
        buyerEmail: 'juan.delacruz@university.edu',
        sellerId: 'usr-faculty-1',
        sellerName: 'Dr. Elena Gomez',
        sellerEmail: 'elena.gomez@university.edu',
        agreedPrice: 450,
        meetupLocationId: 'loc-2',
        meetupLocationName: 'Main University Library Lobby',
        scheduledDate: '2026-09-02 10:00 AM',
        status: 'COMPLETED',
        notes: 'Handed over cleanly. Buyer checked page integrity.',
        buyerConfirmedCompletion: true,
        sellerConfirmedCompletion: true,
        createdAt: '2026-09-01T10:00:00.000Z',
        completedAt: '2026-09-02T10:20:00.000Z',
      },
      {
        id: 'txn-active-1',
        listingId: 'lst-1',
        listingTitle: 'Casio FX-991EX ClassWiz Scientific Calculator',
        listingImage: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=800&auto=format&fit=crop&q=80',
        buyerId: 'usr-student-2',
        buyerName: 'Maria Santos',
        buyerEmail: 'maria.santos@university.edu',
        sellerId: 'usr-student-1',
        sellerName: 'Juan Dela Cruz',
        sellerEmail: 'juan.delacruz@university.edu',
        offerId: 'ofr-1',
        agreedPrice: 600,
        meetupLocationId: 'loc-1',
        meetupLocationName: 'University Student Center (Main Atrium)',
        scheduledDate: 'Tomorrow at 2:00 PM',
        status: 'RESERVED',
        notes: 'Item reserved following offer acceptance. Meetup scheduled at Student Center Atrium.',
        buyerConfirmedCompletion: false,
        sellerConfirmedCompletion: false,
        createdAt: '2026-09-14T14:25:00.000Z',
      },
    ];

    const reviews: Review[] = [
      {
        id: 'rev-1',
        transactionId: 'txn-past-1',
        reviewerId: 'usr-student-1',
        reviewerName: 'Juan Dela Cruz',
        reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        reviewedUserId: 'usr-faculty-1',
        listingId: 'lst-past-1',
        listingTitle: 'Thomas Calculus Early Transcendentals (13th Edition)',
        rating: 5,
        communicationRating: 5,
        itemAccuracyRating: 5,
        meetupRating: 5,
        comment: 'Dr. Gomez was prompt, accommodating, and the book condition was even better than described. Highly recommended campus seller!',
        createdAt: '2026-09-02T11:00:00.000Z',
      },
      {
        id: 'rev-2',
        transactionId: 'txn-past-1',
        reviewerId: 'usr-faculty-1',
        reviewerName: 'Dr. Elena Gomez',
        reviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        reviewedUserId: 'usr-student-1',
        listingId: 'lst-past-1',
        listingTitle: 'Thomas Calculus Early Transcendentals (13th Edition)',
        rating: 5,
        communicationRating: 5,
        itemAccuracyRating: 5,
        meetupRating: 5,
        comment: 'Very respectful and punctual student buyer. Exact cash payment and smooth campus transaction.',
        createdAt: '2026-09-02T11:30:00.000Z',
      },
    ];

    const reports: Report[] = [
      {
        id: 'rep-1',
        reporterId: 'usr-student-3',
        reporterName: 'Carlo Reyes',
        reportedUserId: 'usr-student-4',
        listingId: 'lst-4',
        reason: 'Misleading Description',
        description: 'Seller initially had wrong edition year in listing title, resolved in chat.',
        status: 'RESOLVED',
        resolutionNotes: 'User corrected the edition detail promptly. No penalty assessed.',
        resolvedBy: 'usr-admin-1',
        resolvedByName: 'Prof. David Vance',
        resolvedAt: '2026-09-13T16:00:00.000Z',
        createdAt: '2026-09-13T09:00:00.000Z',
      },
    ];

    const lookingForPosts: LookingForPost[] = [
      {
        id: 'lf-1',
        authorId: 'usr-student-2',
        authorName: 'Maria Santos',
        authorDepartment: 'BS Civil Engineering',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        title: 'Engineering Drawing & Drafting Tools Kit (Rotring/Staedtler set & T-Square)',
        description: 'Urgent need for CE 101 Graphics course: 24-inch or 36-inch acrylic T-square, triangular scale ruler, technical drafting pens, and drawing board clips. Budget between ₱500 and ₱900 depending on condition.',
        categoryId: 'cat-4',
        categoryName: 'School Supplies',
        minBudget: 500,
        maxBudget: 900,
        preferredMeetupName: 'College of Engineering - Ground Floor Lounge',
        status: 'ACTIVE',
        responseCount: 2,
        expiresAt: '2026-09-25T00:00:00.000Z',
        createdAt: '2026-09-13T10:00:00.000Z',
      },
      {
        id: 'lf-2',
        authorId: 'usr-student-4',
        authorName: 'Sophia Lim',
        authorDepartment: 'BS Biology',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        title: 'Campbells Biology 11th or 12th Edition Textbook (Hardbound)',
        description: 'Looking for a clean copy for Bio major core lecture. Okay with highlighting as long as text is readable and binding is tight.',
        categoryId: 'cat-1',
        categoryName: 'Textbooks',
        minBudget: 600,
        maxBudget: 1100,
        preferredMeetupName: 'Main University Library Lobby',
        status: 'ACTIVE',
        responseCount: 1,
        expiresAt: '2026-09-30T00:00:00.000Z',
        createdAt: '2026-09-14T08:30:00.000Z',
      },
    ];

    const notifications: Notification[] = [
      {
        id: 'notif-1',
        recipientId: 'usr-student-1',
        senderId: 'usr-student-2',
        senderName: 'Maria Santos',
        type: 'OFFER_ACCEPTED',
        title: 'Offer Accepted & Item Reserved!',
        message: 'Maria Santos agreed to meet tomorrow at 2:00 PM at Student Center for Casio FX-991EX.',
        relatedEntityType: 'transaction',
        relatedEntityId: 'txn-active-1',
        isRead: false,
        createdAt: '2026-09-14T14:26:00.000Z',
      },
      {
        id: 'notif-2',
        recipientId: 'usr-student-1',
        senderId: 'usr-student-2',
        senderName: 'Maria Santos',
        type: 'NEW_MESSAGE',
        title: 'New message from Maria Santos',
        message: 'Can we meet at the Student Center tomorrow at 2:00 PM?',
        relatedEntityType: 'conversation',
        relatedEntityId: 'conv-1',
        isRead: false,
        createdAt: '2026-09-14T14:30:00.000Z',
      },
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'aud-1',
        userId: 'usr-admin-1',
        userName: 'Prof. David Vance',
        action: 'ADMIN_RESOLVED_REPORT',
        targetType: 'report',
        targetId: 'rep-1',
        metadata: JSON.stringify({ note: 'Listing details updated without infraction' }),
        ipAddress: '127.0.0.1',
        timestamp: '2026-09-13T16:00:00.000Z',
      },
      {
        id: 'aud-2',
        userId: 'usr-admin-1',
        userName: 'Prof. David Vance',
        action: 'ADMIN_CREATED_MEETUP_LOCATION',
        targetType: 'meetup_location',
        targetId: 'loc-1',
        metadata: JSON.stringify({ name: 'University Student Center (Main Atrium)' }),
        ipAddress: '127.0.0.1',
        timestamp: '2026-09-01T08:00:00.000Z',
      },
    ];

    this.state = {
      departments,
      meetupLocations,
      categories,
      users,
      listings,
      favorites: [
        { id: 'fav-1', userId: 'usr-student-1', listingId: 'lst-2', createdAt: '2026-09-12T00:00:00.000Z' },
      ],
      conversations,
      messages,
      offers,
      transactions,
      reviews,
      reports,
      lookingForPosts,
      notifications,
      auditLogs,
    };
  }
}

export const db = new RelationalDatabase();
