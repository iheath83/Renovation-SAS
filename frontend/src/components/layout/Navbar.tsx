import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Home,
  CheckSquare,
  Package,
  PiggyBank,
  Sparkles,
  Building2,
  Menu,
  X,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import logoBlack from '@/assets/logo_black.svg';
import logoWhite from '@/assets/logo_white.svg';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pieces', icon: Home, label: 'Pièces' },
  { to: '/taches', icon: CheckSquare, label: 'Tâches' },
  { to: '/materiaux', icon: Package, label: 'Matériaux' },
  { to: '/budget', icon: PiggyBank, label: 'Budget' },
  { to: '/banque', icon: Building2, label: 'Banque' },
  { to: '/inspiration', icon: Sparkles, label: 'Inspiration' },
];

export function Navbar({ isMobileMenuOpen, onToggleMobileMenu }: NavbarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Ignore
      }
    }
  }, []);

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('user');
    queryClient.clear();
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-subtle">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={theme === 'dark' ? logoWhite : logoBlack}
                alt="RénoPilot"
                className="h-10 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                      'relative group',
                      isActive
                        ? 'text-primary-400'
                        : 'text-tertiary hover:text-primary hover:bg-overlay'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-lg bg-primary-600/10 border border-primary-500/20"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon className={cn('w-4 h-4 relative z-10')} />
                      <span className="relative z-10 font-medium text-sm">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center gap-2">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-overlay/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-primary">{user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-overlay text-tertiary hover:text-primary transition-colors"
                aria-label="Changer de thème"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Settings */}
              <NavLink
                to="/settings"
                className="p-2 rounded-lg hover:bg-overlay text-tertiary hover:text-primary transition-colors"
              >
                <Settings className="w-5 h-5" />
              </NavLink>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/10 text-tertiary hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-overlay text-tertiary transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onToggleMobileMenu}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-0 right-0 z-40 lg:hidden glass-dark border-b border-subtle max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onToggleMobileMenu}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                        isActive
                          ? 'bg-primary-600/20 text-primary-400'
                          : 'text-tertiary hover:text-primary hover:bg-overlay'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
