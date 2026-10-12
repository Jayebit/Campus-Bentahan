import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, User, Listing, Offer, Transaction, Review, Report, LookingForPost, Message, Conversation } from './db';
import { authMiddleware, requireAuth, requireVerified, requireAdmin, generateToken, AuthenticatedRequest } from './auth';

export const apiRouter = Router();

apiRouter.use(authMiddleware);

// ==========================================
// PROHIBITED ITEMS DETECTION
// ==========================================
const PROHIBITED_KEYWORDS = [
  'gun', 'firearm', 'weapon', 'knife', 'switchblade', 'ammunition', 'explosive',
  'weed', 'marijuana', 'shabu', 'cocaine', 'drug', 'narcotic', 'ecstasy', 'prescription',
  'vape', 'e-cigarette', 'counterfeit', 'replica', 'fake id', 'stolen', 'hacked',
  'leak exam', 'exam leak', 'test bank leak', 'ghostwrite', 'thesis for sale',
];

function checkForProhibitedContent(title: string, description: string): { isFlagged: boolean; reason?: string } {
  const combined = `${title} ${description}`.toLowerCase();
  for (const keyword of PROHIBITED_KEYWORDS) {
    if (combined.includes(keyword)) {
      return {
        isFlagged: true,
        reason: `Automated detection: Contains prohibited term "${keyword}". Flagged for administrative safety review.`,
      };
    }
  }
  return { isFlagged: false };
}

// ==========================================
// 1. AUTHENTICATION & CAMPUS VERIFICATION
// ==========================================

// Register
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      universityEmail,
      password,
      studentEmployeeId,
      role = 'STUDENT',
      departmentId,
      yearLevel,
      profilePictureUrl,
    } = req.body;

    if (!fullName || !universityEmail || !password || !studentEmployeeId) {
      res.status(400).json({ error: 'Full name, university email, password, and ID are required.' });
      return;
    }

    if (!universityEmail.includes('@') || (!universityEmail.endsWith('.edu') && !universityEmail.endsWith('.ac') && !universityEmail.includes('campus') && !universityEmail.includes('univ'))) {
      res.status(400).json({ error: 'Please enter an approved university email address (e.g., student@university.edu).' });
      return;
    }

    const existing = db.getUserByEmail(universityEmail);
    if (existing) {
      res.status(400).json({ error: 'An account with this university email already exists.' });
      return;
    }

    const dept = db.getDepartments().find(d => d.id === departmentId);

    const newUser: User = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      fullName,
      universityEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      studentEmployeeId,
      role: role === 'ADMIN' ? 'STUDENT' : role, // Admin cannot be self-assigned
      departmentId,
      departmentName: dept ? dept.name : undefined,
      college: dept ? dept.college : undefined,
      yearLevel: role === 'STUDENT' ? (yearLevel || '1st Year') : (role === 'FACULTY' ? 'Faculty' : 'Staff'),
      profilePictureUrl: profilePictureUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
      isVerified: true, // Instant campus verification on registered official university email
      verificationBadge: role === 'FACULTY' ? '✓ Verified Campus Faculty' : (role === 'STAFF' ? '✓ Verified Campus Staff' : '✓ Verified Campus User'),
      isSuspended: false,
      reputationRating: 5.0,
      totalReviews: 0,
      completedTransactions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.getUsers().push(newUser);
    db.logAudit('USER_REGISTERED', 'user', newUser.id, { id: newUser.id, name: newUser.fullName });
    db.persist();

    const token = generateToken(newUser);
    res.status(201).json({
      user: db.getSanitizedUser(newUser),
      token,
      message: 'Registration successful. Campus credentials verified.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// Login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { universityEmail, password } = req.body;
    if (!universityEmail || !password) {
      res.status(400).json({ error: 'University email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(universityEmail);
    if (!user) {
      res.status(401).json({ error: 'Invalid university email or password.' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ error: 'Your account has been suspended by campus administration.' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid university email or password.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      user: db.getSanitizedUser(user),
      token,
      message: 'Login successful.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// Get Current User
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.json({ user: db.getSanitizedUser(req.user) });
});

// Quick Demo User Switcher
apiRouter.post('/auth/switch-demo-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'Demo user not found.' });
    return;
  }
  const token = generateToken(user);
  res.json({
    user: db.getSanitizedUser(user),
    token,
    message: `Switched active session to ${user.fullName} (${user.role})`,
  });
});

// Update Profile
apiRouter.patch('/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { fullName, profilePictureUrl, departmentId, yearLevel } = req.body;

  if (fullName) user.fullName = fullName;
  if (profilePictureUrl) user.profilePictureUrl = profilePictureUrl;
  if (departmentId) {
    const dept = db.getDepartments().find(d => d.id === departmentId);
    if (dept) {
      user.departmentId = dept.id;
      user.departmentName = dept.name;
      user.college = dept.college;
    }
  }
  if (yearLevel) user.yearLevel = yearLevel;
  user.updatedAt = new Date().toISOString();
  db.persist();

  res.json({ user: db.getSanitizedUser(user) });
});

// ==========================================
// 2. REFERENCE DATA: DEPARTMENTS, CATEGORIES, MEETUPS
// ==========================================

apiRouter.get('/departments', (req: Request, res: Response) => {
  res.json(db.getDepartments());
});

apiRouter.get('/categories', (req: Request, res: Response) => {
  // Update count dynamically
  const categories = db.getCategories().map(cat => {
    const count = db.getListings().filter(l => l.categoryId === cat.id && l.status !== 'REMOVED').length;
    return { ...cat, itemCount: count };
  });
  res.json(categories);
});

apiRouter.get('/meetup-locations', (req: Request, res: Response) => {
  res.json(db.getMeetupLocations().filter(l => l.isActive));
});

// ==========================================
// 3. MARKETPLACE LISTINGS
// ==========================================

// Get listings with search, filter, and sorting
apiRouter.get('/listings', (req: Request, res: Response) => {
  let listings = db.getListings().filter(l => l.status !== 'REMOVED');

  const {
    q,
    categoryId,
    condition,
    minPrice,
    maxPrice,
    department,
    meetupLocationId,
    negotiableOnly,
    status = 'AVAILABLE',
    sort = 'newest',
    sellerId,
  } = req.query;

  // Status filtering (default only AVAILABLE unless requested or user viewing own)
  if (status && String(status).toUpperCase() !== 'ALL') {
    listings = listings.filter(l => l.status.toUpperCase() === String(status).toUpperCase());
  }

  // Seller filter
  if (sellerId) {
    listings = listings.filter(l => l.sellerId === sellerId);
  }

  // Search keyword (Title, description, category, brand, model)
  if (q && typeof q === 'string' && q.trim()) {
    const query = q.toLowerCase().trim();
    listings = listings.filter(l =>
      l.title.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query) ||
      l.categoryName.toLowerCase().includes(query) ||
      (l.brand && l.brand.toLowerCase().includes(query)) ||
      (l.model && l.model.toLowerCase().includes(query))
    );
  }

  // Category filter
  if (categoryId && categoryId !== 'all') {
    listings = listings.filter(l => l.categoryId === categoryId);
  }

  // Condition filter
  if (condition && condition !== 'all') {
    listings = listings.filter(l => l.condition === condition);
  }

  // Price range
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) listings = listings.filter(l => l.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) listings = listings.filter(l => l.price <= max);
  }

  // Negotiable only
  if (negotiableOnly === 'true') {
    listings = listings.filter(l => l.isNegotiable);
  }

  // Meetup location
  if (meetupLocationId && meetupLocationId !== 'all') {
    listings = listings.filter(l => l.preferredMeetupId === meetupLocationId);
  }

  // Department filter
  if (department && department !== 'all') {
    listings = listings.filter(l => l.sellerDepartment && l.sellerDepartment.toLowerCase().includes((department as string).toLowerCase()));
  }

  // Sorting
  switch (sort) {
    case 'lowest_price':
      listings.sort((a, b) => a.price - b.price);
      break;
    case 'highest_price':
      listings.sort((a, b) => b.price - a.price);
      break;
    case 'oldest':
      listings.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'most_popular':
      listings.sort((a, b) => (b.viewCount + b.favoritesCount * 2) - (a.viewCount + a.favoritesCount * 2));
      break;
    case 'newest':
    default:
      listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  res.json(listings);
});

// Get single listing by ID and increment view count
apiRouter.get('/listings/:id', (req: AuthenticatedRequest, res: Response) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }
  listing.viewCount += 1;
  db.persist();

  // Check if current user favorited this listing
  let isFavorited = false;
  if (req.user) {
    isFavorited = db.getFavorites().some(f => f.userId === req.user!.id && f.listingId === listing.id);
  }

  res.json({ ...listing, isFavorited });
});

// Create listing (requires verified campus user)
apiRouter.post('/listings', requireAuth, requireVerified, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      title,
      description,
      categoryId,
      price,
      condition,
      quantity = 1,
      images = [],
      isNegotiable = true,
      brand,
      model,
      itemYear,
      originalPrice,
      purchaseDate,
      additionalNotes,
      preferredMeetupId,
    } = req.body;

    if (!title || !description || !categoryId || price === undefined || !condition) {
      res.status(400).json({ error: 'Title, description, category, price, and condition are required.' });
      return;
    }

    const category = db.getCategories().find(c => c.id === categoryId);
    if (!category) {
      res.status(400).json({ error: 'Invalid category selected.' });
      return;
    }

    const meetup = preferredMeetupId ? db.getMeetupLocations().find(m => m.id === preferredMeetupId) : undefined;

    // Check for prohibited content
    const prohibitedCheck = checkForProhibitedContent(title, description);

    // Fallback image if none provided
    const listingImages = Array.isArray(images) && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'];

    const newListing: Listing = {
      id: `lst-${crypto.randomUUID().slice(0, 8)}`,
      sellerId: user.id,
      sellerName: user.fullName,
      sellerRole: user.role,
      sellerDepartment: user.departmentName,
      sellerRating: user.reputationRating,
      sellerCompletedCount: user.completedTransactions,
      sellerAvatar: user.profilePictureUrl,
      title: title.trim(),
      description: description.trim(),
      categoryId: category.id,
      categoryName: category.name,
      price: parseFloat(price),
      condition,
      quantity: parseInt(quantity, 10) || 1,
      status: 'AVAILABLE',
      isNegotiable: !!isNegotiable,
      brand: brand?.trim() || undefined,
      model: model?.trim() || undefined,
      itemYear: itemYear?.trim() || undefined,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      purchaseDate: purchaseDate?.trim() || undefined,
      additionalNotes: additionalNotes?.trim() || undefined,
      preferredMeetupId: meetup ? meetup.id : undefined,
      preferredMeetupName: meetup ? meetup.name : 'University Student Center (Main Atrium)',
      campusZone: meetup ? meetup.campusZone : 'Central Campus',
      images: listingImages,
      viewCount: 0,
      favoritesCount: 0,
      offersCount: 0,
      isFlagged: prohibitedCheck.isFlagged,
      flagReason: prohibitedCheck.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.getListings().unshift(newListing);
    db.logAudit('USER_CREATED_LISTING', 'listing', newListing.id, { id: user.id, name: user.fullName });
    db.persist();

    res.status(201).json(newListing);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create listing.' });
  }
});

// Edit listing
apiRouter.patch('/listings/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  // Verify ownership or Admin authority
  if (listing.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Unauthorized: You can only edit your own listings.' });
    return;
  }

  const {
    title,
    description,
    categoryId,
    price,
    condition,
    quantity,
    images,
    isNegotiable,
    brand,
    model,
    itemYear,
    originalPrice,
    preferredMeetupId,
    status,
  } = req.body;

  if (title) listing.title = title.trim();
  if (description) listing.description = description.trim();
  if (categoryId) {
    const cat = db.getCategories().find(c => c.id === categoryId);
    if (cat) {
      listing.categoryId = cat.id;
      listing.categoryName = cat.name;
    }
  }
  if (price !== undefined) listing.price = parseFloat(price);
  if (condition) listing.condition = condition;
  if (quantity !== undefined) listing.quantity = parseInt(quantity, 10);
  if (images && Array.isArray(images) && images.length > 0) listing.images = images;
  if (isNegotiable !== undefined) listing.isNegotiable = !!isNegotiable;
  if (brand !== undefined) listing.brand = brand;
  if (model !== undefined) listing.model = model;
  if (itemYear !== undefined) listing.itemYear = itemYear;
  if (originalPrice !== undefined) listing.originalPrice = originalPrice ? parseFloat(originalPrice) : undefined;
  if (preferredMeetupId) {
    const meetup = db.getMeetupLocations().find(m => m.id === preferredMeetupId);
    if (meetup) {
      listing.preferredMeetupId = meetup.id;
      listing.preferredMeetupName = meetup.name;
      listing.campusZone = meetup.campusZone;
    }
  }
  if (status) {
    listing.status = status;
  }

  listing.updatedAt = new Date().toISOString();
  db.persist();

  res.json(listing);
});

// Update listing status (AVAILABLE, RESERVED, SOLD)
apiRouter.patch('/listings/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  if (listing.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Unauthorized to change this listing status.' });
    return;
  }

  const { status } = req.body;
  if (!['AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status value.' });
    return;
  }

  listing.status = status;
  listing.updatedAt = new Date().toISOString();
  db.persist();

  res.json(listing);
});

// Delete / Archive listing
apiRouter.delete('/listings/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  if (listing.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  listing.status = 'REMOVED';
  db.logAudit('USER_DELETED_LISTING', 'listing', listing.id, { id: req.user!.id, name: req.user!.fullName });
  db.persist();

  res.json({ message: 'Listing removed successfully.' });
});

// ==========================================
// 4. FAVORITES
// ==========================================

apiRouter.get('/favorites', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userFavorites = db.getFavorites().filter(f => f.userId === req.user!.id);
  const favoriteListingIds = userFavorites.map(f => f.listingId);
  const listings = db.getListings().filter(l => favoriteListingIds.includes(l.id) && l.status !== 'REMOVED');
  res.json(listings);
});

apiRouter.post('/listings/:id/favorite', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  const existing = db.getFavorites().find(f => f.userId === req.user!.id && f.listingId === listing.id);
  if (existing) {
    res.json({ favorited: true, favoritesCount: listing.favoritesCount });
    return;
  }

  const newFav = {
    id: `fav-${crypto.randomUUID().slice(0, 8)}`,
    userId: req.user!.id,
    listingId: listing.id,
    createdAt: new Date().toISOString(),
  };

  db.getFavorites().push(newFav);
  listing.favoritesCount += 1;
  db.persist();

  res.json({ favorited: true, favoritesCount: listing.favoritesCount });
});

apiRouter.delete('/listings/:id/favorite', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const listing = db.getListingById(req.params.id);
  const index = db.getFavorites().findIndex(f => f.userId === req.user!.id && f.listingId === req.params.id);

  if (index !== -1) {
    db.getFavorites().splice(index, 1);
    if (listing && listing.favoritesCount > 0) {
      listing.favoritesCount -= 1;
    }
    db.persist();
  }

  res.json({ favorited: false, favoritesCount: listing ? listing.favoritesCount : 0 });
});

// ==========================================
// 5. IN-APP MESSAGING
// ==========================================

// Get user conversations
apiRouter.get('/conversations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const conversations = db.getConversations().filter(
    c => c.buyerId === userId || c.sellerId === userId
  ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  res.json(conversations);
});

// Start or get conversation for a listing
apiRouter.post('/conversations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { listingId, initialMessage } = req.body;
  const listing = listingId ? db.getListingById(listingId) : undefined;
  const buyerId = req.user!.id;

  if (!listing) {
    res.status(400).json({ error: 'Listing is required to initiate marketplace conversation.' });
    return;
  }

  if (listing.sellerId === buyerId) {
    res.status(400).json({ error: 'You cannot message yourself as the seller.' });
    return;
  }

  // Find existing conversation
  let conv = db.getConversations().find(
    c => c.listingId === listing.id && c.buyerId === buyerId && c.sellerId === listing.sellerId
  );

  const seller = db.getUserById(listing.sellerId);

  if (!conv) {
    conv = {
      id: `conv-${crypto.randomUUID().slice(0, 8)}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.images[0],
      listingStatus: listing.status,
      buyerId,
      buyerName: req.user!.fullName,
      buyerAvatar: req.user!.profilePictureUrl,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName || (seller ? seller.fullName : 'Campus Seller'),
      sellerAvatar: listing.sellerAvatar || (seller ? seller.profilePictureUrl : undefined),
      lastMessageText: initialMessage || 'Hi! Is this still available?',
      lastMessageAt: new Date().toISOString(),
      buyerUnreadCount: 0,
      sellerUnreadCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.getConversations().unshift(conv);

    // Initial message
    const msg: Message = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      conversationId: conv.id,
      senderId: buyerId,
      senderName: req.user!.fullName,
      receiverId: listing.sellerId,
      content: initialMessage || 'Hi! Is this still available?',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.getMessages().push(msg);

    // Notify seller
    db.createNotification({
      recipientId: listing.sellerId,
      senderId: buyerId,
      senderName: req.user!.fullName,
      type: 'NEW_MESSAGE',
      title: `Message regarding "${listing.title}"`,
      message: `${req.user!.fullName}: "${msg.content}"`,
      relatedEntityType: 'conversation',
      relatedEntityId: conv.id,
    });

    db.persist();
  }

  res.json(conv);
});

// Get messages for conversation
apiRouter.get('/conversations/:id/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const conv = db.getConversations().find(c => c.id === req.params.id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }

  if (conv.buyerId !== req.user!.id && conv.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  // Mark unread messages as read
  db.getMessages().forEach(m => {
    if (m.conversationId === conv.id && m.receiverId === req.user!.id && !m.isRead) {
      m.isRead = true;
      m.readAt = new Date().toISOString();
    }
  });

  if (conv.buyerId === req.user!.id) {
    conv.buyerUnreadCount = 0;
  } else {
    conv.sellerUnreadCount = 0;
  }
  db.persist();

  const messages = db.getMessages().filter(m => m.conversationId === conv.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({ conversation: conv, messages });
});

// Send message
apiRouter.post('/conversations/:id/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const conv = db.getConversations().find(c => c.id === req.params.id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }

  const senderId = req.user!.id;
  if (conv.buyerId !== senderId && conv.sellerId !== senderId) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  const { content } = req.body;
  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Message content cannot be empty.' });
    return;
  }

  const receiverId = conv.buyerId === senderId ? conv.sellerId : conv.buyerId;

  const msg: Message = {
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    conversationId: conv.id,
    senderId,
    senderName: req.user!.fullName,
    receiverId,
    content: content.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  db.getMessages().push(msg);

  conv.lastMessageText = msg.content;
  conv.lastMessageAt = msg.createdAt;
  if (receiverId === conv.buyerId) {
    conv.buyerUnreadCount += 1;
  } else {
    conv.sellerUnreadCount += 1;
  }

  db.createNotification({
    recipientId: receiverId,
    senderId,
    senderName: req.user!.fullName,
    type: 'NEW_MESSAGE',
    title: `New message from ${req.user!.fullName}`,
    message: msg.content,
    relatedEntityType: 'conversation',
    relatedEntityId: conv.id,
  });

  db.persist();
  res.status(201).json(msg);
});

// ==========================================
// 6. OFFERS & NEGOTIATION
// ==========================================

apiRouter.get('/offers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { listingId } = req.query;

  let offers = db.getOffers().filter(o => o.buyerId === userId || o.sellerId === userId);
  if (listingId) {
    offers = offers.filter(o => o.listingId === listingId);
  }

  res.json(offers);
});

apiRouter.post('/offers', requireAuth, requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const { listingId, offeredPrice, note } = req.body;
  const listing = db.getListingById(listingId);

  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  if (listing.sellerId === req.user!.id) {
    res.status(400).json({ error: 'You cannot make an offer on your own listing.' });
    return;
  }

  if (listing.status !== 'AVAILABLE') {
    res.status(400).json({ error: `This item is currently ${listing.status.toLowerCase()} and cannot receive offers.` });
    return;
  }

  const price = parseFloat(offeredPrice);
  if (isNaN(price) || price <= 0) {
    res.status(400).json({ error: 'Please enter a valid positive offer price.' });
    return;
  }

  const newOffer: Offer = {
    id: `ofr-${crypto.randomUUID().slice(0, 8)}`,
    listingId: listing.id,
    listingTitle: listing.title,
    listingPrice: listing.price,
    listingImage: listing.images[0],
    buyerId: req.user!.id,
    buyerName: req.user!.fullName,
    buyerAvatar: req.user!.profilePictureUrl,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName || 'Campus Seller',
    offeredPrice: price,
    status: 'PENDING',
    buyerNote: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.getOffers().unshift(newOffer);
  listing.offersCount += 1;

  // Find or create conversation for buyer and seller for this listing
  let conv = db.getConversations().find(
    c => c.listingId === listing.id && c.buyerId === req.user!.id && c.sellerId === listing.sellerId
  );

  const offerMessageContent = `🤝 Sent an offer of ₱${price.toLocaleString()}${note ? ` — "${note}"` : ''}`;

  if (!conv) {
    conv = {
      id: `cnv-${crypto.randomUUID().slice(0, 8)}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.images[0],
      listingStatus: listing.status,
      buyerId: req.user!.id,
      buyerName: req.user!.fullName,
      buyerAvatar: req.user!.profilePictureUrl,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName || 'Campus Seller',
      sellerAvatar: listing.sellerAvatar,
      lastMessageText: offerMessageContent,
      lastMessageAt: new Date().toISOString(),
      buyerUnreadCount: 0,
      sellerUnreadCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.getConversations().unshift(conv);
  } else {
    conv.lastMessageText = offerMessageContent;
    conv.lastMessageAt = new Date().toISOString();
    conv.sellerUnreadCount += 1;
    conv.updatedAt = new Date().toISOString();
  }

  // Feed offer message into conversation stream
  const msg: Message = {
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    conversationId: conv.id,
    senderId: req.user!.id,
    senderName: req.user!.fullName,
    receiverId: listing.sellerId,
    content: offerMessageContent,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  db.getMessages().push(msg);

  // Notify seller - directs straight to the conversation!
  db.createNotification({
    recipientId: listing.sellerId,
    senderId: req.user!.id,
    senderName: req.user!.fullName,
    type: 'NEW_OFFER',
    title: `New offer of ₱${price.toLocaleString()} for "${listing.title}"`,
    message: `${req.user!.fullName} offered ₱${price.toLocaleString()} (Listed price: ₱${listing.price.toLocaleString()}). Click to open chat and accept or counter!`,
    relatedEntityType: 'conversation',
    relatedEntityId: conv.id,
  });

  db.persist();
  res.status(201).json({ ...newOffer, conversationId: conv.id });
});

// Update offer status: ACCEPT, REJECT, COUNTER, CANCEL
apiRouter.patch('/offers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const offer = db.getOffers().find(o => o.id === req.params.id);
  if (!offer) {
    res.status(404).json({ error: 'Offer not found.' });
    return;
  }

  const { action, counterPrice, sellerNote } = req.body;
  const isSeller = offer.sellerId === req.user!.id;
  const isBuyer = offer.buyerId === req.user!.id;

  if (!isSeller && !isBuyer) {
    res.status(403).json({ error: 'Unauthorized to modify this offer.' });
    return;
  }

  const listing = db.getListingById(offer.listingId);

  // Locate associated conversation
  const conv = db.getConversations().find(
    c => c.listingId === offer.listingId &&
    ((c.buyerId === offer.buyerId && c.sellerId === offer.sellerId) ||
     (c.buyerId === offer.sellerId && c.sellerId === offer.buyerId))
  );

  const otherPartyId = isSeller ? offer.buyerId : offer.sellerId;
  const otherPartyName = isSeller ? offer.buyerName : offer.sellerName;

  if (action === 'ACCEPT') {
    if (offer.status === 'ACCEPTED') {
      res.status(400).json({ error: 'This offer is already accepted.' });
      return;
    }

    const finalAgreedPrice = offer.counterPrice && offer.counterPrice > 0 ? offer.counterPrice : offer.offeredPrice;
    offer.status = 'ACCEPTED';
    offer.sellerNote = sellerNote || offer.sellerNote;
    offer.updatedAt = new Date().toISOString();

    // Automatically transition listing to RESERVED if available
    if (listing && listing.status === 'AVAILABLE') {
      listing.status = 'RESERVED';
      listing.updatedAt = new Date().toISOString();
    }

    // Auto-create or link active transaction reservation
    const meetupName = listing?.preferredMeetupName || 'University Student Center (Main Atrium)';
    const meetupId = listing?.preferredMeetupId || 'loc-1';

    const transaction: Transaction = {
      id: `txn-${crypto.randomUUID().slice(0, 8)}`,
      listingId: offer.listingId,
      listingTitle: offer.listingTitle || (listing ? listing.title : 'Marketplace Item'),
      listingImage: offer.listingImage || (listing ? listing.images[0] : undefined),
      buyerId: offer.buyerId,
      buyerName: offer.buyerName,
      sellerId: offer.sellerId,
      sellerName: offer.sellerName,
      offerId: offer.id,
      agreedPrice: finalAgreedPrice,
      meetupLocationId: meetupId,
      meetupLocationName: meetupName,
      scheduledDate: 'Coordination in progress',
      status: 'RESERVED',
      notes: `Offer accepted at ₱${finalAgreedPrice.toLocaleString()}. Coordinate campus meetup via chat.`,
      buyerConfirmedCompletion: false,
      sellerConfirmedCompletion: false,
      createdAt: new Date().toISOString(),
    };
    db.getTransactions().unshift(transaction);

    // Feed acceptance message into chat
    const acceptMsg = `🎉 Offer of ₱${finalAgreedPrice.toLocaleString()} has been ACCEPTED by ${req.user!.fullName}! The item is now RESERVED. Let's arrange a campus meetup.`;
    if (conv) {
      conv.lastMessageText = acceptMsg;
      conv.lastMessageAt = new Date().toISOString();
      if (isSeller) conv.buyerUnreadCount += 1;
      else conv.sellerUnreadCount += 1;
      conv.listingStatus = 'RESERVED';
      db.getMessages().push({
        id: `msg-${crypto.randomUUID().slice(0, 8)}`,
        conversationId: conv.id,
        senderId: req.user!.id,
        senderName: req.user!.fullName,
        receiverId: otherPartyId,
        content: acceptMsg,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Notify other party
    db.createNotification({
      recipientId: otherPartyId,
      senderId: req.user!.id,
      senderName: req.user!.fullName,
      type: 'OFFER_ACCEPTED',
      title: `Offer ACCEPTED for "${offer.listingTitle}"!`,
      message: `${req.user!.fullName} accepted the offer of ₱${finalAgreedPrice.toLocaleString()}. Item is now reserved! Click to coordinate meetup in chat.`,
      relatedEntityType: 'conversation',
      relatedEntityId: conv ? conv.id : transaction.id,
    });

  } else if (action === 'REJECT') {
    offer.status = 'REJECTED';
    if (sellerNote) {
      if (isSeller) offer.sellerNote = sellerNote;
      else offer.buyerNote = sellerNote;
    }
    offer.updatedAt = new Date().toISOString();

    const declineMsg = `❌ Offer was declined by ${req.user!.fullName}.${sellerNote ? ` ("${sellerNote}")` : ''}`;
    if (conv) {
      conv.lastMessageText = declineMsg;
      conv.lastMessageAt = new Date().toISOString();
      if (isSeller) conv.buyerUnreadCount += 1;
      else conv.sellerUnreadCount += 1;
      db.getMessages().push({
        id: `msg-${crypto.randomUUID().slice(0, 8)}`,
        conversationId: conv.id,
        senderId: req.user!.id,
        senderName: req.user!.fullName,
        receiverId: otherPartyId,
        content: declineMsg,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.createNotification({
      recipientId: otherPartyId,
      senderId: req.user!.id,
      senderName: req.user!.fullName,
      type: 'OFFER_REJECTED',
      title: `Offer declined for "${offer.listingTitle}"`,
      message: `${req.user!.fullName} declined the offer of ₱${offer.offeredPrice.toLocaleString()}. Click to chat or propose an alternative.`,
      relatedEntityType: 'conversation',
      relatedEntityId: conv ? conv.id : offer.id,
    });

  } else if (action === 'COUNTER') {
    const cPrice = parseFloat(counterPrice);
    if (isNaN(cPrice) || cPrice <= 0) {
      res.status(400).json({ error: 'Valid counteroffer price is required.' });
      return;
    }
    offer.status = 'COUNTERED';
    offer.counterPrice = cPrice;
    if (isSeller) {
      offer.sellerNote = sellerNote || offer.sellerNote;
    } else {
      offer.buyerNote = sellerNote || offer.buyerNote;
    }
    offer.updatedAt = new Date().toISOString();

    const roleLabel = isSeller ? 'Seller' : 'Buyer';
    const counterMsg = `🔄 Counter-offer from ${roleLabel} (${req.user!.fullName}): ₱${cPrice.toLocaleString()}${sellerNote ? ` ("${sellerNote}")` : ''}`;
    if (conv) {
      conv.lastMessageText = counterMsg;
      conv.lastMessageAt = new Date().toISOString();
      if (isSeller) conv.buyerUnreadCount += 1;
      else conv.sellerUnreadCount += 1;
      db.getMessages().push({
        id: `msg-${crypto.randomUUID().slice(0, 8)}`,
        conversationId: conv.id,
        senderId: req.user!.id,
        senderName: req.user!.fullName,
        receiverId: otherPartyId,
        content: counterMsg,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.createNotification({
      recipientId: otherPartyId,
      senderId: req.user!.id,
      senderName: req.user!.fullName,
      type: 'COUNTEROFFER',
      title: `Counteroffer for "${offer.listingTitle}": ₱${cPrice.toLocaleString()}`,
      message: `${req.user!.fullName} sent a counteroffer of ₱${cPrice.toLocaleString()}. Click to open chat and review!`,
      relatedEntityType: 'conversation',
      relatedEntityId: conv ? conv.id : offer.id,
    });

  } else if (action === 'CANCEL') {
    offer.status = 'CANCELLED';
    offer.updatedAt = new Date().toISOString();
  }

  db.persist();
  res.json({ ...offer, conversationId: conv?.id });
});

// ==========================================
// 7. TRANSACTIONS & MEETUPS
// ==========================================

apiRouter.get('/transactions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  // Admin can view all, regular users only view their own
  let txns = role === 'ADMIN'
    ? db.getTransactions()
    : db.getTransactions().filter(t => t.buyerId === userId || t.sellerId === userId);

  const { status } = req.query;
  if (status && status !== 'ALL') {
    txns = txns.filter(t => t.status === status);
  }

  res.json(txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

// Create manual transaction / reservation
apiRouter.post('/transactions', requireAuth, requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const { listingId, buyerId, agreedPrice, meetupLocationId, scheduledDate, notes } = req.body;
  const listing = db.getListingById(listingId);

  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  if (listing.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Only the seller can create a transaction reservation.' });
    return;
  }

  const buyer = db.getUserById(buyerId);
  if (!buyer) {
    res.status(400).json({ error: 'Valid buyer is required.' });
    return;
  }

  const meetup = db.getMeetupLocations().find(m => m.id === meetupLocationId) || db.getMeetupLocations()[0];

  const transaction: Transaction = {
    id: `txn-${crypto.randomUUID().slice(0, 8)}`,
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0],
    buyerId: buyer.id,
    buyerName: buyer.fullName,
    sellerId: req.user!.id,
    sellerName: req.user!.fullName,
    agreedPrice: parseFloat(agreedPrice) || listing.price,
    meetupLocationId: meetup.id,
    meetupLocationName: meetup.name,
    scheduledDate: scheduledDate || 'Tomorrow 2:00 PM',
    status: 'RESERVED',
    notes,
    buyerConfirmedCompletion: false,
    sellerConfirmedCompletion: false,
    createdAt: new Date().toISOString(),
  };

  listing.status = 'RESERVED';
  db.getTransactions().unshift(transaction);

  db.createNotification({
    recipientId: buyer.id,
    senderId: req.user!.id,
    senderName: req.user!.fullName,
    type: 'TRANSACTION_RESERVED',
    title: `Campus Meetup Scheduled: "${listing.title}"`,
    message: `Scheduled at ${meetup.name} on ${transaction.scheduledDate}.`,
    relatedEntityType: 'transaction',
    relatedEntityId: transaction.id,
  });

  db.persist();
  res.status(201).json(transaction);
});

// Complete or update transaction
apiRouter.patch('/transactions/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const txn = db.getTransactions().find(t => t.id === req.params.id);
  if (!txn) {
    res.status(404).json({ error: 'Transaction not found.' });
    return;
  }

  const isBuyer = txn.buyerId === req.user!.id;
  const isSeller = txn.sellerId === req.user!.id;
  const isAdmin = req.user!.role === 'ADMIN';

  if (!isBuyer && !isSeller && !isAdmin) {
    res.status(403).json({ error: 'Unauthorized to update this transaction.' });
    return;
  }

  const { action, scheduledDate, meetupLocationId, notes } = req.body;

  if (action === 'COMPLETE') {
    // Mark confirmed
    if (isBuyer) txn.buyerConfirmedCompletion = true;
    if (isSeller) txn.sellerConfirmedCompletion = true;
    if (isAdmin) {
      txn.buyerConfirmedCompletion = true;
      txn.sellerConfirmedCompletion = true;
    }

    // If both parties confirm (or one confirms and completes transaction)
    txn.status = 'COMPLETED';
    txn.completedAt = new Date().toISOString();

    // Mark listing as SOLD
    const listing = db.getListingById(txn.listingId);
    if (listing) {
      listing.status = 'SOLD';
      listing.updatedAt = new Date().toISOString();
    }

    // Increment completed transactions count on both user profiles
    const buyer = db.getUserById(txn.buyerId);
    const seller = db.getUserById(txn.sellerId);
    if (buyer) buyer.completedTransactions += 1;
    if (seller) seller.completedTransactions += 1;

    // Notify other party
    const otherUserId = isBuyer ? txn.sellerId : txn.buyerId;
    db.createNotification({
      recipientId: otherUserId,
      senderId: req.user!.id,
      senderName: req.user!.fullName,
      type: 'TRANSACTION_COMPLETED',
      title: 'Transaction Completed! Please Leave a Review',
      message: `The transaction for "${txn.listingTitle}" has been marked as completed. You can now leave a rating!`,
      relatedEntityType: 'transaction',
      relatedEntityId: txn.id,
    });

  } else if (action === 'CANCEL') {
    txn.status = 'CANCELLED';
    txn.cancelledAt = new Date().toISOString();
    const listing = db.getListingById(txn.listingId);
    if (listing && listing.status === 'RESERVED') {
      listing.status = 'AVAILABLE';
    }
  } else if (action === 'UPDATE_MEETUP') {
    if (scheduledDate) txn.scheduledDate = scheduledDate;
    if (meetupLocationId) {
      const loc = db.getMeetupLocations().find(l => l.id === meetupLocationId);
      if (loc) {
        txn.meetupLocationId = loc.id;
        txn.meetupLocationName = loc.name;
      }
    }
    if (notes) txn.notes = notes;
  }

  db.persist();
  res.json(txn);
});

// ==========================================
// 8. REVIEWS & RATINGS
// ==========================================

apiRouter.get('/reviews/user/:userId', (req: Request, res: Response) => {
  const reviews = db.getReviews().filter(r => r.reviewedUserId === req.params.userId);
  res.json(reviews);
});

apiRouter.post('/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const {
    transactionId,
    rating,
    communicationRating = 5,
    itemAccuracyRating = 5,
    meetupRating = 5,
    comment,
  } = req.body;

  const txn = db.getTransactions().find(t => t.id === transactionId);
  if (!txn) {
    res.status(404).json({ error: 'Transaction not found.' });
    return;
  }

  // Prevent reviewing transactions that have not reached COMPLETED status
  if (txn.status !== 'COMPLETED') {
    res.status(400).json({ error: 'Reviews can only be submitted for completed transactions.' });
    return;
  }

  const reviewerId = req.user!.id;
  const isBuyer = txn.buyerId === reviewerId;
  const isSeller = txn.sellerId === reviewerId;

  if (!isBuyer && !isSeller) {
    res.status(403).json({ error: 'Only parties to this transaction can leave a review.' });
    return;
  }

  // Prevent duplicate reviews for the same transaction from the same user
  const existingReview = db.getReviews().find(r => r.transactionId === txn.id && r.reviewerId === reviewerId);
  if (existingReview) {
    res.status(400).json({ error: 'You have already submitted a review for this transaction.' });
    return;
  }

  const reviewedUserId = isBuyer ? txn.sellerId : txn.buyerId;
  const reviewedUser = db.getUserById(reviewedUserId);

  const starRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

  const review: Review = {
    id: `rev-${crypto.randomUUID().slice(0, 8)}`,
    transactionId: txn.id,
    reviewerId,
    reviewerName: req.user!.fullName,
    reviewerAvatar: req.user!.profilePictureUrl,
    reviewedUserId,
    listingId: txn.listingId,
    listingTitle: txn.listingTitle,
    rating: starRating,
    communicationRating: Math.max(1, Math.min(5, parseInt(communicationRating, 10) || 5)),
    itemAccuracyRating: Math.max(1, Math.min(5, parseInt(itemAccuracyRating, 10) || 5)),
    meetupRating: Math.max(1, Math.min(5, parseInt(meetupRating, 10) || 5)),
    comment: comment ? comment.trim() : 'Great transaction on campus!',
    createdAt: new Date().toISOString(),
  };

  db.getReviews().unshift(review);

  // Recalculate target user reputation rating
  if (reviewedUser) {
    const allUserReviews = db.getReviews().filter(r => r.reviewedUserId === reviewedUser.id);
    const sum = allUserReviews.reduce((acc, r) => acc + r.rating, 0);
    reviewedUser.reputationRating = Math.round((sum / allUserReviews.length) * 100) / 100;
    reviewedUser.totalReviews = allUserReviews.length;
  }

  db.createNotification({
    recipientId: reviewedUserId,
    senderId: reviewerId,
    senderName: req.user!.fullName,
    type: 'NEW_REVIEW',
    title: `New ${starRating}-Star Review Received!`,
    message: `${req.user!.fullName} left you a review: "${review.comment}"`,
    relatedEntityType: 'review',
    relatedEntityId: review.id,
  });

  db.persist();
  res.status(201).json(review);
});

// ==========================================
// 9. "LOOKING FOR" POSTS
// ==========================================

apiRouter.get('/looking-for', (req: Request, res: Response) => {
  const { q, categoryId, status = 'ACTIVE' } = req.query;

  let posts = db.getLookingForPosts();
  if (status && status !== 'ALL') {
    posts = posts.filter(p => p.status === status);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const query = q.toLowerCase();
    posts = posts.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }

  if (categoryId && categoryId !== 'all') {
    posts = posts.filter(p => p.categoryId === categoryId);
  }

  res.json(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

apiRouter.post('/looking-for', requireAuth, requireVerified, (req: AuthenticatedRequest, res: Response) => {
  const { title, description, categoryId, minBudget, maxBudget, preferredMeetupName } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required.' });
    return;
  }

  const category = categoryId ? db.getCategories().find(c => c.id === categoryId) : undefined;

  const post: LookingForPost = {
    id: `lf-${crypto.randomUUID().slice(0, 8)}`,
    authorId: req.user!.id,
    authorName: req.user!.fullName,
    authorDepartment: req.user!.departmentName,
    authorAvatar: req.user!.profilePictureUrl,
    title: title.trim(),
    description: description.trim(),
    categoryId: category?.id,
    categoryName: category?.name,
    minBudget: minBudget ? parseFloat(minBudget) : undefined,
    maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
    preferredMeetupName: preferredMeetupName || 'University Student Center',
    status: 'ACTIVE',
    responseCount: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.getLookingForPosts().unshift(post);
  db.persist();
  res.status(201).json(post);
});

apiRouter.patch('/looking-for/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const post = db.getLookingForPosts().find(p => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Looking For post not found.' });
    return;
  }

  if (post.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  const { status, title, description } = req.body;
  if (status) post.status = status;
  if (title) post.title = title;
  if (description) post.description = description;

  db.persist();
  res.json(post);
});

// ==========================================
// 10. USER PUBLIC PROFILE
// ==========================================

apiRouter.get('/users/:id/profile', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const sanitized = db.getSanitizedUser(user);
  const activeListings = db.getListings().filter(l => l.sellerId === user.id && l.status === 'AVAILABLE');
  const pastListings = db.getListings().filter(l => l.sellerId === user.id && l.status === 'SOLD');
  const reviews = db.getReviews().filter(r => r.reviewedUserId === user.id);

  res.json({
    profile: sanitized,
    activeListings,
    soldCount: pastListings.length,
    reviews,
  });
});

// ==========================================
// 11. REPORTS & SAFETY
// ==========================================

apiRouter.post('/reports', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { reportedUserId, listingId, reason, description } = req.body;

  if (!reason || !description) {
    res.status(400).json({ error: 'Reason and description are required.' });
    return;
  }

  const reportedUser = reportedUserId ? db.getUserById(reportedUserId) : undefined;
  const listing = listingId ? db.getListingById(listingId) : undefined;

  const report: Report = {
    id: `rep-${crypto.randomUUID().slice(0, 8)}`,
    reporterId: req.user!.id,
    reporterName: req.user!.fullName,
    reportedUserId,
    reportedUserName: reportedUser?.fullName,
    listingId,
    listingTitle: listing?.title,
    reason,
    description: description.trim(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.getReports().unshift(report);

  // If listing was reported for Prohibited Item or Scam, flag listing for admin review
  if (listing && (reason === 'Prohibited Item' || reason === 'Scam / Fraud')) {
    listing.isFlagged = true;
    listing.flagReason = `Reported by user for: ${reason}`;
  }

  db.logAudit('USER_SUBMITTED_REPORT', 'report', report.id, { id: req.user!.id, name: req.user!.fullName }, { reason });
  db.persist();

  res.status(201).json({ message: 'Report submitted. Campus safety moderators will review this promptly.', report });
});

// ==========================================
// 12. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.getNotifications().filter(n => n.recipientId === req.user!.id);
  res.json(notifs);
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notif = db.getNotifications().find(n => n.id === req.params.id && n.recipientId === req.user!.id);
  if (notif) {
    notif.isRead = true;
    db.persist();
  }
  res.json({ success: true });
});

apiRouter.patch('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.getNotifications().forEach(n => {
    if (n.recipientId === req.user!.id) {
      n.isRead = true;
    }
  });
  db.persist();
  res.json({ success: true });
});

// ==========================================
// 13. ADMINISTRATOR DASHBOARD & MODERATION
// ==========================================

// Analytics
apiRouter.get('/admin/analytics', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const listings = db.getListings();
  const transactions = db.getTransactions();
  const reports = db.getReports();
  const categories = db.getCategories();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isSuspended).length;
  const totalListings = listings.filter(l => l.status !== 'REMOVED').length;
  const activeListings = listings.filter(l => l.status === 'AVAILABLE').length;
  const reservedListings = listings.filter(l => l.status === 'RESERVED').length;
  const soldListings = listings.filter(l => l.status === 'SOLD').length;
  const completedTxns = transactions.filter(t => t.status === 'COMPLETED').length;
  const totalVolume = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.agreedPrice, 0);

  const pendingReports = reports.filter(r => r.status === 'PENDING').length;

  // Category breakdown
  const categoryStats = categories.map(cat => ({
    name: cat.name,
    count: listings.filter(l => l.categoryId === cat.id && l.status !== 'REMOVED').length,
  })).sort((a, b) => b.count - a.count);

  // Campus Demand Insights (Most searched / requested items)
  const demandInsights = [
    { term: 'Scientific Calculator (Casio / Sharp)', queryCount: 342, category: 'Calculators', demandLevel: 'HIGH' },
    { term: 'Engineering Mechanics Textbook', queryCount: 289, category: 'Textbooks', demandLevel: 'HIGH' },
    { term: 'Laboratory Coat & Goggles Set', queryCount: 245, category: 'Laboratory Equipment', demandLevel: 'HIGH' },
    { term: 'Lenovo / Apple Laptop for Drafting', queryCount: 198, category: 'Laptops', demandLevel: 'MEDIUM' },
    { term: 'Ergonomic Study Desk Chair', queryCount: 174, category: 'Dorm Furniture', demandLevel: 'MEDIUM' },
    { term: 'Official University Hoodie / Org Lanyard', queryCount: 156, category: 'Org Merchandise', demandLevel: 'MEDIUM' },
    { term: 'CPA Examination Board Reviewer', queryCount: 132, category: 'Review Materials', demandLevel: 'MEDIUM' },
  ];

  res.json({
    metrics: {
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      reservedListings,
      soldListings,
      completedTxns,
      totalVolume,
      pendingReports,
    },
    categoryStats,
    demandInsights,
  });
});

// Admin Users List & Actions
apiRouter.get('/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(u => db.getSanitizedUser(u));
  res.json(users);
});

apiRouter.patch('/admin/users/:id/suspend', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { isSuspended } = req.body;
  user.isSuspended = !!isSuspended;
  user.updatedAt = new Date().toISOString();

  db.logAudit(
    user.isSuspended ? 'ADMIN_SUSPENDED_USER' : 'ADMIN_UNSUSPENDED_USER',
    'user',
    user.id,
    { id: req.user!.id, name: req.user!.fullName },
    { targetEmail: user.universityEmail }
  );

  db.persist();
  res.json(db.getSanitizedUser(user));
});

apiRouter.patch('/admin/users/:id/verify', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  user.isVerified = true;
  user.updatedAt = new Date().toISOString();

  db.logAudit(
    'ADMIN_VERIFIED_USER',
    'user',
    user.id,
    { id: req.user!.id, name: req.user!.fullName }
  );

  db.persist();
  res.json(db.getSanitizedUser(user));
});

apiRouter.patch('/admin/users/:id/role', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { role } = req.body;
  if (!['STUDENT', 'FACULTY', 'STAFF', 'ADMIN'].includes(role)) {
    res.status(400).json({ error: 'Invalid role.' });
    return;
  }

  user.role = role;
  user.updatedAt = new Date().toISOString();

  db.logAudit(
    'ADMIN_CHANGED_USER_ROLE',
    'user',
    user.id,
    { id: req.user!.id, name: req.user!.fullName },
    { newRole: role }
  );

  db.persist();
  res.json(db.getSanitizedUser(user));
});

// Admin Reports List & Actions
apiRouter.get('/admin/reports', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getReports().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

apiRouter.patch('/admin/reports/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const report = db.getReports().find(r => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  const { status, resolutionNotes, removeListing, suspendUser } = req.body;

  if (status) report.status = status;
  if (resolutionNotes) report.resolutionNotes = resolutionNotes;
  report.resolvedBy = req.user!.id;
  report.resolvedByName = req.user!.fullName;
  report.resolvedAt = new Date().toISOString();

  if (removeListing && report.listingId) {
    const listing = db.getListingById(report.listingId);
    if (listing) {
      listing.status = 'REMOVED';
      db.logAudit('ADMIN_REMOVED_LISTING', 'listing', listing.id, { id: req.user!.id, name: req.user!.fullName }, { reason: report.reason });
    }
  }

  if (suspendUser && report.reportedUserId) {
    const usr = db.getUserById(report.reportedUserId);
    if (usr) {
      usr.isSuspended = true;
      db.logAudit('ADMIN_SUSPENDED_USER', 'user', usr.id, { id: req.user!.id, name: req.user!.fullName }, { reason: report.reason });
    }
  }

  db.logAudit('ADMIN_RESOLVED_REPORT', 'report', report.id, { id: req.user!.id, name: req.user!.fullName }, { status });
  db.persist();

  res.json(report);
});

// Admin Listing Moderation
apiRouter.patch('/admin/listings/:id/moderate', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found.' });
    return;
  }

  const { action, flagReason } = req.body;

  if (action === 'FLAG') {
    listing.isFlagged = true;
    listing.flagReason = flagReason || 'Flagged by campus moderator';
    db.logAudit('ADMIN_FLAGGED_LISTING', 'listing', listing.id, { id: req.user!.id, name: req.user!.fullName }, { flagReason });
  } else if (action === 'UNFLAG') {
    listing.isFlagged = false;
    listing.flagReason = undefined;
    db.logAudit('ADMIN_UNFLAGGED_LISTING', 'listing', listing.id, { id: req.user!.id, name: req.user!.fullName });
  } else if (action === 'REMOVE') {
    listing.status = 'REMOVED';
    db.logAudit('ADMIN_REMOVED_LISTING', 'listing', listing.id, { id: req.user!.id, name: req.user!.fullName });
  } else if (action === 'RESTORE') {
    listing.status = 'AVAILABLE';
    listing.isFlagged = false;
    db.logAudit('ADMIN_RESTORED_LISTING', 'listing', listing.id, { id: req.user!.id, name: req.user!.fullName });
  }

  listing.updatedAt = new Date().toISOString();
  db.persist();
  res.json(listing);
});

// Admin Categories CRUD
apiRouter.post('/admin/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, parentGroup, description, iconName } = req.body;
  if (!name || !parentGroup) {
    res.status(400).json({ error: 'Category name and group are required.' });
    return;
  }

  const newCat = {
    id: `cat-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    parentGroup,
    description: description || '',
    iconName: iconName || 'Tag',
    itemCount: 0,
  };

  db.getCategories().push(newCat);
  db.logAudit('ADMIN_CREATED_CATEGORY', 'category', newCat.id, { id: req.user!.id, name: req.user!.fullName }, { name });
  db.persist();

  res.status(201).json(newCat);
});

apiRouter.delete('/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getCategories().findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    const cat = db.getCategories()[index];
    db.getCategories().splice(index, 1);
    db.logAudit('ADMIN_DELETED_CATEGORY', 'category', cat.id, { id: req.user!.id, name: req.user!.fullName });
    db.persist();
  }
  res.json({ success: true });
});

// Admin Meetup Locations CRUD
apiRouter.post('/admin/meetup-locations', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, campusZone, description, safetyNotes } = req.body;
  if (!name || !campusZone) {
    res.status(400).json({ error: 'Location name and campus zone are required.' });
    return;
  }

  const newLoc = {
    id: `loc-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    campusZone: campusZone.trim(),
    description: description || 'Safe campus meetup zone.',
    safetyNotes: safetyNotes || 'Well-lit area under university campus security.',
    isActive: true,
  };

  db.getMeetupLocations().push(newLoc);
  db.logAudit('ADMIN_CREATED_MEETUP_LOCATION', 'meetup_location', newLoc.id, { id: req.user!.id, name: req.user!.fullName }, { name });
  db.persist();

  res.status(201).json(newLoc);
});

apiRouter.delete('/admin/meetup-locations/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const loc = db.getMeetupLocations().find(l => l.id === req.params.id);
  if (loc) {
    loc.isActive = false;
    db.logAudit('ADMIN_DEACTIVATED_MEETUP_LOCATION', 'meetup_location', loc.id, { id: req.user!.id, name: req.user!.fullName });
    db.persist();
  }
  res.json({ success: true });
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getAuditLogs());
});
