import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardEdit,
  Activity,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  History,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  Server,
  Bot,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FloatingChatWidget } from '../components/common/FloatingChatWidget';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'New Assessment', path: '/assessment', icon: ClipboardEdit },
  { name: 'Assessment Results', path: '/assessment/results', icon: Activity },
  { name: 'AI & ML Engine', path: '/ai-analysis', icon: BrainCircuit, badge: 'ML' },
  { name: 'Recommendations', path: '/recommendations', icon: Sparkles, badge: 'New' },
  { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'Live' },
  { name: 'Analytics & Trends', path: '/analytics', icon: TrendingUp },
  { name: 'Assessment History', path: '/history', icon: History },
  { name: 'User Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const AppLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#070b16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1222]/80 backdrop-blur-xl shrink-0 sticky top-0 h-screen z-30">
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-500 via-teal-400 to-violet-500 bg-clip-text text-transparent">
                LifeSync AI
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Lifestyle Platform
              </span>
            </div>
          </NavLink>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 py-3">
          <NavLink
            to="/assessment"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-sm shadow-cyan-500/25 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Take Assessment</span>
          </NavLink>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    item.badge === 'ML'
                      ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                      : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Non-medical ethics disclaimer reminder */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Educational lifestyle platform. Not medical advice.
            </p>
          </div>
        </div>

        {/* User profile bottom footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.profile?.full_name ? user.profile.full_name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.profile?.full_name || 'LifeSync User'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {user?.profile?.occupation || user?.email || 'Logged in'}
              </p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1222]/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <NavLink to="/dashboard" className="hover:text-cyan-500">App</NavLink>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI & ML Engine Ready</span>
            </div>

            {/* Dark/Light Theme Switch Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-xs bg-white dark:bg-[#0c1222] p-5 flex flex-col h-full shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-base bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
                  LifeSync AI
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-500 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  <span>Toggle Theme</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-500 font-medium"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Real-Time Floating AI Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};
