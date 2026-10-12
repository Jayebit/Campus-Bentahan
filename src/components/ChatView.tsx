import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  X,
  ShieldCheck,
  MapPin,
  DollarSign,
  Calendar,
  Check,
  CheckCheck,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { Conversation, Message, Offer, Listing, MeetupLocation } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface ChatViewProps {
  initialConversationId?: string;
  initialListing?: Listing;
  meetupLocations: MeetupLocation[];
  onClose: () => void;
  onOpenMakeOffer?: (listing: Listing) => void;
  onListingClick?: (listingId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialConversationId,
  initialListing,
  meetupLocations,
  onClose,
  onOpenMakeOffer,
  onListingClick,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConversationId || null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterValue, setCounterValue] = useState('');
  const [counterNote, setCounterNote] = useState('');
  
  // In-chat offer modal/drawer state
  const [showMakeOfferDialog, setShowMakeOfferDialog] = useState(false);
  const [makeOfferPrice, setMakeOfferPrice] = useState('');
  const [makeOfferNote, setMakeOfferNote] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations list
  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);

      // If initial listing was passed and no selectedConvId yet, find or create conversation
      if (!selectedConvId && initialListing && user) {
        const found = convs.find(c => c.listingId === initialListing.id);
        if (found) {
          setSelectedConvId(found.id);
        } else {
          // create conversation
          const newConv = await api.startConversation(initialListing.id, `Hi! Is "${initialListing.title}" still available?`);
          setConversations(prev => [newConv, ...prev]);
          setSelectedConvId(newConv.id);
        }
      } else if (!selectedConvId && convs.length > 0) {
        setSelectedConvId(convs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load messages for current selected conversation
  const loadMessages = async (convId: string) => {
    try {
      const res = await api.getMessages(convId);
      setActiveConv(res.conversation);
      setMessages(res.messages);

      // Load offers if listing attached
      if (res.conversation.listingId) {
        const offers = await api.getOffers(res.conversation.listingId);
        setActiveOffers(offers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
      const interval = setInterval(() => {
        loadMessages(selectedConvId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const newMsg = await api.sendMessage(selectedConvId, textToSend);
      setMessages(prev => [...prev, newMsg]);
      // Update snippet in conversation list
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConvId
            ? { ...c, lastMessageText: textToSend, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleOfferAction = async (
    offerId: string,
    action: 'ACCEPT' | 'REJECT' | 'COUNTER' | 'CANCEL',
    counterPrice?: number,
    note?: string
  ) => {
    try {
      await api.respondToOffer(offerId, action, counterPrice, note);
      if (selectedConvId) loadMessages(selectedConvId);
      setShowCounterInput(false);
      setCounterValue('');
      setCounterNote('');
    } catch (err) {
      alert('Error updating offer: ' + err);
    }
  };

  const handleCreateInChatOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv?.listingId) return;
    const priceNum = parseFloat(makeOfferPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price amount');
      return;
    }

    setSubmittingOffer(true);
    try {
      await api.makeOffer(activeConv.listingId, priceNum, makeOfferNote.trim() || undefined);
      setShowMakeOfferDialog(false);
      setMakeOfferPrice('');
      setMakeOfferNote('');
      if (selectedConvId) loadMessages(selectedConvId);
    } catch (err) {
      alert('Failed to submit offer: ' + err);
    } finally {
      setSubmittingOffer(false);
    }
  };

  const quickMessages = [
    'Hi! Is this still available?',
    'Can we meet at the Student Center tomorrow?',
    'I can pick this up at Main Library around 2 PM.',
    'Is the price negotiable?',
  ];

  // Most recent offer for this listing
  const currentOffer = activeOffers.length > 0 ? activeOffers[0] : null;
  const isSeller = user?.id === activeConv?.sellerId;
  const isBuyer = user?.id === activeConv?.buyerId;

  const currentPrice = activeConv?.listingPrice || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 md:p-6 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 sm:rounded-3xl w-full max-w-5xl h-[100dvh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden border-0 sm:border border-slate-200 dark:border-slate-800 min-w-0">
        {/* Main Chat Grid (Single Column on Mobile/Tablet, 2-Column on Desktop) */}
        <div className="flex-1 flex overflow-hidden min-w-0 min-h-0">
          {/* Left Column: Conversations List */}
          <div
            className={`w-full lg:w-80 xl:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/40 shrink-0 min-h-0 ${
              selectedConvId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Campus Chats</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Student-to-student direct messages</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 min-h-0">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No active conversations yet. Reach out to a seller to inquire!
                </div>
              ) : (
                conversations.map((c) => {
                  const otherPartyName = user?.id === c.buyerId ? c.sellerName : c.buyerName;
                  const otherPartyAvatar = user?.id === c.buyerId ? c.sellerAvatar : c.buyerAvatar;
                  const unreadCount = user?.id === c.buyerId ? c.buyerUnreadCount : c.sellerUnreadCount;
                  const isSelected = c.id === selectedConvId;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConvId(c.id)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs border-l-4 border-emerald-700 dark:border-yellow-400'
                          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <img
                        src={otherPartyAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={otherPartyName}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {otherPartyName}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {c.listingTitle && (
                          <p className="text-[11px] font-medium text-emerald-800 dark:text-yellow-400 truncate mt-0.5">
                            📌 {c.listingTitle} (₱{c.listingPrice?.toLocaleString()})
                          </p>
                        )}

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {c.lastMessageText || 'Chat started'}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <span className="w-5 h-5 bg-emerald-800 text-yellow-300 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 border border-yellow-400">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation Stream */}
          <div className={`flex-1 min-w-0 min-h-0 flex flex-col bg-white dark:bg-slate-900 ${!selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
            {activeConv ? (
              <>
                {/* Active Chat Top Header */}
                <div className="p-2.5 sm:p-3.5 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                      onClick={() => setSelectedConvId(null)}
                      className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Back to conversations"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <img
                      src={
                        (user?.id === activeConv.buyerId ? activeConv.sellerAvatar : activeConv.buyerAvatar) ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt="Avatar"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {user?.id === activeConv.buyerId ? activeConv.sellerName : activeConv.buyerName}
                        </h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Campus Member" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-yellow-400 font-medium">Verified Active Student</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Attached Product Header Card */}
                {activeConv.listingTitle && (
                  <div className="px-3 sm:px-6 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0">
                    <div
                      onClick={() => activeConv.listingId && onListingClick && onListingClick(activeConv.listingId)}
                      className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
                    >
                      <img
                        src={activeConv.listingImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                        alt="Product"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-yellow-400 truncate max-w-[120px] sm:max-w-xs md:max-w-md text-xs">
                          {activeConv.listingTitle}
                        </p>
                        <p className="font-bold text-emerald-800 dark:text-yellow-400 text-[11px] sm:text-xs">
                          ₱{activeConv.listingPrice?.toLocaleString()} • <span className="capitalize">{activeConv.listingStatus?.toLowerCase() || 'available'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {isBuyer && activeConv.listingStatus !== 'SOLD' && (
                        <button
                          onClick={() => {
                            setMakeOfferPrice(
                              currentOffer && currentOffer.status === 'COUNTERED' && currentOffer.counterPrice
                                ? currentOffer.counterPrice.toString()
                                : Math.round(currentPrice * 0.9).toString()
                            );
                            setShowMakeOfferDialog(true);
                          }}
                          className="px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95 border border-yellow-500/60"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Make Offer</span>
                        </button>
                      )}
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-800 dark:text-yellow-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-600" /> Safe Meetup
                      </span>
                    </div>
                  </div>
                )}

                {/* Active Offer Negotiation Banner */}
                {currentOffer && (currentOffer.status === 'PENDING' || currentOffer.status === 'COUNTERED') && (
                  <div className="mx-2.5 sm:mx-6 my-2 p-2.5 sm:p-3.5 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs shrink-0">
                    <div className="flex items-start sm:items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-sm shrink-0 shadow-xs border border-yellow-500">
                        ₱
                      </div>
                      <div>
                        {currentOffer.status === 'PENDING' && (
                          <>
                            <p className="font-bold text-slate-900 dark:text-yellow-200">
                              {isSeller ? `${currentOffer.buyerName} offered:` : 'Your pending offer:'}{' '}
                              <span className="text-sm font-extrabold text-emerald-800 dark:text-yellow-400">
                                ₱{currentOffer.offeredPrice.toLocaleString()}
                              </span>
                              {activeConv.listingPrice && (
                                <span className="ml-1.5 text-[10px] text-slate-500 line-through">
                                  Asking: ₱{activeConv.listingPrice.toLocaleString()}
                                </span>
                              )}
                            </p>
                            {currentOffer.buyerNote && (
                              <p className="text-slate-600 dark:text-yellow-300/80 text-[11px] italic mt-0.5">
                                "{currentOffer.buyerNote}"
                              </p>
                            )}
                          </>
                        )}

                        {currentOffer.status === 'COUNTERED' && (
                          <>
                            <p className="font-bold text-slate-900 dark:text-yellow-200 flex items-center gap-1.5">
                              <span className="inline-block px-1.5 py-0.5 bg-yellow-400 text-emerald-950 rounded text-[10px] font-black">
                                COUNTER-OFFER
                              </span>
                              <span>
                                {isBuyer ? 'Seller countered at:' : 'Counter-offer active:'}{' '}
                                <span className="text-sm font-extrabold text-emerald-800 dark:text-yellow-400">
                                  ₱{(currentOffer.counterPrice || currentOffer.offeredPrice).toLocaleString()}
                                </span>
                              </span>
                            </p>
                            {(currentOffer.sellerNote || currentOffer.buyerNote) && (
                              <p className="text-slate-600 dark:text-yellow-300/80 text-[11px] italic mt-0.5">
                                "{currentOffer.sellerNote || currentOffer.buyerNote}"
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Offer Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                      {showCounterInput ? (
                        <div className="flex items-center gap-1.5 flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-yellow-400 dark:border-yellow-600 shadow-xs">
                          <span className="text-emerald-900 dark:text-yellow-400 font-bold pl-1 text-xs">₱</span>
                          <input
                            type="number"
                            placeholder="Counter price"
                            value={counterValue}
                            onChange={(e) => setCounterValue(e.target.value)}
                            className="w-20 sm:w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
                            autoFocus
                          />
                          <input
                            type="text"
                            placeholder="Optional note"
                            value={counterNote}
                            onChange={(e) => setCounterNote(e.target.value)}
                            className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none hidden md:inline-block"
                          />
                          <button
                            onClick={() => {
                              const val = parseFloat(counterValue);
                              if (isNaN(val) || val <= 0) {
                                alert('Please enter a valid counter price');
                                return;
                              }
                              handleOfferAction(currentOffer.id, 'COUNTER', val, counterNote);
                            }}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black rounded-lg text-xs shadow-xs transition border border-yellow-400/40"
                          >
                            Send Counter
                          </button>
                          <button
                            onClick={() => setShowCounterInput(false)}
                            className="px-2 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* If seller seeing pending offer, or buyer seeing seller's counter */}
                          {((isSeller && currentOffer.status === 'PENDING') || (isBuyer && currentOffer.status === 'COUNTERED')) && (
                            <button
                              onClick={() => handleOfferAction(currentOffer.id, 'ACCEPT')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5 text-yellow-400" />
                              <span>Accept Deal</span>
                            </button>
                          )}

                          {/* Either party can make a counter */}
                          <button
                            onClick={() => {
                              setShowCounterInput(true);
                              setCounterValue(
                                currentOffer.counterPrice
                                   ? currentOffer.counterPrice.toString()
                                  : currentOffer.offeredPrice.toString()
                              );
                            }}
                            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 border border-yellow-500 font-bold rounded-xl shadow-2xs transition active:scale-95"
                          >
                            Counter
                          </button>

                          {/* Decline button */}
                          <button
                            onClick={() => handleOfferAction(currentOffer.id, 'REJECT')}
                            className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold rounded-xl transition text-xs"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Accepted Banner */}
                {currentOffer && currentOffer.status === 'ACCEPTED' && (
                  <div className="mx-2.5 sm:mx-6 my-2 p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shadow-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        🎉 Deal accepted at{' '}
                        <strong className="text-emerald-950 dark:text-yellow-400">₱{(currentOffer.counterPrice || currentOffer.offeredPrice).toLocaleString()}</strong>! Item is reserved. Arrange your campus meetup details below.
                      </span>
                    </div>
                  </div>
                )}

                {/* Message Stream - min-h-0 prevents flex children overflow */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                  {/* Campus Safety Reminder bubble */}
                  <div className="text-center my-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      For your safety, meet only at approved campus zones (Library, Student Center, Gates).
                    </span>
                  </div>

                  {messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    const isOfferNotice = m.content.includes('Offer of ₱') || m.content.includes('Counter-offer') || m.content.includes('accepted the offer');

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isOfferNotice
                              ? 'bg-yellow-400/15 dark:bg-yellow-400/10 border border-yellow-400/50 text-slate-900 dark:text-yellow-200 font-medium'
                              : isMe
                              ? 'bg-emerald-800 text-white rounded-br-xs shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p>{m.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            m.isRead ? (
                              <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-yellow-400" title="Read" />
                            ) : (
                              <Check className="w-3 h-3" title="Sent" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick replies */}
                <div className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
                  {quickMessages.map((msg, i) => (
                    <button
                      key={i}
                      onClick={() => setInputText(msg)}
                      className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-yellow-300 bg-slate-100 dark:bg-slate-800 hover:bg-yellow-400/20 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap transition"
                    >
                      {msg}
                    </button>
                  ))}
                </div>

                {/* In-Chat Make Offer Modal / Floating Sheet */}
                {showMakeOfferDialog && (
                  <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-slate-800 border-t border-emerald-200 dark:border-slate-700 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-800 dark:text-yellow-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Make an Offer to {activeConv.sellerName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          (Asking: ₱{currentPrice.toLocaleString()})
                        </span>
                      </div>
                      <button
                        onClick={() => setShowMakeOfferDialog(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateInChatOffer} className="space-y-2">
                      {/* Suggested discount chips */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Suggestions:</span>
                        {[0.95, 0.9, 0.85, 0.8].map((pct) => {
                          const suggested = Math.round(currentPrice * pct);
                          return (
                            <button
                              type="button"
                              key={pct}
                              onClick={() => setMakeOfferPrice(suggested.toString())}
                              className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 text-emerald-800 dark:text-yellow-400 rounded-md font-semibold hover:bg-yellow-400/20 transition text-[11px]"
                            >
                              ₱{suggested.toLocaleString()} (-{Math.round((1 - pct) * 100)}%)
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative w-32 sm:w-36 shrink-0">
                          <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₱</span>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={makeOfferPrice}
                            onChange={(e) => setMakeOfferPrice(e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                            required
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Optional note (e.g. cash ready)"
                          value={makeOfferNote}
                          onChange={(e) => setMakeOfferNote(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={submittingOffer}
                          className="px-3 sm:px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 shrink-0 border border-yellow-400/40"
                        >
                          {submittingOffer ? 'Sending...' : 'Send Offer'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Bottom Input Field */}
                <form onSubmit={handleSendMessage} className="p-2 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                  {isBuyer && activeConv.listingStatus !== 'SOLD' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMakeOfferPrice(Math.round(currentPrice * 0.9).toString());
                        setShowMakeOfferDialog(true);
                      }}
                      className="px-2.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 border border-yellow-500/60 font-black text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                      title="Make an offer on this item"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Offer</span>
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Type message to discuss meetup or price..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 sm:p-2.5 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 rounded-xl shadow-xs transition disabled:opacity-40 shrink-0 border border-yellow-400/40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6">
                <p>Select a conversation from the left to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
