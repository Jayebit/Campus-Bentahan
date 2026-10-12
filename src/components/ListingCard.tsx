import React from 'react';
import { Heart, MapPin, ShieldCheck, Star } from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onToggleFavorite?: (listingId: string, current: boolean) => void;
  isFavorited?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onToggleFavorite,
  isFavorited = false,
}) => {
  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'NEW':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'LIKE_NEW':
        return 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'GOOD':
        return 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'FAIR':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'POOR':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'NEW':
        return 'New';
      case 'LIKE_NEW':
        return 'Like New';
      case 'GOOD':
        return 'Used - Good';
      case 'FAIR':
        return 'Used - Fair';
      case 'POOR':
        return 'Used - Poor';
      default:
        return cond;
    }
  };

  const primaryImage =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-yellow-400 hover:shadow-lg dark:hover:shadow-emerald-950/40 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top Image Container - Compacted on mobile for high density viewing */}
      <div className="relative h-24 sm:h-32 md:h-36 lg:h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Status Overlay if Reserved or Sold */}
        {listing.status === 'RESERVED' && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-yellow-500 text-emerald-950 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded shadow-sm border border-yellow-600">
            RESERVED
          </div>
        )}
        {listing.status === 'SOLD' && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white font-extrabold text-[10px] sm:text-xs px-2 py-1 rounded shadow-lg tracking-wider">
              SOLD
            </span>
          </div>
        )}

        {/* Condition Badge (Top Right) */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex items-center gap-1">
          <span
            className={`text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded border shadow-2xs backdrop-blur-md ${getConditionColor(
              listing.condition
            )}`}
          >
            {getConditionLabel(listing.condition)}
          </span>

          {/* Favorite Heart Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(listing.id, isFavorited);
              }}
              className={`p-1 sm:p-1.5 rounded-full shadow-sm backdrop-blur-md transition ${
                isFavorited
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/85 dark:bg-slate-900/85 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Category Tag (Bottom Left of Image) */}
        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2">
          <span className="bg-slate-900/80 dark:bg-black/80 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-medium px-1 sm:px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-[120px] inline-block">
            {listing.categoryName}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-2 sm:p-2.5 md:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs md:text-sm line-clamp-1 sm:line-clamp-2 leading-tight group-hover:text-emerald-800 dark:group-hover:text-yellow-400 transition">
            {listing.title}
          </h3>

          {/* Price and Negotiable */}
          <div className="mt-1 sm:mt-1.5 flex flex-wrap items-baseline gap-1">
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
              ₱{listing.price.toLocaleString()}
            </span>
            {listing.originalPrice && listing.originalPrice > listing.price && (
              <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 line-through">
                ₱{listing.originalPrice.toLocaleString()}
              </span>
            )}
            {listing.isNegotiable && (
              <span className="text-[8px] sm:text-[9px] text-emerald-900 dark:text-yellow-300 bg-yellow-400/20 dark:bg-yellow-400/10 px-1 py-0.2 rounded font-bold border border-yellow-400/30">
                Nego
              </span>
            )}
          </div>
        </div>

        {/* Seller Info & Meetup Meta */}
        <div className="mt-1.5 pt-1.5 sm:mt-2 sm:pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-0.5 text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          {/* Seller Name + Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {listing.sellerName || 'Campus Peer'}
              </span>
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400 shrink-0" title="Verified Campus User" />
            </div>

            <div className="flex items-center gap-0.5 text-amber-600 dark:text-yellow-400 font-semibold shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>{listing.sellerRating ? listing.sellerRating.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Preferred Meetup Location */}
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 truncate">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-700 dark:text-yellow-400 shrink-0" />
            <span className="truncate">{listing.preferredMeetupName || 'Student Center'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
