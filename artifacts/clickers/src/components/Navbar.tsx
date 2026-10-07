import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/useAuth';
import { useCart } from '@/contexts/CartContext';

// ── NAV LINK CONFIG ──────────────────────────────────────────
const NAV_LINKS_AR = [
  { href: '/', label: 'الرئيسية' },
  { href: '/store', label: 'الكتب' },
  { href: '/authors', label: 'المؤلفون' },
  { href: '/about', label: 'عن أفق' },
  { href: '/blog', label: 'أخبارنا' },
  { href: '/about', label: 'تواصل معنا' },
];

const NAV_LINKS_EN = [
  { href: '/', label: 'Home' },
  { href: '/store', label: 'Books' },
  { href: '/authors', label: 'Authors' },
  { href: '/about', label: 'About Ufuq' },
  { href: '/blog', label: 'News' },
  { href: '/about', label: 'Contact Us' },
];

const GOLD = '#c8a84b';
const GOLD_DIM = 'rgba(200,168,75,0.72)';
const DARK_NAVY = 'rgba(4, 8, 22, 0.92)';
const CARD_BG = 'rgba(6, 10, 28, 0.96)';
const BORDER_BLUE = 'rgba(200,168,75,0.15)';

export function Navbar() {
  const { isRTL, toggleLanguage } = useLanguage();
  const { profile, isAdmin, signOut } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [location] = useLocation();

  const navLinks = isRTL ? NAV_LINKS_AR : NAV_LINKS_EN;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setShowUserMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: isScrolled ? DARK_NAVY : 'transparent',
          backdropFilter: isScrolled ? 'blur(18px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(200,168,75,0.1)' : 'none',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        dir="rtl"
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="flex items-center h-16 md:h-20">

            {/* ── RIGHT: Logo (always RTL — positioned on right) ── */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                data-testid="nav-logo"
              >
                <img
                  src="/٢٠٢٦٠٢٢٦_٢٢٠١٢٦.jpg.jpeg"
                  alt="أفق للنشر والتوزيع"
                  className="w-14 h-14 object-contain flex-shrink-0"
                />
              </motion.div>
            </Link>

            {/* ── CENTER: Nav Links ── */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link key={link.label} href={link.href}>
                    <motion.span
                      className="relative px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 font-arabic whitespace-nowrap"
                      style={{ color: isActive ? '#f0e0c0' : GOLD_DIM }}
                      whileHover={{ color: '#f0e0c0' }}
                      data-testid={`nav-link-${link.label}`}
                    >
                      {link.label}
                      {/* Active underline */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-indicator"
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                          style={{ background: GOLD }}
                        />
                      )}
                    </motion.span>
                  </Link>
                );
              })}
            </div>

            {/* ── LEFT: Icons ── */}
            <div className="flex items-center gap-1 flex-shrink-0 mr-auto" dir="ltr">

              {/* Search */}
              <motion.button
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                style={{ color: GOLD_DIM }}
                whileHover={{ color: '#f0e0c0', scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={18} />
              </motion.button>

              {/* User/Profile */}
              {profile ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                    style={{ color: GOLD_DIM }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    whileHover={{ color: '#f0e0c0', scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User size={18} />
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        className="absolute top-full mt-2 left-0 w-48 rounded-xl overflow-hidden z-50 shadow-2xl"
                        style={{ background: CARD_BG, border: '1px solid ' + BORDER_BLUE }}
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        dir="rtl"
                      >
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(200,168,75,0.1)' }}>
                          <p className="font-bold text-sm truncate font-arabic" style={{ color: '#f0e0c0' }}>{profile.full_name || 'قارئ'}</p>
                          <p className="text-xs truncate" style={{ color: GOLD_DIM }}>{profile.email}</p>
                        </div>
                        <div className="p-2">
                          <Link href="/my-orders">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all font-arabic text-sm"
                              style={{ color: GOLD_DIM }}
                              onClick={() => setShowUserMenu(false)}>
                              <ShoppingCart size={14} />
                              طلباتي
                            </div>
                          </Link>
                          {isAdmin && (
                            <Link href="/admin">
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all font-arabic text-sm"
                                style={{ color: GOLD_DIM }}
                                onClick={() => setShowUserMenu(false)}>
                                <LayoutDashboard size={14} />
                                لوحة التحكم
                              </div>
                            </Link>
                          )}
                          <button
                            onClick={() => { signOut(); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-arabic text-sm text-red-400 hover:bg-red-900/20"
                          >
                            <LogOut size={14} />
                            خروج
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth">
                  <motion.button
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                    style={{ color: GOLD_DIM }}
                    whileHover={{ color: '#f0e0c0', scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User size={18} />
                  </motion.button>
                </Link>
              )}

              {/* Separator */}
              <div className="w-px h-5 mx-1" style={{ background: 'rgba(200,168,75,0.3)' }} />

              {/* Cart */}
              <motion.button
                className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                style={{ color: GOLD_DIM }}
                whileHover={{ color: '#f0e0c0', scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCart}
                data-testid="cart-button"
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-black rounded-full flex items-center justify-center"
                    style={{ background: GOLD, color: '#1a0f05' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </motion.button>

              {/* Language toggle */}
              <motion.button
                onClick={toggleLanguage}
                className="hidden md:flex text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ml-1"
                style={{ color: GOLD_DIM, border: '1px solid rgba(200,168,75,0.2)' }}
                whileHover={{ color: GOLD, borderColor: 'rgba(200,168,75,0.5)' }}
              >
                {isRTL ? 'EN' : 'عربي'}
              </motion.button>

              {/* Mobile hamburger */}
              <motion.button
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg ml-1"
                style={{ border: '1px solid rgba(200,168,75,0.25)', color: GOLD }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
                data-testid="mobile-menu-button"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              className="border-t px-6 py-3"
              style={{ borderColor: 'rgba(200,168,75,0.12)', background: DARK_NAVY }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              dir="rtl"
            >
              <div className="max-w-xl mx-auto flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.18)' }}>
                <Search size={16} style={{ color: GOLD_DIM }} />
                <input
                  type="text"
                  placeholder="ابحث عن كتاب أو مؤلف..."
                  className="flex-1 bg-transparent outline-none text-sm font-arabic"
                  style={{ color: '#f0e0c0' }}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(4,8,22,0.97)', backdropFilter: 'blur(20px)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 rounded-t-3xl p-6 pb-10 z-50 max-h-[80vh] overflow-y-auto"
              style={{ background: 'rgba(5,10,28,0.99)', border: '1px solid rgba(200,168,75,0.15)', borderBottom: 'none' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              dir="rtl"
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'rgba(200,168,75,0.3)' }} />
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={link.href}>
                      <span
                        className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold cursor-pointer font-arabic transition-all"
                        style={{ color: location === link.href ? GOLD : GOLD_DIM }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-6 pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(200,168,75,0.1)' }}>
                  <Link href="/store">
                    <span
                      className="block w-full text-center py-3 rounded-xl text-base font-black cursor-pointer font-arabic"
                      style={{ background: GOLD, color: '#1a0f05' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      تصفح الكتب
                    </span>
                  </Link>
                  {profile ? (
                    <button
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-arabic text-red-400"
                      style={{ border: '1px solid rgba(200,50,50,0.2)' }}
                    >
                      <LogOut size={16} />
                      خروج
                    </button>
                  ) : (
                    <Link href="/auth">
                      <span
                        className="block w-full text-center py-3 rounded-xl text-base font-bold cursor-pointer font-arabic"
                        style={{ border: '1px solid rgba(200,168,75,0.3)', color: GOLD }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        تسجيل الدخول
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
