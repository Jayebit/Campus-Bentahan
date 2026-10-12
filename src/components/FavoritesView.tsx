import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { Listing } from '../types';
import { ListingCard } from './ListingCard';
import { api } from '../api';

interface FavoritesViewProps {
  onSelectListing: (listing: Listing) => void;
  onBrowse: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onSelectListing,
  onBrowse,
}) => {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await api.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (listingId: string) => {
    try {
      await api.removeFavorite(listingId);
      setFavorites(prev => prev.filter(f => f.id !== listingId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
            Saved Favorites
          </h1>
          <p className="text-xs text-slate-500">
            Keep track of campus items you want to buy or compare prices on
          </p>
        </div>
        <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
          {favorites.length} Saved Items
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading saved items...</div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No saved favorites yet</h3>
          <p className="text-xs max-w-sm mx-auto text-slate-500">
            Click the heart icon on any product in the marketplace to save it here for later.
          </p>
          <button
            onClick={onBrowse}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 border border-yellow-500/50"
          >
            <span>Browse Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {favorites.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={onSelectListing}
              onToggleFavorite={handleToggleFavorite}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
