import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { AdminLayout, AdminPageHeader, StatCard } from '@/components/admin/AdminLayout';
import { useAnalytics, useBooks } from '@/services/supabase.hooks';

const GENRE_COLORS = ['#c8a84b', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AdminAnalytics() {
  const { data: analytics, isLoading } = useAnalytics();
  const { data: books } = useBooks({ status: undefined });

  const revenueData = (analytics?.salesByDay ?? []).slice(0, 30).reverse().map((d) => ({
    date: format(new Date((d as { sale_date: string }).sale_date), 'MM/dd'),
    revenue: Number((d as { revenue: number }).revenue),
    orders: Number((d as { order_count: number }).order_count),
  }));

  // Genre distribution from books
  const genreMap = (books ?? []).reduce((acc: Record<string, number>, b) => {
    const genreLabel = b.genre_ar || b.genre;
    acc[genreLabel] = (acc[genreLabel] || 0) + 1;
    return acc;
  }, {});
  const genreData = Object.entries(genreMap).map(([name, value]) => ({ name, value }));

  return (
    <AdminLayout>
      <AdminPageHeader title="التحليلات وتقارير الأداء" subtitle="رؤى تفصيلية حول الإيرادات والطلبات وأداء الكتب" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10 font-arabic">
        <StatCard label="إجمالي الإيرادات" value={`${(analytics?.totalRevenue ?? 0).toLocaleString()} ج.م`} icon={TrendingUp} color="amber" />
        <StatCard label="إجمالي الطلبات" value={analytics?.totalOrders ?? 0} icon={ShoppingBag} color="sky" />
        <StatCard label="المستخدمين المسجلين" value={analytics?.totalUsers ?? 0} icon={Users} color="emerald" />
        <StatCard label="إجمالي الكتب" value={books?.length ?? 0} icon={BookOpen} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 font-arabic">
        {/* Revenue Over Time */}
        <div className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl p-8 border lg:col-span-2">
          <h2 className="text-xl font-black text-white mb-1">الإيرادات والطلبات — آخر 30 يوماً</h2>
          <p className="text-slate-400 text-sm font-semibold mb-8">مخطط أداء المبيعات اليومي</p>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8a84b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c8a84b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.7)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#090d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" name="الإيرادات (ج.م)" stroke="#c8a84b" strokeWidth={2.5} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="orders" name="عدد الطلبات" stroke="#38bdf8" strokeWidth={2.5} fill="url(#ordGrad)" />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-500 font-bold">لا توجد بيانات مبيعات حالياً</div>
          )}
        </div>

        {/* Top Books Bar Chart */}
        <div className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl p-8 border">
          <h2 className="text-xl font-black text-white mb-1">الكتب الأكثر مبيعاً</h2>
          <p className="text-slate-400 text-sm font-semibold mb-8">حسب عدد النسخ المباعة</p>
          {(analytics?.topBooks ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={(analytics?.topBooks ?? []).slice(0, 6).map((b) => ({ name: ((b as { title_ar: string; title_en: string }).title_ar || (b as { title_en: string }).title_en)?.slice(0, 15) + '…', sold: Number((b as { total_sold: number }).total_sold) }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.7)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#090d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
                <Bar dataKey="sold" name="المبيعات" fill="#c8a84b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-500 font-bold">لا توجد مبيعات مسجلة بعد</div>
          )}
        </div>

        {/* Genre Pie Chart */}
        <div className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl p-8 border">
          <h2 className="text-xl font-black text-white mb-1">توزيع الكتب حسب التصنيف</h2>
          <p className="text-slate-400 text-sm font-semibold mb-8">نسب الأقسام والتصنيفات في الفهرس</p>
          {genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={100} innerRadius={55} paddingAngle={3}>
                  {genreData.map((_, index) => (
                    <Cell key={index} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#090d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-500 font-bold">لا توجد كتب مسجلة بعد</div>
          )}
        </div>
      </div>

      {/* Top Books Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl border overflow-hidden font-arabic">
        <div className="px-8 py-6 border-b border-white/10">
          <h2 className="text-xl font-black text-white">تفاصيل إيرادات الكتب الأكثر مبيعاً</h2>
        </div>
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['الترتيب', 'الكتاب', 'النسخ المباعة', 'الإيرادات (ج.م)'].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-black tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(analytics?.topBooks ?? []).map((book, i) => (
              <motion.tr
                key={(book as { id: string }).id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <td className="px-6 py-4">
                  <span className="text-2xl font-mono font-black text-amber-400">0{i + 1}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {(book as { cover_url?: string }).cover_url && (
                      <img src={(book as { cover_url: string }).cover_url} alt="" className="w-8 h-12 object-cover rounded-lg shadow-sm" />
                    )}
                    <div>
                      <p className="font-bold text-white text-sm" dir="rtl">{(book as { title_ar: string }).title_ar || (book as { title_en: string }).title_en}</p>
                      <p className="text-slate-400 text-xs font-mono">{(book as { title_en: string }).title_en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-black text-white">{(book as { total_sold: number }).total_sold}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-black text-amber-400">{Number((book as { total_revenue: number }).total_revenue).toFixed(2)} ج.م</span>
                </td>
              </motion.tr>
            ))}
            {(analytics?.topBooks ?? []).length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-slate-500 font-bold">لا توجد بيانات مبيعات مسجلة حتى الآن</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
