import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Heart,
  HelpCircle,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Check,
  Moon,
  Sun,
  Home,
  Grid,
  Menu,
  X,
  RotateCw,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Notification } from '../types';
import { api } from '../api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateListing: () => void;
  onOpenAuth: () => void;
  onOpenChat: (convId?: string) => void;
  onOpenProfile: (userId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenCreateListing,
  onOpenAuth,
  onOpenChat,
  onOpenProfile,
  onRefresh,
  isRefreshing = false,
}) => {
  const { user, logout, switchDemoUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [sideNavOpen, setSideNavOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      // ignore
    }
  };

  const fetchUnreadMessages = async () => {
    if (!user) return;
    try {
      const convs = await api.getConversations();
      const count = convs.reduce((acc, c) => {
        const unread = c.buyerId === user.id ? c.buyerUnreadCount : c.sellerUnreadCount;
        return acc + (unread || 0);
      }, 0);
      setUnreadMessagesCount(count);
    } catch (err) {
      // ignore
    }
  };

  const handleTriggerRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    }
    await Promise.all([fetchNotifications(), fetchUnreadMessages()]);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadMessages();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadMessages();
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (n: Notification) => {
    try {
      await api.markNotificationRead(n.id);
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
    } catch (e) {
      // ignore
    }
    setShowNotifications(false);

    if (n.relatedEntityType === 'conversation' && n.relatedEntityId) {
      onOpenChat(n.relatedEntityId);
    } else if (n.type === 'NEW_OFFER' || n.type === 'OFFER_ACCEPTED' || n.type === 'OFFER_REJECTED' || n.type === 'COUNTEROFFER') {
      onOpenChat(n.relatedEntityId);
    } else if (n.relatedEntityType === 'transaction') {
      setActiveTab('purchases');
    } else if (n.relatedEntityType === 'listing') {
      setActiveTab('browse');
    } else {
      onOpenChat();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {/* Top Banner / Verification status bar */}
        <div className="bg-[#071f13] text-emerald-200 text-xs py-1.5 px-4 border-b border-emerald-900/60">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                Verified Campus Network
              </span>
              <span className="text-emerald-700 hidden sm:inline">•</span>
              <span className="text-emerald-200/70 hidden sm:inline">
                Monitored on-campus meetup zones (Library, Student Center, Gate 1)
              </span>
            </div>

            {/* Quick Demo User Switcher & Night Mode on top */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1 text-[11px] bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-700/60 transition"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
              >
                {isDark ? <Sun className="w-3 h-3 text-yellow-300" /> : <Moon className="w-3 h-3 text-yellow-300" />}
                <span className="hidden sm:inline">{isDark ? 'Light' : 'Night'}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="flex items-center gap-1.5 text-xs bg-emerald-900/80 hover:bg-emerald-800 text-yellow-300 px-2.5 py-0.5 rounded-full border border-emerald-700/60 transition font-medium"
                  title="Switch demo account to test different roles"
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span>
                    <strong>{user ? user.fullName.split(' ')[0] : 'Guest'}</strong> ({user?.role || 'None'})
                  </span>
                  <ChevronDown className="w-3 h-3 text-emerald-300" />
                </button>

                {showDemoMenu && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#0d2a1c] rounded-2xl shadow-2xl border border-slate-200 dark:border-emerald-900/80 py-2 z-50 text-slate-800 dark:text-emerald-100">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-emerald-900/60 text-[11px] font-semibold text-slate-400 dark:text-emerald-400 uppercase tracking-wider">
                      Switch Demo Profile
                    </div>
                    {DEMO_USERS.map((demo) => (
                      <button
                        key={demo.id}
                        onClick={() => {
                          switchDemoUser(demo.id);
                          setShowDemoMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-emerald-900/40 transition ${
                          user?.id === demo.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 font-semibold text-emerald-800 dark:text-yellow-300'
                            : 'text-slate-700 dark:text-emerald-200'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{demo.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-emerald-400/80">{demo.badge}</p>
                        </div>
                        {user?.id === demo.id && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-yellow-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Click-away backdrop for active dropdowns */}
        {(showNotifications || showUserMenu) && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => {
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
          />
        )}

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* ========================================================================= */}
          {/* DESKTOP / TABLET HEADER (md:flex) - Single Row Layout                     */}
          {/* ========================================================================= */}
          <div className="hidden md:flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Logo & Brand: Campus Bentahan */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Tablet Side Navigation Toggle Button */}
              <button
                onClick={() => setSideNavOpen(true)}
                className="lg:hidden p-2 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                aria-label="Open Navigation Menu"
                title="Open Side Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('browse')}
                className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-800 flex items-center justify-center text-yellow-400 shadow-md shadow-emerald-950/20 group-hover:bg-emerald-900 transition">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-serif">
                      Campus Bentahan
                    </span>
                    <span className="bg-yellow-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide border border-yellow-500 shadow-xs">
                      UNIV
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5 hidden sm:block">
                    Verified Student Marketplace
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop / iPad Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search textbooks, calculators, uniforms, laptops, dorm gear..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'browse') setActiveTab('browse');
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-[#0d2a1c] text-sm text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-700 focus:ring-2 focus:ring-yellow-400/40 transition outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 dark:bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Right Action Icons & Auth for Desktop */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Refresh Marketplace Button */}
              <button
                onClick={handleTriggerRefresh}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-yellow-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition border border-emerald-200 dark:border-emerald-800/80 active:scale-95"
                title="Refresh marketplace items without page reload"
                aria-label="Refresh Data"
              >
                <RotateCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin text-yellow-500' : ''}`} />
                <span className="hidden lg:inline">Refresh</span>
              </button>

              {/* Sell Item Button in Bright Yellow */}
              <button
                onClick={() => {
                  if (!user) onOpenAuth();
                  else onOpenCreateListing();
                }}
                className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow-sm transition active:scale-95 border border-yellow-500/60"
              >
                <PlusCircle className="w-4 h-4 text-emerald-950" />
                <span>Sell Item</span>
              </button>

              {user ? (
                <>
                  {/* Messages Button */}
                  <button
                    onClick={() => onOpenChat()}
                    className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    title="Messages"
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 text-emerald-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowUserMenu(false);
                      }}
                      className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Notifications"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifsCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                          {unreadNotifsCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                        <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                          {unreadNotifsCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">No notifications yet.</div>
                          ) : (
                            notifications.slice(0, 8).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                  !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/40' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                                  <span>
                                    {new Date(n.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    Open &rarr;
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowUserMenu(!showUserMenu);
                        setShowNotifications(false);
                      }}
                      className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <img
                        src={
                          user.profilePictureUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={user.fullName}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {user.universityEmail}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            {user.verificationBadge}
                          </div>
                        </div>

                        <div className="py-1 text-xs">
                          <button
                            onClick={() => {
                              setActiveTab('dashboard');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            My Activity Dashboard
                          </button>

                          <button
                            onClick={() => {
                              onOpenProfile(user.id);
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            Public Campus Profile
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('my-listings');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Tag className="w-4 h-4 text-slate-400" />
                            My Listings & Sales
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('purchases');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                            My Purchases & Meetups
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('favorites');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Heart className="w-4 h-4 text-slate-400" />
                            My Saved Favorites
                          </button>

                          {user.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                setActiveTab('admin');
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 flex items-center gap-2 text-purple-700 dark:text-purple-400 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-semibold"
                            >
                              <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              Admin Moderation Center
                            </button>
                          )}
                        </div>

                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                >
                  Log In / Register
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MOBILE HEADER (EXCLUSIVELY FOR MOBILE: md:hidden) - 2 ROWS                 */}
          {/* ========================================================================= */}
          <div className="md:hidden pt-2.5 pb-2 space-y-2">
            {/* ROW 1: Side Nav Menu + Campus Bentahan Brand + Theme / User Account */}
            <div className="flex items-center justify-between gap-2">
              {/* Left: Menu Drawer Toggle + Campus Bentahan Brand */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setSideNavOpen(true)}
                  className="p-1.5 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition shrink-0"
                  aria-label="Open Navigation Menu"
                  title="Open Navigation Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveTab('browse')}
                  className="flex items-center gap-2 text-left group focus:outline-none min-w-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-yellow-400 shadow-xs shrink-0 group-hover:bg-emerald-900 transition">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-serif truncate">
                      Campus Bentahan
                    </span>
                    <span className="bg-yellow-400 text-emerald-950 text-[9px] font-black px-1 py-0.5 rounded tracking-wide border border-yellow-500 shrink-0">
                      UNIV
                    </span>
                  </div>
                </button>
              </div>

              {/* Right: Theme Mode Switcher & User Profile / Login */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                </button>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowUserMenu(!showUserMenu);
                        setShowNotifications(false);
                      }}
                      className="flex items-center gap-1 p-0.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      aria-label="User Account Menu"
                    >
                      <img
                        src={
                          user.profilePictureUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={user.fullName}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {user.universityEmail}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            {user.verificationBadge}
                          </div>
                        </div>

                        <div className="py-1 text-xs">
                          <button
                            onClick={() => {
                              setActiveTab('dashboard');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            My Activity Dashboard
                          </button>

                          <button
                            onClick={() => {
                              onOpenProfile(user.id);
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            Public Campus Profile
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('my-listings');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Tag className="w-4 h-4 text-slate-400" />
                            My Listings & Sales
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('purchases');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                            My Purchases & Meetups
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('favorites');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Heart className="w-4 h-4 text-slate-400" />
                            My Saved Favorites
                          </button>

                          {user.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                setActiveTab('admin');
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 flex items-center gap-2 text-purple-700 dark:text-purple-400 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-semibold"
                            >
                              <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              Admin Moderation Center
                            </button>
                          )}
                        </div>

                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="text-xs font-bold text-emerald-800 dark:text-yellow-400 hover:text-emerald-900 px-2.5 py-1.5 rounded-xl bg-yellow-400/20 dark:bg-yellow-400/10 border border-yellow-400/30 transition"
                  >
                    Log In
                  </button>
                )}
              </div>
            </div>

            {/* ROW 2: 'Sell an Item' & Other Header Items (Refresh, Messages & Notifications) */}
            <div className="flex items-center gap-1.5 w-full">
              {/* Primary 'Sell an Item' Button */}
              <button
                onClick={() => {
                  if (!user) onOpenAuth();
                  else onOpenCreateListing();
                }}
                className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-emerald-950 font-black text-xs py-2 px-3 rounded-xl shadow-xs transition active:scale-95 border border-yellow-500/50"
              >
                <PlusCircle className="w-4 h-4 shrink-0 text-emerald-950" />
                <span className="truncate">Sell an Item</span>
              </button>

              {/* Mobile Quick Refresh Button */}
              <button
                onClick={handleTriggerRefresh}
                className="p-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-yellow-400 border border-emerald-200 dark:border-emerald-800 rounded-xl transition flex items-center justify-center shrink-0 active:scale-95"
                title="Refresh marketplace items without page reload"
                aria-label="Refresh Data"
              >
                <RotateCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin text-yellow-500' : ''}`} />
              </button>

              {user ? (
                <>
                  {/* Messages / Chat Button with unread counter */}
                  <button
                    onClick={() => onOpenChat()}
                    className="relative flex items-center gap-1 px-2.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-950 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition text-xs font-bold shrink-0"
                    title="Messages & Offers"
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-800 dark:text-yellow-400 shrink-0" />
                    <span className="whitespace-nowrap text-xs font-bold">Chat</span>
                    {unreadMessagesCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 bg-yellow-400 text-emerald-950 text-[9px] font-black rounded-full border border-yellow-500">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Bell with unread badge */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowUserMenu(false);
                      }}
                      className="relative p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition flex items-center justify-center"
                      title="Notifications"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      {unreadNotifsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                          {unreadNotifsCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown for Mobile */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                        <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                          {unreadNotifsCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">No notifications yet.</div>
                          ) : (
                            notifications.slice(0, 8).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                  !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/40' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                                  <span>
                                    {new Date(n.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    Open &rarr;
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition text-xs font-semibold shrink-0"
                >
                  <span>Register</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar (< md) */}
          <div className="pb-2.5 md:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Campus Bentahan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'browse') setActiveTab('browse');
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Primary Tab Navigation (EXCLUSIVELY for Desktop lg+) */}
          <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2 py-2 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                activeTab === 'browse'
                  ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-yellow-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Browse All Items
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                activeTab === 'categories'
                  ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-yellow-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Categories
            </button>

            <button
              onClick={() => setActiveTab('looking-for')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'looking-for'
                  ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-yellow-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Looking For
            </button>

            {user && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-yellow-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('my-listings')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    activeTab === 'my-listings'
                      ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-yellow-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  My Listings
                </button>

                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    activeTab === 'purchases'
                      ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-yellow-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  My Purchases
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1 ${
                    activeTab === 'favorites'
                      ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-yellow-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Favorites
                </button>

                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition font-semibold flex items-center gap-1.5 ${
                      activeTab === 'admin'
                        ? 'bg-purple-700 text-white shadow-sm'
                        : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin Center
                  </button>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Side Navigation Bar EXCLUSIVELY for Mobile & Tablet */}
      {sideNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSideNavOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Menu Container */}
          <div className="relative w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50 dark:bg-[#071f13]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-800 flex items-center justify-center text-yellow-400 shadow-md shadow-emerald-950/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-serif">
                    Campus Bentahan
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-yellow-500 dark:text-yellow-400 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Network</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSideNavOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Mini Header */}
            {user ? (
              <div className="p-4 border-b border-slate-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-[#0a2717] flex items-center gap-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-yellow-400/40"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.department}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-yellow-400 text-emerald-950 border border-yellow-500">
                    {user.role}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSideNavOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition border border-yellow-500/50"
                >
                  Log In / Register
                </button>
              </div>
            )}

            {/* Exclusive Mobile & Tablet Navigation Items */}
            <div className="p-3 flex-1 space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Explore Marketplace
              </p>

              <button
                onClick={() => {
                  setActiveTab('browse');
                  setSideNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'browse'
                    ? 'bg-emerald-800 text-white shadow-sm font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4 text-yellow-400" />
                <span>Browse All Items</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('categories');
                  setSideNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'categories'
                    ? 'bg-emerald-800 text-white shadow-sm font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Grid className="w-4 h-4 text-yellow-400" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('looking-for');
                  setSideNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'looking-for'
                    ? 'bg-emerald-800 text-white shadow-sm font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-yellow-400" />
                <span>Looking For (Item Requests)</span>
              </button>

              {user && (
                <>
                  <div className="pt-2">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      My Account & Listings
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setSideNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'dashboard'
                        ? 'bg-emerald-800 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-yellow-400" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('my-listings');
                      setSideNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'my-listings'
                        ? 'bg-emerald-800 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Tag className="w-4 h-4 text-yellow-400" />
                    <span>My Listings</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('purchases');
                      setSideNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'purchases'
                        ? 'bg-emerald-800 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-yellow-400" />
                    <span>My Purchases</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('favorites');
                      setSideNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'favorites'
                        ? 'bg-emerald-800 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Favorites</span>
                  </button>

                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setSideNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        activeTab === 'admin'
                          ? 'bg-purple-700 text-white shadow-sm font-bold'
                          : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Admin Center</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/70 dark:bg-slate-950/60">
              <button
                onClick={() => {
                  handleTriggerRefresh();
                  setSideNavOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-yellow-400 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800 active:scale-95"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-yellow-500' : ''}`} />
                <span>Refresh Marketplace Data</span>
              </button>

              <button
                onClick={() => {
                  setSideNavOpen(false);
                  if (!user) onOpenAuth();
                  else onOpenCreateListing();
                }}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 border border-yellow-500/50"
              >
                <PlusCircle className="w-4 h-4 text-emerald-950" />
                <span>+ Sell Campus Item</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-emerald-800" />}
                  <span>{isDark ? 'Light' : 'Night'}</span>
                </button>

                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setSideNavOpen(false);
                    }}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1.5 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Bar for Phone Form Factor (360px - 767px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071f13]/95 backdrop-blur-md border-t border-slate-200 dark:border-emerald-900/60 md:hidden flex items-center justify-around py-2 px-1 safe-area-bottom shadow-lg">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-xl transition ${
            activeTab === 'browse' ? 'text-emerald-800 dark:text-yellow-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-xl transition ${
            activeTab === 'categories' ? 'text-emerald-800 dark:text-yellow-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => {
            if (!user) onOpenAuth();
            else onOpenCreateListing();
          }}
          className="flex flex-col items-center justify-center -mt-5 bg-yellow-400 text-emerald-950 w-12 h-12 rounded-full shadow-lg shadow-yellow-500/30 active:scale-95 transition border border-yellow-500"
          aria-label="Sell Item"
        >
          <PlusCircle className="w-6 h-6 text-emerald-950" />
        </button>

        <button
          onClick={() => onOpenChat()}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-3 w-3.5 h-3.5 bg-yellow-400 text-emerald-950 text-[9px] font-black rounded-full flex items-center justify-center border border-yellow-500">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSideNavOpen(true)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-xl transition ${
            sideNavOpen ? 'text-emerald-800 dark:text-yellow-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </div>
    </>
  );
};
