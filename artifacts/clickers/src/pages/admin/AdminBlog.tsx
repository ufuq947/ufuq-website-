import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { useBlogPosts, useUpsertBlogPost, useAuthors, useUploadFile } from '@/services/supabase.hooks';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/lib/database.types';

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

const CATEGORIES_AR = ['أدبي', 'أخبار الدار', 'مقابلات', 'مراجعة كتاب', 'ثقافة', 'عام'];
const CATEGORIES = ['Literary', 'News', 'Interview', 'Review', 'Culture', 'General'];

function BlogFormModal({ post, onClose }: { post?: Record<string, unknown> | null; onClose: () => void }) {
  const { data: authors } = useAuthors();
  const upsert = useUpsertBlogPost();
  const { upload, isUploading: isUploadingFile } = useUploadFile();
  const [form, setForm] = useState<Record<string, unknown>>({
    title_ar: '', title_en: '', excerpt_ar: '', excerpt_en: '',
    content_ar: '', content_en: '', author_id: '', image_url: '',
    category: 'Literary', read_time: '5 دقائق', status: 'draft',
    ...(post ?? {}),
  });
  const [isUploading, setIsUploading] = useState(false);
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-arabic" dir="rtl">
      <motion.div
        className="bg-slate-900 border border-slate-700/60 shadow-2xl rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-slate-100"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            {post ? 'تعديل المقال' : 'إضافة مقال جديد'}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center font-bold text-lg">✕</button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = { ...form } as Record<string, unknown>;
            if (payload.status === 'published' && !payload.published_at) {
              payload.published_at = new Date().toISOString();
            }
            if (!payload.author_id) delete payload.author_id;
            
            delete (payload as any).authors;

            await upsert.mutateAsync(payload);
            onClose();
          }}
          className="p-6 md:p-8 space-y-6"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">صورة الغلاف</label>
            <div className="flex gap-4 items-center">
              {Boolean(form.image_url) && (
                <img src={form.image_url as string} alt="Preview" className="h-20 w-36 object-cover rounded-xl shadow-lg border border-slate-800" />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const url = await upload(file, 'covers');
                      set('image_url', url);
                    } catch (err) {
                      console.error('Blog image upload error:', err);
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs file:ml-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 transition-all cursor-pointer"
                />
                <p className="text-xs text-slate-400 tracking-wider mt-2 font-medium">
                  {isUploading ? 'جاري الرفع...' : 'الحجم المستحسن: 1200x800 بكسل'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">العنوان بالعربية *</label>
              <input required value={(form.title_ar as string) || ''} onChange={(e) => set('title_ar', e.target.value)} dir="rtl" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 font-arabic focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">العنوان بالإنجليزية *</label>
              <input required value={(form.title_en as string) || ''} onChange={(e) => set('title_en', e.target.value)} dir="ltr" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">المؤلف / الكاتب</label>
              <select value={(form.author_id as string) || ''} onChange={(e) => set('author_id', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium">
                <option value="" className="bg-slate-900 text-white">بدون مؤلف محدد</option>
                {authors?.map((a) => <option key={a.id} value={a.id} className="bg-slate-900 text-white">{a.name_ar || a.name_en}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">التصنيف</label>
              <select value={(form.category as string) || 'Literary'} onChange={(e) => set('category', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium">
                {CATEGORIES.map((c, idx) => <option key={c} value={c} className="bg-slate-900 text-white">{CATEGORIES_AR[idx] || c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">وقت القراءة المتوقع</label>
              <input value={(form.read_time as string) || ''} onChange={(e) => set('read_time', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium" placeholder="5 دقائق" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">الملخص بالعربية</label>
              <textarea value={(form.excerpt_ar as string) || ''} onChange={(e) => set('excerpt_ar', e.target.value)} rows={3} dir="rtl" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 font-arabic focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">الملخص بالإنجليزية</label>
              <textarea value={(form.excerpt_en as string) || ''} onChange={(e) => set('excerpt_en', e.target.value)} rows={3} dir="ltr" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">المحتوى الكامل بالعربية</label>
              <textarea value={(form.content_ar as string) || ''} onChange={(e) => set('content_ar', e.target.value)} rows={6} dir="rtl" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 font-arabic focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-amber-400 mb-2">المحتوى الكامل بالإنجليزية</label>
              <textarea value={(form.content_en as string) || ''} onChange={(e) => set('content_en', e.target.value)} rows={6} dir="ltr" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm font-medium" />
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold tracking-wider text-amber-400">حالة النشر</label>
              <div className="flex gap-2">
                {[
                  { key: 'draft', label: 'مسودة' },
                  { key: 'published', label: 'منشور' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => set('status', s.key)}
                    className={`px-5 py-2 rounded-xl font-bold text-xs tracking-wider transition-all ${form.status === s.key ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-sm">إلغاء</button>
              <button type="submit" disabled={upsert.isPending} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all text-sm shadow-lg shadow-amber-500/30 disabled:opacity-50">
                {upsert.isPending ? 'جاري الحفظ...' : (post ? 'حفظ التغييرات' : 'نشر المقال')}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function AdminBlog() {
  const { data: posts, isLoading } = useBlogPosts({ status: undefined });
  const [editing, setEditing] = useState<Record<string, unknown> | null | undefined>(undefined);
  const qc = useQueryClient();

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا المقال؟')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['blog'] });
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'published' ? 'draft' : 'published';
    const update: BlogPostUpdate = { status: newStatus };
    if (newStatus === 'published') update.published_at = new Date().toISOString();
    await supabase.from('blog_posts').update(update as never).eq('id', id);
    qc.invalidateQueries({ queryKey: ['blog'] });
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="إدارة المقالات والأخبار"
        subtitle={`إجمالي المقالات: ${posts?.length ?? 0}`}
        action={
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 font-black rounded-2xl hover:bg-amber-400 transition-all text-sm shadow-xl shadow-amber-500/20 font-arabic"
          >
            <Plus size={18} /> كتابة مقال جديد
          </button>
        }
      />

      <div className="space-y-4 font-arabic">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-2xl p-6 animate-pulse h-24" />
            ))
          : (posts ?? []).map((post) => (
              <motion.div
                key={post.id}
                className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-2xl p-6 flex items-center gap-6 group hover:border-amber-500/30 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-20 h-14 object-cover rounded-xl shadow-sm flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-bold text-white text-lg line-clamp-1">{post.title_ar || post.title_en}</h3>
                      <p className="text-slate-400 text-sm line-clamp-1 font-mono">{post.title_en}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-3 py-1 bg-white/5 text-slate-300 font-bold text-xs rounded-lg border border-white/5">{post.category}</span>
                      <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${post.status === 'published' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                        {post.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy') : 'غير منشور'}
                    </span>
                    <span>{post.read_time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleToggleStatus(post.id as string, post.status)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${post.status === 'published' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                    title={post.status === 'published' ? 'إلغاء النشر' : 'نشر المقال'}
                  >
                    {post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => setEditing(post as Record<string, unknown>)}
                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-all"
                    title="تعديل"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id as string)}
                    className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
        {!isLoading && (posts ?? []).length === 0 && (
          <div className="text-center py-20 text-slate-500 font-bold">لا توجد مقالات مسجلة حالياً</div>
        )}
      </div>

      <AnimatePresence>
        {editing !== undefined && (
          <BlogFormModal post={editing} onClose={() => setEditing(undefined)} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
