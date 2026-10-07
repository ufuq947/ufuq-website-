import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, Search, Upload, Loader2, 
  Library, Globe, Instagram, Twitter, 
  User as UserIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { 
  useAuthors, 
  useUpsertAuthor, 
  useUploadFile, 
  useBooks, 
  useAssignBooksToAuthor 
} from '@/services/supabase.hooks';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function AuthorFormModal({ author, onClose }: { author?: any; onClose: () => void }) {
  const upsert = useUpsertAuthor();
  const assignBooks = useAssignBooksToAuthor();
  const { data: allBooks } = useBooks();
  const { upload, isUploading } = useUploadFile();
  const { toast } = useToast();

  const [form, setForm] = useState<any>({
    name_ar: '', name_en: '', bio_ar: '', bio_en: '',
    photo_url: '', nationality: '', instagram: '', twitter: '', website: '',
    ...(author ?? {}),
  });

  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [showBookSelector, setShowBookSelector] = useState(false);

  useEffect(() => {
    if (author && allBooks) {
      const currentBooks = allBooks.filter(b => b.author_id === author.id).map(b => b.id);
      setSelectedBookIds(currentBooks);
    }
  }, [author, allBooks]);

  const set = (k: string, v: unknown) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await upload(file);
      set('photo_url', url);
      toast({ title: 'تم رفع الصورة الشخصية' });
    } catch (err) {
      toast({ title: 'فشل رفع الصورة', variant: 'destructive' });
    }
  };

  const toggleBook = (id: string) => {
    setSelectedBookIds(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result: any = await upsert.mutateAsync(form);
      if (result?.id) {
        await assignBooks.mutateAsync({
          authorId: result.id,
          bookIds: selectedBookIds
        });
      }
      toast({ title: author ? 'تم تحديث بيانات المؤلف' : 'تم إضافة المؤلف بنجاح' });
      onClose();
    } catch (err) {
      toast({ title: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-arabic" dir="rtl">
      <motion.div
        className="bg-slate-900 border border-slate-700/60 shadow-2xl rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col text-slate-100"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              {author ? 'تعديل بيانات المؤلف' : 'إضافة مؤلف جديد'}
            </h2>
            <p className="text-slate-400 font-medium text-xs">الصورة الشخصية والسيرة الذاتية والكتب</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Portrait Preview & Upload */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative group flex-shrink-0">
              {form.photo_url ? (
                <img src={form.photo_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <UserIcon size={32} />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="animate-spin text-amber-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-amber-400 font-bold tracking-wider text-xs mb-2">صورة المؤلف الشخصية</p>
              <input 
                type="file" 
                id="author-photo" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <Button 
                type="button" 
                disabled={isUploading}
                onClick={() => document.getElementById('author-photo')?.click()}
                className="rounded-xl gap-2 font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all py-2.5 px-4 h-auto"
              >
                <Upload size={14} />
                <span>رفع صورة جديدة</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block text-right">اسم المؤلف (بالعربية)</label>
              <input
                required
                value={form.name_ar}
                onChange={(e) => set('name_ar', e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 font-arabic text-right focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                placeholder="مثال: صلاح نور"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block text-left">اسم المؤلف (بالإنجليزية)</label>
              <input
                required
                value={form.name_en}
                onChange={(e) => set('name_en', e.target.value)}
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                placeholder="e.g. Salah Nour"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { icon: <Globe size={14}/>, label: 'الجنسية', key: 'nationality' },
               { icon: <Twitter size={14}/>, label: 'تويتر (X)', key: 'twitter' },
               { icon: <Instagram size={14}/>, label: 'إنستغرام', key: 'instagram' },
             ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-amber-400 block flex items-center gap-2">
                    {field.icon} {field.label}
                  </label>
                  <input
                    value={form[field.key] || ''}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                  />
                </div>
             ))}
          </div>

          {/* Book Bibliography Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowBookSelector(!showBookSelector)}
              className="w-full p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group bg-slate-950"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Library size={18} />
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200 text-xs tracking-wider">ربط الكتب بالمؤلف</p>
                  <p className="text-slate-400 text-xs">
                    {selectedBookIds.length} كتاب مرتبط بهذا المؤلف
                  </p>
                </div>
              </div>
              {showBookSelector ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>

            <AnimatePresence>
              {showBookSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-60 overflow-y-auto custom-scrollbar">
                      {allBooks?.map((book: any) => (
                        <label 
                          key={book.id} 
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedBookIds.includes(book.id) 
                            ? 'bg-amber-500/20 border-amber-500 text-white' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={selectedBookIds.includes(book.id)}
                            onChange={() => toggleBook(book.id)}
                          />
                          <div className="w-8 h-11 bg-slate-950 rounded border border-slate-800 overflow-hidden flex-shrink-0">
                            {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="font-bold text-xs truncate text-white font-arabic">
                              {book.title_ar || book.title_en}
                            </p>
                            <p className="text-[11px] truncate text-slate-400 font-arabic">
                              {book.worlds ? (book.worlds.name_ar || book.worlds.name_en) : 'عمل مستقل'}
                            </p>
                          </div>
                        </label>
                      ))}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-xs font-bold tracking-wider text-amber-400 block">السيرة الذاتية (بالعربية)</label>
            <textarea 
              value={form.bio_ar} 
              onChange={(e) => set('bio_ar', e.target.value)} 
              rows={3} 
              dir="rtl" 
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white font-arabic focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm" 
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold tracking-wider text-amber-400 block">السيرة الذاتية (بالإنجليزية)</label>
            <textarea 
              value={form.bio_en} 
              onChange={(e) => set('bio_en', e.target.value)} 
              rows={3} 
              dir="ltr"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm" 
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-sm">
              إلغاء
            </button>
            <button type="submit" disabled={upsert.isPending} className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all text-sm shadow-lg shadow-amber-500/30 disabled:opacity-50">
              {upsert.isPending ? 'جاري الحفظ...' : (author ? 'حفظ التغييرات' : 'إضافة المؤلف')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function AdminAuthors() {
  const { data: authors, isLoading } = useAuthors();
  const [editing, setEditing] = useState<any>(undefined);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { toast } = useToast();

  const filtered = (authors ?? []).filter((a) =>
    (a.name_ar && a.name_ar.includes(search)) || (a.name_en && a.name_en.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا المؤلف؟ ستبقى كتبه محفوظة بدون ربط بهذا المؤلف.')) return;
    try {
      await supabase.from('authors').delete().eq('id', id);
      qc.invalidateQueries({ queryKey: ['authors'] });
      toast({ title: 'تم حذف المؤلف بنجاح' });
    } catch (err) {
      toast({ title: 'فشل حذف المؤلف', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="إدارة المؤلفين والكتّاب"
        subtitle={`إجمالي المؤلفين: ${authors?.length ?? 0}`}
        action={
          <Button
            onClick={() => setEditing(null)}
            className="rounded-2xl gap-3 font-black text-xs py-6 px-8 h-auto bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 font-arabic"
          >
            <Plus size={18} /> إضافة مؤلف جديد
          </Button>
        }
      />

      <div className="relative mb-12 max-w-md font-arabic">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="ابحث عن مؤلف..." 
          className="w-full pr-12 pl-4 py-4 bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-[2rem] font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-sm" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-arabic">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-[3rem] p-8 animate-pulse h-60" />
            ))
          : filtered.map((author) => (
              <motion.div
                key={author.id}
                className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-[3rem] p-8 group hover:border-amber-500/30 transition-all relative overflow-hidden text-right"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-6 mb-6">
                  {author.photo_url ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-500/40 rotate-3 group-hover:rotate-0 transition-all duration-500 flex-shrink-0">
                      <img src={author.photo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 font-black text-2xl flex-shrink-0 border border-amber-500/20">
                      {(author.name_ar || author.name_en || 'أ')[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-white text-xl">{author.name_ar || author.name_en}</h3>
                    <p className="text-amber-400 text-xs font-bold">{author.nationality || 'مؤلف معتمد'}</p>
                  </div>
                </div>
                {(author.bio_ar || author.bio_en) && (
                  <p className="text-slate-400 text-sm line-clamp-2 mb-8 leading-relaxed italic">
                    "{author.bio_ar || author.bio_en}"
                  </p>
                )}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <Button
                    onClick={() => setEditing(author)}
                    variant="outline"
                    className="flex-1 rounded-xl gap-2 font-bold text-xs border-white/10 hover:bg-amber-500 hover:text-slate-950 transition-all h-10"
                  >
                    <Pencil size={12} /> تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(author.id)}
                    variant="outline"
                    className="rounded-xl border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all h-10 w-10 px-0"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </motion.div>
            ))}
      </div>

      <AnimatePresence>
        {editing !== undefined && (
          <AuthorFormModal author={editing} onClose={() => setEditing(undefined)} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
