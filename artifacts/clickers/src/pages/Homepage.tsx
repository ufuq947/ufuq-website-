import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Play } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useBooks, useAuthors } from '@/services/supabase.hooks';
import { SEO } from '@/components/SEO';

// ─── Hero ────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { isRTL } = useLanguage();

  return (
    <section className="relative min-h-screen overflow-hidden" data-testid="hero-section">
      {/* Full bleed background image — crystal clear */}
      <div className="absolute inset-0 z-0">
        <img
          src="/مكتبة سحرية تحت ضوء القمر.png"
          alt="library background"
          className="w-full h-full object-cover object-center"
        />
        {/* Very subtle dark overlay only on the RIGHT side where text lives (RTL) */}
        <div
          className="absolute inset-0"
          style={{
            background: isRTL
              ? 'linear-gradient(to right, rgba(5,2,0,0.0) 10%, rgba(5,2,0,0.15) 40%, rgba(5,2,0,0.65) 70%, rgba(5,2,0,0.80) 100%)'
              : 'linear-gradient(to left, rgba(5,2,0,0.0) 10%, rgba(5,2,0,0.15) 40%, rgba(5,2,0,0.65) 70%, rgba(5,2,0,0.80) 100%)',
          }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030610] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-8 lg:px-16 w-full pt-24 pb-20">
          {/* Text block on the dark side */}
          <motion.div
            className={`max-w-lg ${isRTL ? 'mr-auto' : 'ml-auto'} text-${isRTL ? 'right' : 'left'}`}
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tagline */}
            <motion.p
              className="font-arabic text-base mb-3 tracking-wide"
              style={{ color: 'rgba(200,168,75,0.85)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {isRTL ? 'كل قصة.. عالم جديد' : 'Every Story.. A New World'}
            </motion.p>

            {/* Main Headline */}
            <motion.h1
              className="font-arabic font-black leading-tight mb-5"
              style={{ color: '#f0e0c0', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              {isRTL ? (
                <>
                  <span style={{ color: '#c8a84b' }}>أُفق</span>
                  <span> للنشر والتوزيع</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#c8a84b' }}>Ufuq</span>
                  <span> Publishing</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="font-arabic text-base leading-loose mb-10"
              style={{ color: 'rgba(240,224,192,0.72)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              {isRTL
                ? 'نبدع للنشر المعرفة .. لمعرفة .. ونصل بقصصنا إلى كل مكان'
                : 'We innovate in publishing knowledge and reach with our stories everywhere.'}
            </motion.p>

            {/* Oval Gold CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Link href="/store">
                <motion.span
                  className="inline-flex items-center gap-3 font-arabic font-bold text-base cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #c8a84b 0%, #e8c96a 50%, #c8a84b 100%)',
                    color: '#1a0f05',
                    padding: '14px 36px',
                    borderRadius: '50px',
                    boxShadow: '0 4px 24px rgba(200,168,75,0.35)',
                  }}
                  whileHover={{ scale: 1.05, y: -2, boxShadow: '0 8px 32px rgba(200,168,75,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isRTL ? '← تصفح كتبنا' : 'Browse Books →'}
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Latest Books Carousel ────────────────────────────────────────────────────
function LatestBooksSection() {
  const { isRTL, language } = useLanguage();
  const { data: booksData } = useBooks({ status: undefined });
  const books = (booksData ?? []).slice(0, 10);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // Placeholder cards when no data yet
  const placeholders = Array.from({ length: 5 });

  return (
    <section className="py-16 relative" style={{ background: 'rgba(4,8,22,0.97)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Row header */}
        <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* "View All" link on left (or right in RTL) */}
          <Link href="/store">
            <motion.span
              className={`flex items-center gap-2 text-sm font-bold cursor-pointer transition-colors hover:opacity-80 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
              style={{ color: '#c8a84b' }}
              whileHover={{ x: isRTL ? 4 : -4 }}
            >
              {isRTL ? 'عرض جميع الإصدارات' : 'View All Releases'}
              {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.span>
          </Link>

          {/* Section title */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-xl" style={{ color: '#c8a84b' }}>✦</span>
            <h2 className={`text-2xl font-bold ${isRTL ? 'font-arabic' : 'font-cinematic'}`}
              style={{ color: '#f0e0c0' }}>
              {isRTL ? 'أحدث الإصدارات' : 'Latest Releases'}
            </h2>
          </div>
        </div>

        {/* Carousel wrapper */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll(isRTL ? 'right' : 'left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-80 hover:opacity-100 -translate-x-4"
            style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)', color: '#c8a84b' }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {books.length > 0
              ? books.map((book, i) => (
                  <motion.div
                    key={book.id}
                    className="flex-shrink-0 w-44 cursor-pointer group/card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -6 }}
                  >
                    <Link href={`/books/${book.id}`}>
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl mb-3"
                        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={language === 'ar' ? book.title_ar : book.title_en}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #2a1a08, #3d2810)' }}>
                            <BookOpen size={32} style={{ color: '#c8a84b', opacity: 0.5 }} />
                          </div>
                        )}
                        {/* Hover shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      </div>
                      <h3
                        className={`text-sm font-bold line-clamp-2 mb-1 ${isRTL ? 'text-right font-arabic' : ''}`}
                        style={{ color: '#f0e0c0' }}
                      >
                        {language === 'ar' ? book.title_ar : book.title_en}
                      </h3>
                      <p className={`text-xs ${isRTL ? 'text-right font-arabic' : ''}`}
                        style={{ color: 'rgba(200,168,75,0.75)' }}>
                        {(book as any).authors?.name_ar || (book as any).authors?.name_en || ''}
                      </p>
                    </Link>
                  </motion.div>
                ))
              : placeholders.map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-44 animate-pulse">
                    <div className="aspect-[2/3] rounded-2xl mb-3"
                      style={{ background: 'rgba(200,168,75,0.08)' }} />
                    <div className="h-4 rounded mb-2 w-3/4"
                      style={{ background: 'rgba(200,168,75,0.08)' }} />
                    <div className="h-3 rounded w-1/2"
                      style={{ background: 'rgba(200,168,75,0.06)' }} />
                  </div>
                ))
            }
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll(isRTL ? 'left' : 'right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-80 hover:opacity-100 translate-x-4"
            style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)', color: '#c8a84b' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Authors Section ─────────────────────────────────────────────────────────
function AuthorsSection() {
  const { isRTL, language } = useLanguage();
  const { data: authorsData } = useAuthors();
  const authors = (authorsData ?? []).slice(0, 6);

  return (
    <section className="py-16 relative" style={{ background: 'rgba(3,6,18,0.98)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className={`flex items-center justify-between mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/authors">
            <motion.span
              className={`flex items-center gap-2 text-sm font-bold cursor-pointer ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
              style={{ color: '#c8a84b' }}
              whileHover={{ x: isRTL ? 4 : -4 }}
            >
              {isRTL ? 'عرض جميع المؤلفين' : 'View All Authors'}
              {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.span>
          </Link>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-xl" style={{ color: '#c8a84b' }}>✦</span>
            <h2 className={`text-2xl font-bold ${isRTL ? 'font-arabic' : 'font-cinematic'}`}
              style={{ color: '#f0e0c0' }}>
              {isRTL ? 'مؤلفونا' : 'Our Authors'}
            </h2>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {authors.length > 0
            ? authors.map((author, i) => (
                <motion.div key={author.id}
                  className="text-center group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/authors`}>
                    <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-amber-600/50 group-hover:ring-4 group-hover:ring-amber-500 transition-all"
                      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                      {(author as any).photo_url ? (
                        <img src={(author as any).photo_url} alt={language === 'ar' ? (author as any).name_ar : (author as any).name_en}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                          style={{ background: 'linear-gradient(135deg,#2a1a08,#3d2810)', color: '#c8a84b' }}>
                          {((language === 'ar' ? (author as any).name_ar : (author as any).name_en) || '?')[0]}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs font-bold line-clamp-1 ${isRTL ? 'font-arabic' : ''}`}
                      style={{ color: '#f0e0c0' }}>
                      {language === 'ar' ? (author as any).name_ar : (author as any).name_en}
                    </p>
                  </Link>
                </motion.div>
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3"
                    style={{ background: 'rgba(200,168,75,0.08)' }} />
                  <div className="h-3 rounded w-16 mx-auto"
                    style={{ background: 'rgba(200,168,75,0.06)' }} />
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTASection() {
  const { isRTL } = useLanguage();
  return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060d28 0%, #0d1a40 50%, #060d28 100%)' }}>
      {/* Blue + Gold Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[350px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(59,100,220,0.18) 0%, rgba(200,168,75,0.08) 60%, transparent 100%)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-3xl mb-6" style={{ color: '#c8a84b' }}>✦</div>
          <h2 className={`text-3xl md:text-5xl font-bold mb-6 leading-tight ${isRTL ? 'font-arabic' : 'font-cinematic'}`}
            style={{ color: '#f0e0c0' }}>
            {isRTL ? 'انشر كتابك مع أفق للنشر والتوزيع' : 'Publish Your Book With Ufuq'}
          </h2>
          <p className={`text-lg mb-10 ${isRTL ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(240,224,192,0.6)' }}>
            {isRTL
              ? 'انضم إلى مجتمع المؤلفين لدينا واوصل قصتك إلى آلاف القراء حول العالم.'
              : 'Join our author community and reach thousands of readers around the world.'}
          </p>
          <div className={`flex flex-wrap gap-4 justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/auth">
              <motion.span
                className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold cursor-pointer ${isRTL ? 'font-arabic' : ''}`}
                style={{ background: '#c8a84b', color: '#1a0f05' }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {isRTL ? 'ابدأ الآن' : 'Get Started'}
              </motion.span>
            </Link>
            <Link href="/store">
              <motion.span
                className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold cursor-pointer border ${isRTL ? 'font-arabic' : ''}`}
                style={{ border: '1px solid rgba(200,168,75,0.4)', color: '#c8a84b', background: 'transparent' }}
                whileHover={{ scale: 1.05, y: -2, background: 'rgba(200,168,75,0.1)' }}
                whileTap={{ scale: 0.97 }}
              >
                {isRTL ? 'تصفح الكتب' : 'Browse Books'}
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export function Homepage() {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen" style={{ background: 'rgba(3,6,18,0.97)' }}>
      <SEO
        title={isRTL ? 'أفق للنشر والتوزيع' : 'Ufuq — Publishing House'}
        description={isRTL
          ? 'دار أفق للنشر والتوزيع — نبدع للنشر ونصل بقصصنا إلى كل مكان.'
          : 'Ufuq Publishing House — Spreading creativity and knowledge to every reader.'}
        type="website"
      />
      <HeroSection />
      <LatestBooksSection />
      <AuthorsSection />
      <CTASection />
    </div>
  );
}
