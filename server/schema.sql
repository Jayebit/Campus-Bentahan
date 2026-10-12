-- ==========================================================
-- CampusMarket: PostgreSQL Relational Database Schema
-- Campus-Based Marketplace for Academic & Personal Items
-- ==========================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    college VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    university_email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    student_employee_id VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'FACULTY', 'STAFF', 'ADMIN')),
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(150),
    year_level VARCHAR(30),
    profile_picture_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    verification_badge VARCHAR(50) DEFAULT '✓ Verified Campus User',
    is_suspended BOOLEAN DEFAULT FALSE,
    reputation_rating NUMERIC(3, 2) DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    completed_transactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_group VARCHAR(50) NOT NULL CHECK (parent_group IN ('Academic', 'Electronics', 'Personal', 'Dormitory', 'Organization', 'Others')),
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Tag',
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Meetup Locations Table
CREATE TABLE IF NOT EXISTS meetup_locations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    campus_zone VARCHAR(100) NOT NULL,
    description TEXT,
    safety_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Listings Table
CREATE TABLE IF NOT EXISTS listings (
    id VARCHAR(36) PRIMARY KEY,
    seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id VARCHAR(36) NOT NULL REFERENCES categories(id),
    category_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED', 'REMOVED')),
    is_negotiable BOOLEAN DEFAULT TRUE,
    brand VARCHAR(100),
    model VARCHAR(100),
    item_year VARCHAR(20),
    original_price NUMERIC(10, 2),
    purchase_date VARCHAR(50),
    additional_notes TEXT,
    preferred_meetup_id VARCHAR(36) REFERENCES meetup_locations(id) ON DELETE SET NULL,
    preferred_meetup_name VARCHAR(120),
    campus_zone VARCHAR(100) DEFAULT 'Main Campus',
    view_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    offers_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Listing Images Table
CREATE TABLE IF NOT EXISTS listing_images (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id VARCHAR(36) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, listing_id)
);

-- 8. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) REFERENCES listings(id) ON DELETE SET NULL,
    buyer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_text TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    buyer_unread_count INTEGER DEFAULT 0,
    seller_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (listing_id, buyer_id, seller_id)
);

-- 9. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    offer_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offered_price NUMERIC(10, 2) NOT NULL CHECK (offered_price > 0),
    counter_price NUMERIC(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED', 'CANCELLED')),
    buyer_note TEXT,
    seller_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) NOT NULL REFERENCES listings(id),
    buyer_id VARCHAR(36) NOT NULL REFERENCES users(id),
    seller_id VARCHAR(36) NOT NULL REFERENCES users(id),
    offer_id VARCHAR(36) REFERENCES offers(id),
    agreed_price NUMERIC(10, 2) NOT NULL CHECK (agreed_price >= 0),
    meetup_location_id VARCHAR(36) REFERENCES meetup_locations(id),
    meetup_location_name VARCHAR(120) NOT NULL,
    scheduled_date VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'RESERVED' CHECK (status IN ('PENDING', 'RESERVED', 'COMPLETED', 'CANCELLED', 'DISPUTED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- 12. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id VARCHAR(36) REFERENCES listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    communication_rating INTEGER DEFAULT 5 CHECK (communication_rating >= 1 AND communication_rating <= 5),
    item_accuracy_rating INTEGER DEFAULT 5 CHECK (item_accuracy_rating >= 1 AND item_accuracy_rating <= 5),
    meetup_rating INTEGER DEFAULT 5 CHECK (meetup_rating >= 1 AND meetup_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (transaction_id, reviewer_id)
);

-- 13. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    listing_id VARCHAR(36) REFERENCES listings(id) ON DELETE SET NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN (
        'Scam / Fraud',
        'Prohibited Item',
        'Counterfeit Item',
        'Misleading Description',
        'Inappropriate Content',
        'Suspicious Behavior',
        'Harassment',
        'Other'
    )),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED')),
    resolution_notes TEXT,
    resolved_by VARCHAR(36) REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Looking For Posts Table
CREATE TABLE IF NOT EXISTS looking_for_posts (
    id VARCHAR(36) PRIMARY KEY,
    author_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    min_budget NUMERIC(10, 2),
    max_budget NUMERIC(10, 2),
    preferred_meetup_name VARCHAR(120),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED')),
    response_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    recipient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(120),
    action VARCHAR(60) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(36),
    metadata TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
