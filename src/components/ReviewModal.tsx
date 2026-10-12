import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../api';

interface ReviewModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  transaction,
  onClose,
  onSuccess,
}) => {
  if (!transaction) return null;

  const [rating, setRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [itemAccuracyRating, setItemAccuracyRating] = useState(5);
  const [meetupRating, setMeetupRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief feedback comment about the exchange.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.createReview({
        transactionId: transaction.id,
        rating,
        communicationRating,
        itemAccuracyRating,
        meetupRating,
        comment: comment.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarSelector = (value: number, setValue: (val: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setValue(star)}
          className="p-1 text-slate-300 hover:text-amber-400 transition"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value ? 'text-amber-400 fill-current' : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Campus Peer Review</h3>
            <p className="text-xs text-slate-500">Rate your meetup experience for "{transaction.listingTitle}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Overall Experience
            </span>
            <div className="flex justify-center">
              {renderStarSelector(rating, setRating)}
            </div>
          </div>

          {/* Aspect Ratings */}
          <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Communication & Punctuality</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setCommunicationRating(s)}
                    className="text-slate-300 hover:text-amber-400"
                  >
                    <Star className={`w-4 h-4 ${s <= communicationRating ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Item Accuracy & Condition</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setItemAccuracyRating(s)}
                    className="text-slate-300 hover:text-amber-400"
                  >
                    <Star className={`w-4 h-4 ${s <= itemAccuracyRating ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Safe Meetup Conduct</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setMeetupRating(s)}
                    className="text-slate-300 hover:text-amber-400"
                  >
                    <Star className={`w-4 h-4 ${s <= meetupRating ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Comments <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Great seller, arrived on time at the Student Center and calculator was in perfect working condition!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
