import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, BookOpen, Users, ShoppingBag } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { useBooks, useAuthors, useAllOrders } from '@/services/supabase.hooks';
import { format } from 'date-fns';

type ExportType = 'books' | 'authors' | 'orders';

interface ExportCard {
  type: ExportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const exportCards: ExportCard[] = [
  { type: 'books', title: 'فهرس الكتب والأنواع', description: 'قائمة كاملة بجميع الكتب والأسعار والصيغ وحالة النشر والمؤلفين', icon: BookOpen, color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  { type: 'authors', title: 'دليل المؤلفين والكتّاب', description: 'سجل شامل ببيانات المؤلفين والجنسيات ورابط التواصل', icon: Users, color: 'bg-sky-500/20 text-sky-300 border border-sky-500/30' },
  { type: 'orders', title: 'تقرير الطلبات والمبيعات', description: 'سجل تفصيلي لجميع الطلبات المسجلة، أسماء العملاء، العناوين والمبالغ', icon: ShoppingBag, color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
];

function downloadExcel(data: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'البيانات');

  // Style the header row
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[cell]) {
      ws[cell].s = {
        fill: { fgColor: { rgb: 'C8A84B' } },
        font: { bold: true, color: { rgb: '000000' } },
      };
    }
  }

  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

export function AdminExports() {
  const { data: books } = useBooks({ status: undefined });
  const { data: authors } = useAuthors();
  const { data: orders } = useAllOrders();

  const handleExport = (type: ExportType) => {
    switch (type) {
      case 'books': {
        const rows = (books ?? []).map((b) => ({
          'الرقم المعرف': b.id,
          'العنوان بالعربية': b.title_ar,
          'العنوان بالإنجليزية': b.title_en,
          'التصنيف': b.genre_ar || b.genre,
          'الصيغة': b.format === 'both' ? 'ورقي ورقمي' : b.format === 'physical' ? 'ورقي' : 'رقمي',
          'السعر (ج.م)': b.price,
          'السعر الأصلي': b.original_price || '',
          'عدد الصفحات': b.pages || '',
          'الحالة': b.status === 'published' ? 'منشور' : 'مسودة',
          'كتاب مميز': b.is_featured ? 'نعم' : 'لا',
          'إصدار جديد': b.is_new ? 'نعم' : 'لا',
          'التقييم': b.rating,
          'تاريخ النشر': b.published_date || '',
        }));
        downloadExcel(rows, 'فهرس_الكتب_أفق');
        break;
      }
      case 'authors': {
        const rows = (authors ?? []).map((a) => ({
          'الرقم المعرف': a.id,
          'الاسم بالعربية': a.name_ar,
          'الاسم بالإنجليزية': a.name_en,
          'الجنسية': a.nationality || '',
          'إنستغرام': a.instagram || '',
          'تويتر': a.twitter || '',
          'الموقع': a.website || '',
          'تاريخ التسجيل': format(new Date(a.created_at), 'yyyy-MM-dd'),
        }));
        downloadExcel(rows, 'سجل_المؤلفين_أفق');
        break;
      }
      case 'orders': {
        const rows = (orders ?? []).map((o) => {
          const typedOrder = o as Record<string, unknown> & { 
            profiles?: { email: string; full_name?: string; phone?: string };
            order_items?: { books?: { title_en: string; title_ar: string }; quantity: number }[];
            transaction_id?: string;
            shipping_address?: string;
            notes?: string;
          };
          
          const bookTitles = typedOrder.order_items?.map(item => 
            `${item.books?.title_ar || item.books?.title_en || 'كتاب'} (الكمية: ${item.quantity})`
          ).join(' | ') || 'لا يوجد تفاصيل';

          return {
            'رقم الطلب': o.id,
            'التاريخ والوقت': format(new Date(o.created_at), 'yyyy-MM-dd HH:mm'),
            'اسم العميل': typedOrder.profiles?.full_name || 'غير معروف',
            'البريد الإلكتروني': typedOrder.profiles?.email || '',
            'رقم الهاتف': typedOrder.profiles?.phone || '',
            'الكتب المشتراة': bookTitles,
            'المبلغ الإجمالي (ج.م)': o.total_amount,
            'حالة الطلب': o.status === 'published' ? 'تم الدفع' : o.status === 'delivered' ? 'تم التسليم' : o.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار',
            'طريقة الدفع': o.payment_method || '',
            'رقم التحويل (Transaction ID)': typedOrder.transaction_id || '',
            'عنوان الشحن والتوصيل': typedOrder.shipping_address || '',
            'ملاحظات العميل': typedOrder.notes || '',
            'عدد المواد': typedOrder.order_items?.length || 0,
          };
        });
        downloadExcel(rows, 'تقرير_الطلبات_تفصيلي_أفق');
        break;
      }
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="تصدير التقارير والبيانات"
        subtitle="تصدير بيانات المنصة والكتب والطلبات في ملفات إكسيل (Spreadsheets) مباشرة"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-arabic" dir="rtl">
        {exportCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.type}
              className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl border rounded-3xl p-8 hover:border-amber-500/30 transition-all group cursor-pointer flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => handleExport(card.type)}
            >
              <div>
                <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-slate-400 font-medium text-xs leading-relaxed mb-8">{card.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs group-hover:bg-amber-400 transition-all">
                  <Download size={14} />
                  <span>تصدير ملف Excel</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                  <FileSpreadsheet size={16} />
                  <span>.xlsx</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 bg-slate-900/80 border border-white/10 rounded-3xl p-8 font-arabic text-right" dir="rtl">
        <h3 className="text-lg font-bold text-amber-400 mb-3">📊 معلومات وإرشادات استخدام التقارير</h3>
        <ul className="space-y-2.5 text-slate-300 text-sm">
          <li>• يتم بناء وتنزيل الملفات فوراً باستخدام أحدث البيانات المسجلة بقاعدة البيانات.</li>
          <li>• الملفات المصدرة متوافقة تماماً مع برامج Microsoft Excel و Google Sheets و LibreOffice.</li>
          <li>• تضمن التقارير كافة التفاصيل كأرقام هاتف العملاء، عناوين التوصيل، وأرقام العمليات البنكية.</li>
          <li>• جميع المبالغ المالية موضحة بالجنيه المصري (EGP).</li>
        </ul>
      </div>
    </AdminLayout>
  );
}
