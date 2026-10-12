import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Tag,
  ShoppingBag,
  DollarSign,
  Heart,
  MessageSquare,
  PlusCircle,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Listing, Transaction, Conversation } from '../types';
import { ListingCard } from './ListingCard';
import { api } from '../api';

interface DashboardViewProps {
  onOpenCreateListing: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenChat: (convId?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreateListing,
  onSelectListing,
  onOpenChat,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [activeMeetups, setActiveMeetups] = useState<Transaction[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [myActiveListingsCount, setMyActiveListingsCount] = useState(0);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [listingsData, txnsData, convsData, myListingsData, favsData] = await Promise.all([
        api.getListings({ status: 'AVAILABLE' }),
        api.getTransactions(),
        api.getConversations(),
        api.getListings({ sellerId: user.id }),
        api.getFavorites().catch(() => []),
      ]);
      setRecommendations(listingsData.filter(l => l.sellerId !== user.id).slice(0, 4));
      setActiveMeetups(txnsData.filter(t => t.status === 'RESERVED'));
      setRecentConversations(convsData.slice(0, 3));
      // Only count active available listings of the logged-in student
      setMyActiveListingsCount(myListingsData.filter(l => l.status === 'AVAILABLE').length);
      setSavedItemsCount(favsData.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Student Profile Greeting Banner */}
      <div className="bg-gradient-to-br from-[#0a2f1c] via-[#14492c] to-[#0d3b23] dark:from-[#051c11] dark:via-[#0c2f1c] dark:to-[#072415] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/60">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={user.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-yellow-400/60 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-serif">{user.fullName}</h1>
                <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-yellow-400/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                  {user.verificationBadge}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                {user.departmentName || 'Computer Studies & IT'} • {user.role}
              </p>
              <div className="flex items-center gap-3 text-xs text-emerald-200 mt-1.5">
                <span className="flex items-center gap-1 font-semibold text-yellow-300">
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
                  {user.reputationRating.toFixed(1)} ({user.totalReviews} reviews)
                </span>
                <span>•</span>
                <span>{user.completedTransactions} Handshakes Completed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <button
              onClick={onOpenCreateListing}
              className="flex-1 sm:flex-initial px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 border border-yellow-500/50"
            >
              <PlusCircle className="w-4 h-4 text-emerald-950" />
              <span>Post New Listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigateTab('my-listings')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600 dark:hover:border-yellow-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Active Listings</span>
            <Tag className="w-4 h-4 text-emerald-700 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{myActiveListingsCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Your items available for sale</p>
        </div>

        <div
          onClick={() => onNavigateTab('purchases')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600 dark:hover:border-yellow-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Pending Meetups</span>
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{activeMeetups.length}</p>
          <p className="text-[11px] text-yellow-700 dark:text-yellow-400 font-medium mt-0.5">Scheduled on campus</p>
        </div>

        <div
          onClick={() => onNavigateTab('favorites')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600 dark:hover:border-yellow-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Saved Items</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{savedItemsCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">In your wishlist</p>
        </div>

        <div
          onClick={() => onNavigateTab('purchases')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600 dark:hover:border-yellow-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Deals Completed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{user.completedTransactions}</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">100% verified campus exchanges</p>
        </div>
      </div>

      {/* Upcoming Campus Meetups Callout (if any) */}
      {activeMeetups.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Scheduled On-Campus Meetup</span>
          </div>

          {activeMeetups.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{m.listingTitle} (₱{m.agreedPrice.toLocaleString()})</p>
                <div className="flex items-center gap-3 text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {m.meetupLocationName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />{' '}
                    {new Date(m.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenChat()}
                  className="px-3.5 py-1.5 bg-slate-900 text-white font-semibold rounded-xl text-xs"
                >
                  Message Partner
                </button>
                <button
                  onClick={() => onNavigateTab('purchases')}
                  className="px-3.5 py-1.5 bg-amber-600 text-white font-semibold rounded-xl text-xs"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Campus Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended for Your College</h2>
            <p className="text-xs text-slate-500">Popular items among Engineering, Science, and IT students</p>
          </div>
          <button
            onClick={() => onNavigateTab('browse')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 dark:text-yellow-400 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {recommendations.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
