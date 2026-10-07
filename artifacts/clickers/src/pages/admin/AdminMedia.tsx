import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Video, Music, Play, Link, Clock, Type } from 'lucide-react';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { useMedia } from '@/services/supabase.hooks';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function AdminMedia() {
  const { data: media, isLoading } = useMedia('all');
  const [isAdding, setIsAdding] = useState(false);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    type: 'trailer' as 'video' | 'music' | 'trailer',
    url: '',
    duration: '',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('media').insert(form as any);
    if (error) {
      alert('حدث خطأ أثناء إضافة الوسائط');
    } else {
      setIsAdding(false);
      setForm({ title_ar: '', title_en: '', description_ar: '', description_en: '', type: 'trailer', url: '', duration: '' });
      qc.invalidateQueries({ queryKey: ['media'] });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا العنصر؟')) return;
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) alert('حدث خطأ أثناء الحذف');
    else qc.invalidateQueries({ queryKey: ['media'] });
  };

  return (
    <AdminLayout>
      <AdminPageHeader 
        title="إدارة مكتبة الوسائط" 
        subtitle="إدارة الإعلانات الترويجية ومقاطع الفيديو والموسيقى المصاحبة للكتب" 
      />

      <div className="mb-8 font-arabic">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
        >
          <Plus size={18} />
          {isAdding ? 'إلغاء' : 'إضافة فيديو / إعلان جديد'}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-3xl p-8 mb-10 font-arabic"
          dir="rtl"
        >
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 block text-right">
                  العنوان بالعربية *
                </label>
                <input
                  required
                  value={form.title_ar}
                  onChange={e => setForm({ ...form, title_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/50 outline-none text-sm"
                  placeholder="مثال: الإعلان الرسمي لرواية..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 block text-left">
                  العنوان بالإنجليزية *
                </label>
                <input
                  required
                  value={form.title_en}
                  onChange={e => setForm({ ...form, title_en: e.target.value })}
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/50 outline-none text-sm"
                  placeholder="Official Trailer..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 block">
                  النوع
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-amber-500/50 outline-none cursor-pointer text-sm"
                >
                  <option value="trailer" className="bg-slate-900 text-white">إعلان تشويقي (Trailer)</option>
                  <option value="video" className="bg-slate-900 text-white">مقطع فيديو (Video)</option>
                  <option value="music" className="bg-slate-900 text-white">موسيقى (Music)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 block">
                  رابط يوتيوب (YouTube URL)
                </label>
                <input
                  required
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/50 outline-none text-sm"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 block">
                  المدة
                </label>
                <input
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/50 outline-none text-sm"
                  placeholder="مثال: 2:45"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all"
            >
              حفظ ونشر العنصر
            </button>
          </form>
        </motion.div>
      )}

      {/* Media List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-arabic">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900/80 border-white/10 rounded-3xl h-64 animate-pulse border" />
          ))
        ) : (media ?? []).map((m) => (
          <motion.div
            key={m.id}
            layout
            className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-3xl p-6 flex flex-col justify-between group hover:border-amber-500/30 transition-all text-right"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`
                  px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 
                  ${m.type === 'trailer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : m.type === 'video' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}
                `}>
                  {m.type === 'trailer' ? <Play size={10} fill="currentColor" /> : m.type === 'video' ? <Video size={10} /> : <Music size={10} />}
                  {m.type === 'trailer' ? 'إعلان تشويقي' : m.type === 'video' ? 'فيديو' : 'موسيقى'}
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="text-white font-bold text-lg line-clamp-1 mb-1">{m.title_ar || m.title_en}</h3>
              <p className="text-slate-400 text-xs font-mono mb-2" dir="ltr">{m.title_en}</p>
              <p className="text-slate-400 text-xs line-clamp-2">{m.description_ar || 'لا يوجد وصف'}</p>
            </div>
            
            <div className="mt-6 flex items-center justify-between font-bold text-xs text-slate-400 pt-4 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {m.duration || '—'}
              </span>
              <a href={m.url} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">فتح الرابط</a>
            </div>
          </motion.div>
        ))}
        {!isLoading && (media ?? []).length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold">
            لا توجد عناصر وسائط حالياً. ابدأ بإضافة فيديو أو إعلان من الأزرار أعلاه.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
