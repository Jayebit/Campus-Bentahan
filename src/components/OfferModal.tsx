import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Listing } from '../types';
import { api } from '../api';

interface OfferModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: (offer: any) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  listing,
  onClose,
  onSuccess,
}) => {
  if (!listing) return null;

  const [offeredPrice, setOfferedPrice] = useState(
    listing.price ? Math.round(listing.price * 0.9).toString() : ''
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const numOffer = parseFloat(offeredPrice) || 0;
  const savings = listing.price - numOffer;
  const savingsPercent = listing.price > 0 ? Math.round((savings / listing.price) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numOffer || numOffer <= 0) {
      setError('Please enter a valid offer price.');
      return;
    }

    if (numOffer > listing.price * 2) {
      setError('Offer price seems unusually high compared to the listed price.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const offer = await api.makeOffer(listing.id, numOffer, note);
      onSuccess(offer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Make an Offer</h2>
            <p className="text-xs text-slate-500">Negotiate price for campus pickup</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
            alt={listing.title}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 truncate">{listing.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Seller: {listing.sellerName}</p>
            <p className="text-xs font-bold text-indigo-700 mt-0.5">Listed Price: ₱{listing.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Offer Price (₱)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg font-mono">
                ₱
              </span>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="600"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-extrabold font-serif text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Savings preview */}
            {numOffer > 0 && numOffer < listing.price && (
              <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ₱{savings.toLocaleString()} ({savingsPercent}%) lower than listed price
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note to Seller (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Can pay cash upon meetup tomorrow at Student Center."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{loading ? 'Sending...' : 'Send Offer to Seller'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
