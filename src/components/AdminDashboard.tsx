import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Tag,
  AlertTriangle,
  FileText,
  MapPin,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  FolderTree,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Layers,
} from 'lucide-react';
import { AdminAnalytics, User, Report, Listing, AuditLog, Category, MeetupLocation } from '../types';
import { api } from '../api';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'listings' | 'reports' | 'categories' | 'meetups' | 'audit'>('analytics');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meetupLocations, setMeetupLocations] = useState<MeetupLocation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms / action modals
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchListingQuery, setSearchListingQuery] = useState('');

  // Category creation
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState('Academic');

  // Meetup location creation
  const [newLocName, setNewLocName] = useState('');
  const [newLocZone, setNewLocZone] = useState('Central Campus');
  const [newLocSafety, setNewLocSafety] = useState('24/7 Security guard post, well-lit CCTV coverage');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [anData, uData, rData, lData, cData, mData, logData] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getListings({ status: 'all' }),
        api.getCategories(),
        api.getMeetupLocations(),
        api.getAdminAuditLogs(),
      ]);
      setAnalytics(anData);
      setUsers(uData);
      setReports(rData);
      setListings(lData);
      setCategories(cData);
      setMeetupLocations(mData);
      setAuditLogs(logData);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleToggleSuspend = async (user: User) => {
    try {
      const updated = await api.toggleUserSuspend(user.id, !user.isSuspended);
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      loadAllData();
    } catch (err: any) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const updated = await api.verifyUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch (err: any) {
      alert('Error verifying user: ' + err.message);
    }
  };

  const handleModerateListing = async (listingId: string, action: 'FLAG' | 'UNFLAG' | 'REMOVE' | 'RESTORE') => {
    try {
      const updated = await api.moderateListing(listingId, { action });
      setListings(prev => prev.map(l => l.id === listingId ? updated : l));
      loadAllData();
    } catch (err: any) {
      alert('Error moderating listing: ' + err.message);
    }
  };

  const handleResolveReport = async (reportId: string, removeListing: boolean, suspendUser: boolean) => {
    try {
      await api.resolveReport(reportId, {
        status: 'RESOLVED',
        resolutionNotes: `Resolved by admin with removeListing=${removeListing}, suspendUser=${suspendUser}`,
        removeListing,
        suspendUser,
      });
      loadAllData();
    } catch (err: any) {
      alert('Error resolving report: ' + err.message);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await api.resolveReport(reportId, {
        status: 'DISMISSED',
        resolutionNotes: 'Dismissed after review. No violation found.',
      });
      loadAllData();
    } catch (err: any) {
      alert('Error dismissing report: ' + err.message);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const created = await api.createCategory({
        name: newCatName.trim(),
        parentGroup: newCatGroup,
      });
      setCategories(prev => [...prev, created]);
      setNewCatName('');
    } catch (err: any) {
      alert('Error creating category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Error deleting category: ' + err.message);
    }
  };

  const handleAddMeetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    try {
      const created = await api.createMeetupLocation({
        name: newLocName.trim(),
        campusZone: newLocZone,
        safetyNotes: newLocSafety,
      });
      setMeetupLocations(prev => [...prev, created]);
      setNewLocName('');
    } catch (err: any) {
      alert('Error creating meetup location: ' + err.message);
    }
  };

  const handleDeactivateMeetup = async (id: string) => {
    try {
      await api.deactivateMeetupLocation(id);
      setMeetupLocations(prev => prev.map(m => m.id === id ? { ...m, isActive: false } : m));
    } catch (err: any) {
      alert('Error deactivating location: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.universityEmail.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(searchListingQuery.toLowerCase()) ||
    l.categoryName.toLowerCase().includes(searchListingQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-950 text-white p-6 rounded-3xl shadow-lg border border-purple-900">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif">Campus Safety & Marketplace Administration</h1>
              <span className="bg-purple-500/30 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-400/30">
                STAFF ACCESS
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              System monitoring, audit logs, category taxonomy, user verification, and content compliance
            </p>
          </div>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {[
          { key: 'analytics', label: 'Overview & Demand', icon: TrendingUp },
          { key: 'users', label: `Users (${users.length})`, icon: Users },
          { key: 'listings', label: `Listings (${listings.length})`, icon: Tag },
          { key: 'reports', label: `Reports Queue (${reports.filter(r => r.status === 'PENDING').length})`, icon: AlertTriangle },
          { key: 'categories', label: 'Categories', icon: FolderTree },
          { key: 'meetups', label: 'Meetup Spots', icon: MapPin },
          { key: 'audit', label: 'Audit Trail', icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === key
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Total Users</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{analytics.metrics.totalUsers}</p>
              <span className="text-[11px] text-emerald-600 font-medium">100% verified .edu</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Active Listings</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{analytics.metrics.activeListings}</p>
              <span className="text-[11px] text-indigo-600 font-medium">{analytics.metrics.totalListings} total</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Completed Deals</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{analytics.metrics.completedTxns}</p>
              <span className="text-[11px] text-emerald-600 font-medium">Zero disputed meetups</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Total Volume</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₱{analytics.metrics.totalVolume.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Peer-to-peer exchange</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Pending Reports</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{analytics.metrics.pendingReports}</p>
              <span className="text-[11px] text-rose-500 font-medium">Requires moderation</span>
            </div>
          </div>

          {/* Demand Insights & Popular Searches Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Campus Demand Insights (Section 48)</h3>
                  <p className="text-xs text-slate-500">Most requested and searched items by students</p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Real-time trends
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {analytics.demandInsights.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{item.term}</p>
                      <p className="text-[11px] text-slate-400">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-mono">{item.queryCount} searches</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          item.demandLevel === 'HIGH'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.demandLevel} DEMAND
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown Bar Chart */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Listings by Category</h3>
              <div className="space-y-3">
                {analytics.categoryStats.map((c, i) => (
                  <div key={i} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <span className="text-slate-400 font-mono">{c.count} items</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min(100, (c.count / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">{filteredUsers.length} campus members</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role / Dept</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reputation</th>
                  <th className="p-3">Completed Deals</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400">{u.universityEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800">{u.role}</span>
                      <p className="text-[11px] text-slate-400">{u.departmentName || 'General'}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isSuspended
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-amber-600">
                      ★ {u.reputationRating.toFixed(1)} ({u.totalReviews})
                    </td>
                    <td className="p-3 font-mono text-slate-700">{u.completedTransactions}</td>
                    <td className="p-3 text-right space-x-1.5">
                      {!u.isVerified && (
                        <button
                          onClick={() => handleVerifyUser(u.id)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleSuspend(u)}
                        className={`px-2.5 py-1 font-bold rounded-lg transition ${
                          u.isSuspended
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Listing Moderation */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search listings by title or category..."
                value={searchListingQuery}
                onChange={(e) => setSearchListingQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">{filteredListings.length} total listings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Flagged?</th>
                  <th className="p-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{l.title}</td>
                    <td className="p-3 text-slate-600">{l.categoryName}</td>
                    <td className="p-3 font-bold font-mono text-indigo-700">₱{l.price.toLocaleString()}</td>
                    <td className="p-3 text-slate-700">{l.sellerName}</td>
                    <td className="p-3 font-semibold text-slate-700">{l.status}</td>
                    <td className="p-3">
                      {l.isFlagged ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          FLAGGED
                        </span>
                      ) : (
                        <span className="text-slate-400">Normal</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {l.isFlagged ? (
                        <button
                          onClick={() => handleModerateListing(l.id, 'UNFLAG')}
                          className="px-2 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
                        >
                          Clear Flag
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateListing(l.id, 'FLAG')}
                          className="px-2 py-1 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100"
                        >
                          Flag
                        </button>
                      )}

                      {l.status !== 'REMOVED' ? (
                        <button
                          onClick={() => handleModerateListing(l.id, 'REMOVE')}
                          className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg hover:bg-rose-100"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateListing(l.id, 'RESTORE')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100"
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Community Safety & Infraction Reports</h3>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
              {reports.filter(r => r.status === 'PENDING').length} Pending Investigation
            </span>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No community reports submitted.</p>
            ) : (
              reports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {r.reason}
                      </span>
                      <span className="text-slate-400 font-medium">Status: {r.status}</span>
                      <span className="text-slate-400">• Reported by {r.reporterName}</span>
                    </div>

                    {r.listingTitle && (
                      <p className="font-bold text-slate-900">
                        Item: "{r.listingTitle}" (ID: {r.listingId})
                      </p>
                    )}

                    <p className="text-slate-700">{r.description}</p>
                  </div>

                  {r.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(r.id, true, false)}
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-xs"
                      >
                        Remove Listing
                      </button>

                      <button
                        onClick={() => handleResolveReport(r.id, true, true)}
                        className="px-3 py-1.5 bg-purple-900 text-white font-bold rounded-xl hover:bg-purple-950 shadow-xs"
                      >
                        Suspend User
                      </button>

                      <button
                        onClick={() => handleDismissReport(r.id)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Categories Manager */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Add Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Kits & Dissecting Sets"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Group</label>
                <select
                  value={newCatGroup}
                  onChange={(e) => setNewCatGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Personal">Personal</option>
                  <option value="Dormitory">Dormitory</option>
                  <option value="Organization">Organization</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-xl shadow-xs transition"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="md:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Active Marketplace Categories</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {categories.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-slate-400 ml-2">[{c.parentGroup}]</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{c.itemCount} items listed</span>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Meetup Locations Manager */}
      {activeTab === 'meetups' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Add Approved Campus Meetup Spot</h3>
            <form onSubmit={handleAddMeetup} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Spot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Complex East Lobby"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus Zone</label>
                <input
                  type="text"
                  required
                  value={newLocZone}
                  onChange={(e) => setNewLocZone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Safety & Security Notes</label>
                <textarea
                  rows={2}
                  value={newLocSafety}
                  onChange={(e) => setNewLocSafety(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-xl shadow-xs transition"
              >
                Register Safe Meetup Spot
              </button>
            </form>
          </div>

          <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Designated Safe Campus Meetup Spots</h3>
            <div className="space-y-2.5 text-xs">
              {meetupLocations.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      {m.name}
                    </p>
                    <p className="text-slate-500 mt-0.5">{m.campusZone} • {m.safetyNotes}</p>
                  </div>
                  {m.isActive ? (
                    <button
                      onClick={() => handleDeactivateMeetup(m.id)}
                      className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">System & Compliance Audit Trail (Section 39)</h3>
              <p className="text-xs text-slate-500">Immutable administrative actions logged with timestamp and IP</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{auditLogs.length} logged events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Metadata</th>
                  <th className="p-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold text-slate-800">{log.userName || 'System'}</td>
                    <td className="p-3 text-purple-700 font-semibold">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.targetType}: {log.targetId?.slice(0, 8)}</td>
                    <td className="p-3 text-slate-500 truncate max-w-xs">{log.metadata || '-'}</td>
                    <td className="p-3 text-slate-400">{log.ipAddress || '10.0.4.12'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
