import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, Globe, Book,
  Check, X, Palette, Image as ImageIcon, Star,
  Library, ChevronDown, ChevronUp, Upload, Loader2
} from 'lucide-react';
import { 
  AdminLayout, 
  AdminPageHeader 
} from '@/components/admin/AdminLayout';
import { 
  useWorlds, 
  useUpsertWorld, 
  useDeleteWorld,
  useUploadFile,
  useBooks,
  useAssignBooksToWorld
} from '@/services/supabase.hooks';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AdminWorlds() {
  const { data: worlds, isLoading } = useWorlds();
  const { data: allBooks } = useBooks();
  const upsertWorld = useUpsertWorld();
  const deleteWorld = useDeleteWorld();
  const assignBooks = useAssignBooksToWorld();
  const { upload, isUploading } = useUploadFile();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorld, setEditingWorld] = useState<any>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    banner_url: '',
    color_primary: '#c8a84b',
    is_featured: false,
  });

  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  const handleOpenModal = (world: any = null) => {
    if (world) {
      setEditingWorld(world);
      setFormData({
        name_ar: world.name_ar,
        name_en: world.name_en,
        description_ar: world.description_ar || '',
        description_en: world.description_en || '',
        banner_url: world.banner_url || '',
        color_primary: world.color_primary || '#c8a84b',
        is_featured: world.is_featured || false,
      });
      const currentBooks = allBooks?.filter(b => b.world_id === world.id).map(b => b.id) || [];
      setSelectedBookIds(currentBooks);
    } else {
      setEditingWorld(null);
      setFormData({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        banner_url: '',
        color_primary: '#c8a84b',
        is_featured: false,
      });
      setSelectedBookIds([]);
    }
    setShowBookSelector(false);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await upload(file);
      setFormData({ ...formData, banner_url: url });
      toast({ title: 'تم رفع صورة البانر بنجاح' });
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
      const payload: any = {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        description_ar: formData.description_ar,
        description_en: formData.description_en,
        banner_url: formData.banner_url,
        color_primary: formData.color_primary,
        is_featured: formData.is_featured,
      };

      if (editingWorld) payload.id = editingWorld.id;

      const savedWorld: any = await upsertWorld.mutateAsync(payload);

      if (savedWorld?.id) {
        await assignBooks.mutateAsync({
          worldId: savedWorld.id,
          bookIds: selectedBookIds
        });
      }

      toast({ title: editingWorld ? 'تم تحديث بيانات العالم' : 'تم إضافة العالم بنجاح' });
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذا العالم الأدبي؟ ستبقى الكتب محفوظة بدون ربط بهذا العالم.')) {
      try {
        await deleteWorld.mutateAsync(id);
        toast({ title: 'تم حذف العالم الأدبي بنجاح' });
      } catch (err) {
        toast({ title: 'فشل عملية الحذف', variant: 'destructive' });
      }
    }
  };

  const filteredWorlds = worlds?.filter(w => 
    (w.name_ar && w.name_ar.includes(searchQuery)) || 
    (w.name_en && w.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <AdminLayout>
      <AdminPageHeader
        title="إدارة العوالم الأدبية"
        subtitle={`إجمالي العوالم الأدبية: ${worlds?.length || 0}`}
        action={
          <Button 
            onClick={() => handleOpenModal()}
            className="rounded-2xl gap-3 font-bold text-xs py-6 px-8 h-auto bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 font-arabic"
          >
            <Plus size={18} /> إضافة عالم أدبي جديد
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative mb-12 max-w-md font-arabic">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="ابحث عن عالم أدبي..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-4 bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-[2rem] font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-sm"
        />
      </div>

      {/* Worlds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-arabic">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900/80 border-white/10 rounded-[3rem] p-8 animate-pulse h-80 border" />
          ))
        ) : filteredWorlds.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-bold">
            لا توجد عوالم أدبية مسجلة
          </div>
        ) : (
          filteredWorlds.map(world => {
            const connectedBooks = allBooks?.filter(b => b.world_id === world.id) || [];

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-[3rem] p-8 group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Banner Accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-3" 
                  style={{ background: world.color_primary || '#c8a84b' }}
                />

                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 flex-shrink-0 flex items-center justify-center">
                      {world.banner_url ? (
                        <img src={world.banner_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Globe size={24} className="text-amber-400" />
                      )}
                    </div>
                    {world.is_featured && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Star size={12} className="fill-amber-400" /> مميز
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white mb-2">{world.name_ar || world.name_en}</h3>
                  <p className="text-slate-400 text-xs font-mono mb-4" dir="ltr">{world.name_en}</p>
                  
                  <p className="text-slate-300/80 text-sm leading-relaxed line-clamp-3 mb-6">
                    {world.description_ar || world.description_en || 'لا يوجد وصف متاح.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-6 text-xs text-slate-400 font-bold bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 w-fit">
                    <Book size={14} className="text-amber-400" />
                    <span>{connectedBooks.length} كتب متصلة بهذا العالم</span>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <Button
                      onClick={() => handleOpenModal(world)}
                      variant="outline"
                      className="flex-1 rounded-xl gap-2 font-bold text-xs border-white/10 hover:bg-amber-500 hover:text-slate-950 transition-all h-10"
                    >
                      <Edit2 size={12} /> تعديل
                    </Button>
                    <Button
                      onClick={() => handleDelete(world.id)}
                      variant="outline"
                      className="rounded-xl border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all h-10 w-10 px-0"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-arabic" dir="rtl">
            <motion.div
              layoutId="modal"
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/60 shadow-2xl rounded-2xl overflow-hidden text-slate-100"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">
                    {editingWorld ? 'تعديل بيانات العالم الأدبي' : 'إضافة عالم أدبي جديد'}
                  </h3>
                  <p className="text-slate-400 font-medium text-xs">تعريف العالم ورابط الكتب التابعة له</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center font-bold text-lg">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {formData.banner_url && (
                  <div className="w-full h-40 rounded-xl overflow-hidden relative group border border-slate-800">
                    <img src={formData.banner_url} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-xs tracking-wider">معاينة صورة البانر</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-amber-400 block text-right">عنوان العالم (بالعربية)</label>
                    <input 
                      required
                      value={formData.name_ar}
                      onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 font-arabic text-right focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                      placeholder="مثال: وقائع الأندلس"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-amber-400 block text-left">عنوان العالم (بالإنجليزية)</label>
                    <input 
                      required
                      value={formData.name_en}
                      onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                      dir="ltr"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                      placeholder="e.g. Chronicles of Al-Andalus"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold tracking-wider text-amber-400 block flex items-center justify-between">
                       <span className="flex items-center gap-2"><ImageIcon size={12} /> صورة البانر الخفية</span>
                       {isUploading && <Loader2 size={12} className="animate-spin text-amber-400" />}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        value={formData.banner_url}
                        onChange={(e) => setFormData({...formData, banner_url: e.target.value})}
                        dir="ltr"
                        className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                        placeholder="https://..."
                      />
                      <input 
                        type="file" 
                        id="world-banner" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <Button 
                        type="button" 
                        disabled={isUploading}
                        onClick={() => document.getElementById('world-banner')?.click()}
                        className="h-auto px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-amber-400 block flex items-center gap-2">
                      <Palette size={12} /> اللون المميز للعالم
                    </label>
                    <div className="flex gap-3 items-center">
                      <input 
                        type="color"
                        value={formData.color_primary}
                        onChange={(e) => setFormData({...formData, color_primary: e.target.value})}
                        className="w-11 h-11 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-1"
                      />
                      <input 
                        value={formData.color_primary}
                        onChange={(e) => setFormData({...formData, color_primary: e.target.value})}
                        dir="ltr"
                        className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold tracking-wider text-amber-400 block">الوصف (بالعربية)</label>
                  <textarea 
                    rows={3}
                    value={formData.description_ar}
                    onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                    dir="rtl"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white font-arabic focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold tracking-wider text-amber-400 block">الوصف (بالإنجليزية)</label>
                  <textarea 
                    rows={3}
                    value={formData.description_en}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                    dir="ltr"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm"
                  />
                </div>

                {/* Book Binding Section */}
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
                        <p className="font-bold text-slate-200 text-xs tracking-wider">ربط الكتب بهـذا العالم</p>
                        <p className="text-slate-400 text-xs">
                          {selectedBookIds.length} كتاب مرتبط حالياً
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
                                </div>
                                {selectedBookIds.includes(book.id) && <Check size={16} className="text-amber-400" />}
                              </label>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                  className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    formData.is_featured 
                    ? 'bg-amber-500/15 border-amber-500 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      formData.is_featured ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Star size={18} fill={formData.is_featured ? 'currentColor' : 'none'} />
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-200 text-xs tracking-wider">عالم أدبي مميز</p>
                      <p className="text-slate-400 text-xs">عرض هذا العالم في قسم العوالم البارزة بالصفحة الرئيسية</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    formData.is_featured ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-transparent'
                  }`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </button>

                <div className="flex gap-4 pt-6 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-sm">
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    disabled={upsertWorld.isPending || assignBooks.isPending}
                    className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all text-sm shadow-lg shadow-amber-500/30 disabled:opacity-50"
                  >
                    {upsertWorld.isPending || assignBooks.isPending ? 'جاري الحفظ...' : editingWorld ? 'حفظ التغييرات' : 'إضافة العالم'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
