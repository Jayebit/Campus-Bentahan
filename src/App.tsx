import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { ListingCard } from './components/ListingCard';
import { ListingFilters } from './components/ListingFilters';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { OfferModal } from './components/OfferModal';
import { ChatView } from './components/ChatView';
import { LookingForView } from './components/LookingForView';
import { PurchasesView } from './components/PurchasesView';
import { SellerDashboard } from './components/SellerDashboard';
import { FavoritesView } from './components/FavoritesView';
import { DashboardView } from './components/DashboardView';
import { AdminDashboard } from './components/AdminDashboard';
import { CategoriesView } from './components/CategoriesView';
import { UserProfileModal } from './components/UserProfileModal';
import { ReviewModal } from './components/ReviewModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import {
  Listing,
  Category,
  Department,
  MeetupLocation,
  Transaction,
} from './types';
import { api } from './api';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function MarketplaceApp() {
  const { user, loading: authLoading } = useAuth();

  // Navigation & Data
  const [activeTab, setActiveTab] = useState<string>('browse');
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meetupLocations, setMeetupLocations] = useState<MeetupLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMeetupId, setSelectedMeetupId] = useState('all');
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('AVAILABLE');
  const [sortBy, setSortBy] = useState('newest');

  // Favorites cached set
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [offerListing, setOfferListing] = useState<Listing | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatConvId, setChatConvId] = useState<string | undefined>(undefined);
  const [chatListing, setChatListing] = useState<Listing | undefined>(undefined);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [reviewTransaction, setReviewTransaction] = useState<Transaction | null>(null);
  const [reportTarget, setReportTarget] = useState<{ listingId?: string; userId?: string; title?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initial reference load
  useEffect(() => {
    const loadInit = async () => {
      try {
        const [cats, depts, locs] = await Promise.all([
          api.getCategories(),
          api.getDepartments(),
          api.getMeetupLocations(),
        ]);
        setCategories(cats);
        setDepartments(depts);
        setMeetupLocations(locs);
      } catch (err) {
        console.error('Error loading reference data', err);
      }
    };
    loadInit();
  }, []);

  // Fetch listings with all applied filters
  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings({
        search: searchQuery.trim() || undefined,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        condition: selectedCondition !== 'all' ? selectedCondition : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        meetupLocationId: selectedMeetupId !== 'all' ? selectedMeetupId : undefined,
        negotiable: negotiableOnly ? true : undefined,
        status: statusFilter,
        sortBy,
      });
      setListings(data);
    } catch (err) {
      console.error('Error loading listings', err);
    } finally {
      setLoading(false);
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dedicated manual refresh for live updates without full browser reload
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [cats, depts, locs] = await Promise.all([
        api.getCategories(),
        api.getDepartments(),
        api.getMeetupLocations(),
        loadListings(),
      ]);
      setCategories(cats);
      setDepartments(depts);
      setMeetupLocations(locs);
      if (user) {
        const favs = await api.getFavorites();
        setFavoriteIds(new Set(favs.map((f) => f.id)));
      }
    } catch (err) {
      console.error('Refresh error', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 450);
    }
  };

  useEffect(() => {
    loadListings();
  }, [
    searchQuery,
    selectedCategory,
    selectedCondition,
    minPrice,
    maxPrice,
    selectedDepartment,
    selectedMeetupId,
    negotiableOnly,
    statusFilter,
    sortBy,
  ]);

  // Load user's favorite IDs
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    const loadFavs = async () => {
      try {
        const favs = await api.getFavorites();
        setFavoriteIds(new Set(favs.map((f) => f.id)));
      } catch (err) {
        // ignore
      }
    };
    loadFavs();
  }, [user]);

  const handleToggleFavorite = async (listingId: string, current: boolean) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (current) {
        await api.removeFavorite(listingId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        await api.addFavorite(listingId);
        setFavoriteIds((prev) => new Set(prev).add(listingId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedDepartment('all');
    setSelectedMeetupId('all');
    setNegotiableOnly(false);
    setStatusFilter('AVAILABLE');
    setSortBy('newest');
  };

  const handleOpenChatForListing = (listing: Listing) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setChatListing(listing);
    setChatConvId(undefined);
    setShowChat(true);
    if (selectedListing) setSelectedListing(null);
  };

  const handleOpenMakeOffer = (listing: Listing) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setOfferListing(listing);
  };

  const handleUpdateStatus = async (listingId: string, status: string) => {
    try {
      const updated = await api.updateListingStatus(listingId, status);
      setListings((prev) => prev.map((l) => (l.id === listingId ? updated : l)));
      if (selectedListing && selectedListing.id === listingId) {
        setSelectedListing(updated);
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // 1. Initial auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#071b12] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-yellow-400 shadow-lg shadow-emerald-950/20 animate-bounce">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div className="text-center">
          <h2 className="font-serif font-extrabold text-lg text-emerald-950 dark:text-white">Campus Bentahan</h2>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">Connecting verified campus community...</p>
        </div>
      </div>
    );
  }

  // 2. First-time users without account / unauthenticated users: show dedicated LoginPage
  if (!user) {
    return <LoginPage departments={departments} />;
  }

  // 3. Authenticated campus user: full marketplace view
  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-[#061810] flex flex-col font-sans text-slate-800 dark:text-slate-100 selection:bg-yellow-400 selection:text-emerald-950 pb-20 md:pb-0 transition-colors duration-200">
      {/* Primary Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreateListing={() => setShowCreateListing(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenChat={(convId) => {
          setChatConvId(convId);
          setChatListing(undefined);
          setShowChat(true);
        }}
        onOpenProfile={(uid) => setProfileUserId(uid)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Browse Items */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Hero Banner for University Community in Forest Green & Bright Yellow */}
            <div className="bg-gradient-to-r from-[#0a2f1c] via-[#14492c] to-[#0d3b23] dark:from-[#051c11] dark:via-[#0c2f1c] dark:to-[#072415] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-800/60 relative overflow-hidden">
              <div className="space-y-2 max-w-xl relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full border border-yellow-400/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                  Official Campus Student Marketplace
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-serif leading-tight text-white">
                  Buy, sell, and trade safely within university grounds.
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Verified university accounts only. Meet at monitored campus zones—student center, central library, and security checkpoints.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10">
                <button
                  onClick={() => setShowCreateListing(true)}
                  className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-2xl shadow-lg transition active:scale-95 text-center flex items-center justify-center gap-1.5 border border-yellow-500/50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>+ Sell Your Old Books & Gear</span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-2xl backdrop-blur-xs transition text-center border border-white/20"
                >
                  Browse Categories
                </button>
              </div>
            </div>

            {/* Comprehensive Filters Component */}
            <ListingFilters
              categories={categories}
              departments={departments}
              meetupLocations={meetupLocations}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCondition={selectedCondition}
              onSelectCondition={setSelectedCondition}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              selectedMeetupId={selectedMeetupId}
              setSelectedMeetupId={setSelectedMeetupId}
              negotiableOnly={negotiableOnly}
              setNegotiableOnly={setNegotiableOnly}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onResetFilters={handleResetFilters}
            />

            {/* Listings Grid */}
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400 dark:text-slate-500">
                Loading campus listings...
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 shadow-xs">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">No items matched your filters</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms, price range, or reset filters to see all available textbooks and supplies.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Showing {listings.length} items available on campus
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSelect={(l) => setSelectedListing(l)}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorited={favoriteIds.has(listing.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Categories */}
        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setActiveTab('browse');
            }}
          />
        )}

        {/* Tab 3: Looking For Student Requests */}
        {activeTab === 'looking-for' && (
          <LookingForView
            categories={categories}
            meetupLocations={meetupLocations}
            onOpenChat={(convId) => {
              setChatConvId(convId);
              setShowChat(true);
            }}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {/* Tab 4: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenCreateListing={() => setShowCreateListing(true)}
            onSelectListing={(l) => setSelectedListing(l)}
            onOpenChat={(convId) => {
              setChatConvId(convId);
              setShowChat(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab 5: My Listings (Seller) */}
        {activeTab === 'my-listings' && (
          <SellerDashboard
            onOpenCreateListing={() => setShowCreateListing(true)}
            onSelectListing={(l) => setSelectedListing(l)}
          />
        )}

        {/* Tab 6: My Purchases & Meetups */}
        {activeTab === 'purchases' && (
          <PurchasesView
            onOpenReview={(txn) => setReviewTransaction(txn)}
            onOpenChat={() => setShowChat(true)}
          />
        )}

        {/* Tab 7: Favorites */}
        {activeTab === 'favorites' && (
          <FavoritesView
            onSelectListing={(l) => setSelectedListing(l)}
            onBrowse={() => setActiveTab('browse')}
          />
        )}

        {/* Tab 8: Administrator Moderation Center */}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Modals & Drawers */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={selectedListing ? favoriteIds.has(selectedListing.id) : false}
        onOpenMakeOffer={(l) => handleOpenMakeOffer(l)}
        onOpenChat={(l) => handleOpenChatForListing(l)}
        onOpenReport={(target) => setReportTarget(target)}
        onViewSellerProfile={(sellerId) => setProfileUserId(sellerId)}
        onUpdateStatus={handleUpdateStatus}
      />

      {showCreateListing && (
        <CreateListingModal
          categories={categories}
          meetupLocations={meetupLocations}
          onClose={() => setShowCreateListing(false)}
          onSuccess={(created) => {
            setListings((prev) => [created, ...prev]);
            setSelectedListing(created);
          }}
        />
      )}

      {offerListing && (
        <OfferModal
          listing={offerListing}
          onClose={() => setOfferListing(null)}
          onSuccess={(offer) => {
            alert(`Offer of ₱${offer.offeredPrice.toLocaleString()} sent to seller! Check your chat for updates.`);
            setOfferListing(null);
          }}
        />
      )}

      {showChat && (
        <ChatView
          initialConversationId={chatConvId}
          initialListing={chatListing}
          meetupLocations={meetupLocations}
          onClose={() => {
            setShowChat(false);
            setChatListing(undefined);
            setChatConvId(undefined);
          }}
          onListingClick={(id) => {
            const found = listings.find((l) => l.id === id);
            if (found) setSelectedListing(found);
          }}
        />
      )}

      {profileUserId && (
        <UserProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
          onSelectListing={(l) => setSelectedListing(l)}
          onOpenReportUser={(uid, uname) => setReportTarget({ userId: uid, title: uname })}
        />
      )}

      {reviewTransaction && (
        <ReviewModal
          transaction={reviewTransaction}
          onClose={() => setReviewTransaction(null)}
          onSuccess={() => {
            alert('Review posted successfully! Thank you for rating your campus peer.');
          }}
        />
      )}

      {reportTarget && (
        <ReportModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          departments={departments}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* University Compliance & Safety Footer */}
      <footer className="bg-[#071f13] text-emerald-100/70 text-xs py-8 border-t border-emerald-900/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-emerald-950 font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-sm font-serif">Campus Bentahan</span>
              <span className="text-emerald-700">•</span>
              <span className="text-emerald-200/80">Official Campus Community Exchange</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1 text-yellow-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                Zero Counterfeits Policy
              </span>
              <span className="text-emerald-700">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                Designated Safe Meetup Zones Only
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-900/60 text-[11px] text-emerald-200/50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Campus Bentahan complies with University Student Affairs and Campus Safety regulations. Prohibited items include weapons, alcohol, vape/tobacco, controlled substances, and unauthorized exam materials.
            </p>
            <p className="shrink-0 text-emerald-300/60">
              © {new Date().getFullYear()} Campus Bentahan. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MarketplaceApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
