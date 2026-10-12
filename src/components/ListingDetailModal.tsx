import React, { useState } from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  Star,
  Heart,
  MessageSquare,
  DollarSign,
  Tag,
  Calendar,
  Layers,
  AlertTriangle,
  Flag,
  Share2,
  CheckCircle2,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onToggleFavorite: (listingId: string, current: boolean) => void;
  isFavorited?: boolean;
  onOpenMakeOffer: (listing: Listing) => void;
  onOpenChat: (listing: Listing) => void;
  onOpenReport: (target: { listingId?: string; userId?: string; title?: string }) => void;
  onViewSellerProfile: (sellerId: string) => void;
  onUpdateStatus?: (listingId: string, status: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onToggleFavorite,
  isFavorited = false,
  onOpenMakeOffer,
  onOpenChat,
  onOpenReport,
  onViewSellerProfile,
  onUpdateStatus,
}) => {
  if (!listing) return null;

  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const isOwner = user?.id === listing.sellerId;
  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getConditionDescription = (cond: string) => {
    switch (cond) {
      case 'NEW':
        return 'Brand new, never opened or used. In original packaging.';
      case 'LIKE_NEW':
        return 'Pristine, immaculate condition with zero visible wear or marks.';
      case 'GOOD':
        return 'Used with minor normal wear, fully operational and intact.';
      case 'FAIR':
        return 'Noticeable cosmetic wear or markings, but still functionally sound.';
      case 'POOR':
        return 'Heavily worn or has slight defects, sold as-is for spares or budget.';
      default:
        return 'Condition verified by seller.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        {/* Modal Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900">
              {listing.categoryName}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Listed {new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Share listing"
            >
              {copiedLink ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onToggleFavorite(listing.id, isFavorited)}
              className={`p-2 rounded-xl transition ${
                isFavorited
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-3">
            {/* Primary Large Image */}
            <div className="aspect-4/3 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-700">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {listing.status === 'RESERVED' && (
                <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                  RESERVED
                </div>
              )}
              {listing.status === 'SOLD' && (
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-base px-6 py-2 rounded-xl shadow-lg">
                    SOLD
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-indigo-600 scale-95'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Campus Safety Guarantee Card */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Campus Safety Protocol
              </div>
              <p className="text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
                Transactions occur exclusively between verified students and faculty at authorized campus zones. Always inspect item in person before completing the exchange.
              </p>
            </div>
          </div>

          {/* Right Column: Listing Details & Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Title and Price */}
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-serif leading-tight">
                  {listing.title}
                </h1>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-serif">
                    ₱{listing.price.toLocaleString()}
                  </span>
                  {listing.originalPrice && listing.originalPrice > listing.price && (
                    <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                      Orig. ₱{listing.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {listing.isNegotiable && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-semibold border border-emerald-200 dark:border-emerald-800">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Product Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block">Condition Note:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {getConditionDescription(listing.condition)}
                  </span>
                </div>
                {listing.brand && (
                  <div>
                    <span className="text-slate-400 block">Brand:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{listing.brand}</span>
                  </div>
                )}
                {listing.model && (
                  <div>
                    <span className="text-slate-400 block">Model:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{listing.model}</span>
                  </div>
                )}
                {listing.itemYear && (
                  <div>
                    <span className="text-slate-400 block">Year / Edition:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{listing.itemYear}</span>
                  </div>
                )}
              </div>

              {/* Preferred Safe Meetup Location */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">Preferred Campus Meetup Spot</p>
                  <p className="text-emerald-900 dark:text-yellow-300 font-semibold mt-0.5">
                    {listing.preferredMeetupName || 'University Student Center (Main Atrium)'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Zone: {listing.campusZone || 'Central Campus'} • Monitored Campus Area
                  </p>
                </div>
              </div>

              {/* Seller Profile Card */}
              <div
                onClick={() => onViewSellerProfile(listing.sellerId)}
                className="group p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:border-emerald-500 dark:hover:border-yellow-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      listing.sellerAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                    }
                    alt={listing.sellerName}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-yellow-400 transition">
                        {listing.sellerName}
                      </p>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {listing.sellerDepartment || 'Verified Campus Community Member'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-yellow-400 font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {listing.sellerRating ? listing.sellerRating.toFixed(1) : '5.0'}
                      </span>
                      <span>•</span>
                      <span>{listing.sellerCompletedCount || 0} Deals Completed</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-yellow-400 group-hover:translate-x-0.5 transition" />
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {!isOwner ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onOpenMakeOffer(listing)}
                      disabled={listing.status !== 'AVAILABLE'}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-sm py-3 rounded-xl transition disabled:opacity-50 border border-yellow-500/60 shadow-xs"
                    >
                      <DollarSign className="w-4 h-4 text-emerald-950" />
                      Make Offer
                    </button>

                    <button
                      onClick={() => onOpenChat(listing)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-emerald-950/20 transition"
                    >
                      <MessageSquare className="w-4 h-4 text-yellow-300" />
                      Message Seller
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => onOpenReport({ listingId: listing.id, title: listing.title })}
                      className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center gap-1 transition"
                    >
                      <Flag className="w-3 h-3" />
                      Report suspicious listing
                    </button>
                  </div>
                </>
              ) : (
                /* Owner Controls */
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Controls:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(listing.id, 'AVAILABLE')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        listing.status === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Mark Available
                    </button>

                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(listing.id, 'RESERVED')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        listing.status === 'RESERVED'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Mark Reserved
                    </button>

                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(listing.id, 'SOLD')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        listing.status === 'SOLD'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Mark Sold
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
