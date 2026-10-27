import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  LayoutDashboard, BookOpen, ClipboardList, Trophy, Award,
  User, LogOut, Menu, X, BarChart3, ShieldCheck, ChevronDown
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/pledges', label: 'Pledges', icon: <BookOpen className="w-4 h-4" /> },
    { path: '/activity', label: 'Track Activity', icon: <ClipboardList className="w-4 h-4" /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { path: '/certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { path: '/monitor', label: 'Live Monitor', icon: <BarChart3 className="w-4 h-4" /> },
  ];
  const reviewerLinks = [{ path: '/reviewer', label: 'Reviewer Portal', icon: <ShieldCheck className="w-4 h-4" /> }];
  const adminLinks = [{ path: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }];
  const extraLinks =
    user?.role === 'admin' ? [...reviewerLinks, ...adminLinks] :
    user?.role === 'reviewer' ? reviewerLinks : [];
  const allLinks = [...navLinks, ...extraLinks];
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-300 shadow-none">
      <div className="mx-auto max-w-7xl px-3 min-[360px]:px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 min-w-0 items-center justify-between gap-2 sm:gap-3">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden md:flex-none md:gap-2.5">
            <span className="truncate whitespace-nowrap font-display text-sm font-bold text-slate-900 min-[360px]:text-base">TerraLedger</span>
            <span className="hidden lg:block text-xs text-slate-400 font-medium">India Carbon Impact</span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {allLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`relative flex h-16 items-center gap-1.5 px-3 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'border-b-2 border-brand-700 text-brand-800 font-semibold'
                    : 'border-b-2 border-transparent text-slate-600 hover:border-slate-500 hover:text-slate-900'
                }`}
              >
                {link.icon}{link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
            
            {user ? <div className="relative hidden md:block" ref={profileRef}>
              <button
                type="button"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-sm hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 bg-brand-700 rounded-sm flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name ?? 'User'}</p>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role ?? 'participant'}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-300 rounded-sm shadow-md py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'User'}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role ?? 'participant'}</p>
                  </div>
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md mx-1">
                    <User className="w-4 h-4 text-slate-400" />My Profile
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                </div>
              )}
            </div> : null}
            <button type="button" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen} className="md:hidden flex-shrink-0 p-2 rounded-sm hover:bg-slate-100 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-300 bg-white shadow-md">
          <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {allLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.icon}{link.label}
              </Link>
            ))}
            {user ? <div className="border-t border-slate-100 pt-2 mt-2 space-y-0.5">
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                <User className="w-4 h-4 text-slate-400" />Profile
              </Link>
            </div> : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
