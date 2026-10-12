import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Star,
  ShoppingBag,
  Calendar,
  Flag,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { User, Listing, Review } from '../types';
import { ListingCard } from './ListingCard';
import { api } from '../api';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenReportUser: (userId: string, userName: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  onClose,
  onSelectListing,
  onOpenReportUser,
}) => {
  if (!userId) return null;

  const [profileData, setProfileData] = useState<{
    profile: User;
    activeListings: Listing[];
    soldCount: number;
    reviews: Review[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await api.getUserProfile(userId);
        setProfileData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <span className="font-bold text-sm text-slate-800">Campus Marketplace Profile</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !profileData ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading campus profile...</div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Top User Card */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={profileData.profile.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                  alt={profileData.profile.fullName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 font-serif">
                      {profileData.profile.fullName}
                    </h2>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {profileData.profile.verificationBadge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {profileData.profile.departmentName || 'Computer Science'} • {profileData.profile.role}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Member since {new Date(profileData.profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="flex items-center sm:justify-end gap-1 text-amber-500 font-bold text-base">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{profileData.profile.reputationRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({profileData.profile.totalReviews} reviews)
                  </span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold">
                  ✓ {profileData.profile.completedTransactions} Completed Handshakes
                </p>
                <button
                  onClick={() => onOpenReportUser(profileData.profile.id, profileData.profile.fullName)}
                  className="text-[11px] text-slate-400 hover:text-rose-600 inline-flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  Report User
                </button>
              </div>
            </div>

            {/* Active Listings by This User */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Active Listings ({profileData.activeListings.length})
              </h3>
              {profileData.activeListings.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                  No active listings available right now.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profileData.activeListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSelect={onSelectListing}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Peer Reviews List */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Peer Reviews ({profileData.reviews.length})
              </h3>
              {profileData.reviews.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                  No reviews yet for this student.
                </p>
              ) : (
                <div className="space-y-3">
                  {profileData.reviews.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{r.reviewerName}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{r.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">"{r.comment}"</p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                        <span>Communication: {r.communicationRating}/5</span>
                        <span>Item Accuracy: {r.itemAccuracyRating}/5</span>
                        <span>Meetup: {r.meetupRating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
