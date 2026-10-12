import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  X,
  Sparkles,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { LookingForPost, Category, MeetupLocation } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface LookingForViewProps {
  categories: Category[];
  meetupLocations: MeetupLocation[];
  onOpenChat: (convId?: string) => void;
  onOpenAuth: () => void;
}

export const LookingForView: React.FC<LookingForViewProps> = ({
  categories,
  meetupLocations,
  onOpenChat,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<LookingForPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [catId, setCatId] = useState(categories[0]?.id || '');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [preferredMeetup, setPreferredMeetup] = useState(meetupLocations[0]?.name || 'Student Center');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getLookingFor({
        categoryId: selectedCat === 'all' ? undefined : selectedCat,
        search: searchQuery || undefined,
      });
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedCat, searchQuery]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Please fill out the title and description of what you need.');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      const categoryObj = categories.find(c => c.id === catId);
      const post = await api.createLookingFor({
        title,
        description,
        categoryId: catId,
        categoryName: categoryObj?.name || 'General',
        minBudget: minBudget ? parseFloat(minBudget) : undefined,
        maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
        preferredMeetupName: preferredMeetup,
      });

      setPosts(prev => [post, ...prev]);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setMinBudget('');
      setMaxBudget('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to post request.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Callout */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            Campus Student Requests Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            Can't find what you need?
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Post an item request. Fellow students, faculty, or seniors can reply if they have spare textbooks, calculators, uniforms, or dorm essentials to offer!
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) onOpenAuth();
            else setShowCreateModal(true);
          }}
          className="px-6 py-3.5 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-sm rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="w-5 h-5 text-indigo-600" />
          <span>Post a Request</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search requests (e.g. Organic Chem, Casio, Drafting Kit)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 border border-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading requests...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No requests found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Be the first to ask the campus community for an item you need this semester!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                    {p.categoryName || 'General'}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {p.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {p.description}
                </p>

                {/* Budget */}
                {(p.minBudget || p.maxBudget) && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 rounded-xl">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>
                      Budget:{' '}
                      {p.minBudget && p.maxBudget
                        ? `₱${p.minBudget.toLocaleString()} - ₱${p.maxBudget.toLocaleString()}`
                        : p.maxBudget
                        ? `Up to ₱${p.maxBudget.toLocaleString()}`
                        : `Around ₱${p.minBudget?.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Author & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <img
                    src={p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={p.authorName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate leading-tight">{p.authorName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.authorDepartment || 'Student'}</p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenChat()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-[11px] rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>I Have This</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Post "Looking For" Request</h3>
                <p className="text-xs text-slate-500">Ask campus peers for textbooks, tools, or items</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 my-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  What are you looking for? <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casio fx-991EX for Engineering Exam next week"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Meetup Spot
                  </label>
                  <select
                    value={preferredMeetup}
                    onChange={(e) => setPreferredMeetup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                  >
                    {meetupLocations.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Min Budget (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="400"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Budget (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="700"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Details & Specifics <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State which edition, course code, needed condition, or preferred day to meet..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  {creating ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
