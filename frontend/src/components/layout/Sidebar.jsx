import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Clock3,
  Target,
  BarChart3,
  Trophy,
  Brain,
  User,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/roadmaps', label: 'Roadmaps', icon: Map },
  { to: '/sessions', label: 'Study Sessions', icon: Clock3 },
  { to: '/goals', label: 'Goals & Deadlines', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/ai-insights', label: 'AI Skill Insights', icon: Brain, badge: 'AI' },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar element */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out border-r border-slate-800
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div className="flex flex-col h-full py-4 px-3 justify-between">
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Platform Navigation
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Card / Project Info */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>LearnTrack Platform</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Mini Project II • Team No. 36
            </p>
            <p className="text-[10px] text-slate-500 pt-1">
              Spring Boot + FastAPI + React
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
