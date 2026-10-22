import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  BookOpen,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      api
        .get('/analytics/streak')
        .then((res) => {
          if (res.data?.currentStreak !== undefined) {
            setStreak(res.data.currentStreak);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                LearnTrack
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                v1.0
              </span>
            </div>
          </Link>
        </div>

        {/* Right section: Streak Pill, Notifications & User Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Daily Streak Indicator */}
          <Link
            to="/analytics"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
            title="Current Daily Streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>{streak}d streak</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Active</span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/60">
                    <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> AI Skill Engine Ready
                    </p>
                    <p className="text-slate-600 mt-1">
                      Run an evaluation in AI Insights to compare your progress against your career path.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/60">
                    <p className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-600" /> Keep the Streak Burning
                    </p>
                    <p className="text-slate-600 mt-1">
                      Log at least one study session today to maintain your consecutive learning streak.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center font-bold text-xs text-indigo-700 shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Student Profile
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
