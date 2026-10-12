import React, { useState, useEffect } from 'react';
import {
  Tag,
  Eye,
  Heart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface SellerDashboardProps {
  onOpenCreateListing: () => void;
  onSelectListing: (listing: Listing) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onOpenCreateListing,
  onSelectListing,
}) => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'RESERVED' | 'SOLD'>('ALL');

  const loadMyListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getListings({ sellerId: user.id, status: 'all' });
      setMyListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyListings();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await api.updateListingStatus(id, newStatus);
      setMyListings(prev => prev.map(l => l.id === id ? updated : l));
    } catch (err: any) {
      alert('Error updating listing status: ' + err.message);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      await api.deleteListing(id);
      setMyListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert('Error deleting listing: ' + err.message);
    }
  };

  // Performance metrics calculation
  const totalViews = myListings.reduce((acc, l) => acc + (l.viewCount || 0), 0);
  const totalFavorites = myListings.reduce((acc, l) => acc + (l.favoritesCount || 0), 0);
  const totalOffers = myListings.reduce((acc, l) => acc + (l.offersCount || 0), 0);
  const soldListings = myListings.filter(l => l.status === 'SOLD');
  const totalSalesRevenue = soldListings.reduce((acc, l) => acc + l.price, 0);

  const filtered = myListings.filter(l => {
    if (filter === 'ALL') return true;
    return l.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
            My Campus Listings & Sales
          </h1>
          <p className="text-xs text-slate-500">
            Manage your posted textbooks, electronics, and dorm gear for sale
          </p>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto active:scale-95 border border-yellow-500/60"
        >
          <Plus className="w-4 h-4 text-emerald-950" />
          <span>New Listing</span>
        </button>
      </div>

      {/* Seller Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Active Listings</span>
            <Tag className="w-4 h-4 text-emerald-700 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {myListings.filter(l => l.status === 'AVAILABLE').length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ready for buyer inquiries</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Total Views</span>
            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{totalViews}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Across all campus items</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Buyer Favorites</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{totalFavorites}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Saved by interested peers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-semibold">Completed Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-700 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            ₱{totalSalesRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">{soldListings.length} deals closed</p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'AVAILABLE', 'RESERVED', 'SOLD'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === tab
                  ? 'bg-emerald-800 text-yellow-300 shadow-xs border border-emerald-700'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Items' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table / Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading your listings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <Tag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No listings found in this category</h3>
          <p className="text-xs max-w-sm mx-auto">
            Got an old textbook, calculator, or uniform? Post it today to help fellow students!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
            >
              <div
                onClick={() => onSelectListing(l)}
                className="flex items-center gap-4 cursor-pointer min-w-0 flex-1"
              >
                <img
                  src={l.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                  alt={l.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate hover:text-emerald-800 dark:hover:text-yellow-400 transition">
                      {l.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        l.status === 'AVAILABLE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-yellow-300 border border-emerald-200 dark:border-emerald-800'
                          : l.status === 'RESERVED'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-emerald-800 dark:text-yellow-300 mt-1">
                    ₱{l.price.toLocaleString()} • {l.categoryName} • {l.condition}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {l.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> {l.favoritesCount} saves
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" /> {l.offersCount} offers
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={l.status}
                  onChange={(e) => handleUpdateStatus(l.id, e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                <button
                  onClick={() => handleDeleteListing(l.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Delete listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
