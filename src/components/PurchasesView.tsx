import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  Star,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface PurchasesViewProps {
  onOpenReview: (transaction: Transaction) => void;
  onOpenChat: (convId?: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  onOpenReview,
  onOpenChat,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'RESERVED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [confirmModalTxn, setConfirmModalTxn] = useState<Transaction | null>(null);
  const [completing, setCompleting] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleMarkComplete = async (txnId: string) => {
    setCompleting(true);
    try {
      const updated = await api.updateTransaction(txnId, {
        buyerConfirmedCompletion: true,
        sellerConfirmedCompletion: true,
        status: 'COMPLETED',
      });
      setTransactions(prev => prev.map(t => t.id === txnId ? updated : t));
      setConfirmModalTxn(null);
    } catch (err: any) {
      alert('Error updating transaction: ' + err.message);
    } finally {
      setCompleting(false);
    }
  };

  const filteredTxns = transactions.filter(t => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
            My Purchases & Campus Meetups
          </h1>
          <p className="text-xs text-slate-500">
            Track your scheduled on-campus handoffs, verify purchases, and leave peer reviews
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['ALL', 'RESERVED', 'COMPLETED', 'CANCELLED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Transactions' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading transactions...</div>
      ) : filteredTxns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No transactions in this status</h3>
          <p className="text-xs max-w-sm mx-auto">
            When you purchase an item or have an offer accepted, your scheduled campus meetup details appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTxns.map((t) => {
            const isBuyer = user?.id === t.buyerId;

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.listingImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                      alt={t.listingTitle}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{t.listingTitle}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'RESERVED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isBuyer ? `Seller: ${t.sellerName}` : `Buyer: ${t.buyerName}`} • TXN ID: {t.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900 font-serif">
                      ₱{t.agreedPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 block">Agreed Price</span>
                  </div>
                </div>

                {/* Campus Meetup Coordinate Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Approved Campus Meetup Spot</p>
                      <p className="text-slate-600">{t.meetupLocationName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Scheduled Time</p>
                      <p className="text-slate-600">
                        {new Date(t.scheduledDate).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar / Checklist */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Always inspect product condition in-person before confirming.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    {t.status === 'RESERVED' && (
                      <button
                        onClick={() => setConfirmModalTxn(t)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Handshake & Complete</span>
                      </button>
                    )}

                    {t.status === 'COMPLETED' && (
                      <button
                        onClick={() => onOpenReview(t)}
                        className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Confirmation Modal with Safety Checklist */}
      {confirmModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Confirm Campus Handshake</h3>
              <p className="text-xs text-slate-500 mt-1">
                Completing transaction for "{confirmModalTxn.listingTitle}" (₱{confirmModalTxn.agreedPrice.toLocaleString()})
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2 text-slate-700">
              <p className="font-semibold text-slate-900">Safety Checklist:</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="text-emerald-600 rounded" />
                <span>I have met with the other party on campus</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="text-emerald-600 rounded" />
                <span>The item matches the description and condition</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="text-emerald-600 rounded" />
                <span>Cash or agreed payment was exchanged safely</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModalTxn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkComplete(confirmModalTxn.id)}
                disabled={completing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                {completing ? 'Completing...' : 'Yes, Confirm Exchange Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
