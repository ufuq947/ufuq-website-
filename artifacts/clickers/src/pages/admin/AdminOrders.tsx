import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, Package, Eye, ShoppingBag, Users, PenTool, BookOpen, CreditCard, Copy } from 'lucide-react';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { useAllOrders, useUpdateOrderStatus } from '@/services/supabase.hooks';

const STATUSES = ['pending', 'paid', 'delivered', 'cancelled'] as const;
type OrderStatus = typeof STATUSES[number];

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:   { label: 'قيد الانتظار', icon: Clock,        color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  paid:      { label: 'تم الدفع',     icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  delivered: { label: 'تم التسليم',  icon: Package,      color: 'text-sky-400',  bg: 'bg-sky-500/15 border-sky-500/30' },
  cancelled: { label: 'ملغي',        icon: XCircle,      color: 'text-rose-400',   bg: 'bg-rose-500/15 border-rose-500/30' },
};

const PM_LABEL: Record<string, string> = {
  bank_transfer: 'تحويل بنكي',
  instapay: 'إنستاباي (InstaPay)',
  vodafone_cash: 'فودافون كاش',
  stripe: 'دفع إلكتروني (بطاقة بنكية)',
};

export function AdminOrders() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = (orders ?? []).filter(
    (o) => filterStatus === 'all' || o.status === filterStatus
  );

  const totalRevenue = (orders ?? [])
    .filter((o) => ['paid', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <AdminLayout>
      <AdminPageHeader
        title="إدارة الطلبات والمبيعات"
        subtitle={`إجمالي الطلبات: ${orders?.length ?? 0} · الإيرادات: ${totalRevenue.toLocaleString()} ج.م`}
      />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 font-arabic">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${filterStatus === 'all' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900/80 backdrop-blur-xl border border-white/10 text-slate-400 hover:text-white'}`}
        >
          الكل ({orders?.length ?? 0})
        </button>
        {STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = (orders ?? []).filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${filterStatus === s ? `${cfg.bg} ${cfg.color}` : 'bg-slate-900/80 backdrop-blur-xl border-white/10 text-slate-400 hover:text-white'}`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl border overflow-hidden font-arabic">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['رقم الطلب', 'العميل', 'عدد المواد', 'المجموع', 'الحالة', 'التاريخ', 'الإجراءات'].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-black tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : filtered.map((order) => {
                  const cfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  const customer = (order as Record<string, unknown> & { profiles?: { email?: string; full_name?: string; phone?: string | null } }).profiles;
                  const items = (order as Record<string, unknown> & { order_items?: unknown[] }).order_items ?? [];
                  const isExpanded = expanded === order.id;
                  const txId = (order as any).transaction_id as string | null;
                  const pm = (order as any).payment_method as string;

                  return (
                    <>
                      <motion.tr
                        key={order.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => setExpanded(isExpanded ? null : order.id as string)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-amber-400 text-sm font-bold">
                            #{(order.id as string).slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm">{customer?.full_name || '—'}</p>
                          <p className="text-slate-400 text-xs dir-ltr text-right">{customer?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-bold">{(items as unknown[]).length} عناصر</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-white">{Number(order.total_amount).toFixed(2)}</span>
                          <span className="text-slate-400 text-xs mr-1">ج.م</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon size={12} />
                            {cfg.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400 font-bold text-xs">
                            {format(new Date(order.created_at), 'dd/MM/yy HH:mm')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : order.id as string); }}
                              className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-all"
                              title="عرض التفاصيل"
                            >
                              <Eye size={13} />
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateStatus.mutate({ id: order.id as string, status: e.target.value });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-bold text-white border border-white/10 rounded-xl px-2 py-1.5 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                            >
                              {STATUSES.map((s) => <option key={s} value={s} className="bg-slate-900 text-white">{STATUS_CONFIG[s].label}</option>)}
                            </select>
                          </div>
                        </td>
                      </motion.tr>

                      {/* ── Expanded Detail Row ── */}
                      {isExpanded && (
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <td colSpan={7} className="px-6 py-8">

                            {/* ── PAYMENT BANNER ── */}
                            <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60">
                              <div className="flex items-center justify-between px-6 py-4 bg-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                                    <CreditCard size={16} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold tracking-wider text-slate-400">طريقة الدفع</p>
                                    <p className="font-bold text-white text-base">{PM_LABEL[pm] ?? pm}</p>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold tracking-wider text-slate-400">إجمالي الطلب</p>
                                  <p className="font-black text-amber-400 text-xl">{(order.total_amount as number).toFixed(2)} <span className="text-sm text-slate-400 font-normal">ج.م</span></p>
                                </div>
                              </div>

                              {/* Transaction ID row */}
                              {['bank_transfer', 'instapay', 'vodafone_cash'].includes(pm) && (
                                <div className={`flex items-center justify-between px-6 py-4 border-t border-white/5 ${txId ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                                  <div>
                                    <p className={`text-xs font-bold tracking-wider mb-1 ${txId ? 'text-emerald-400' : 'text-amber-400'}`}>
                                      {txId ? '✓ رقم عملية التحويل — مُدخل من قبل العميل' : '⚠ لم يتم إدخال رقم عملية التحويل بعد'}
                                    </p>
                                    <p className={`font-mono font-bold text-sm ${txId ? 'text-white' : 'text-amber-400'}`}>
                                      {txId || 'لم يقم العميل بإدخال مرجع عملية الدفع'}
                                    </p>
                                  </div>
                                  {txId && (
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(txId); }}
                                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                                    >
                                      <Copy size={11} /> نسخ الرقم
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* ── LEFT + RIGHT COLUMNS ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                              {/* Customer & Shipping */}
                              <div className="lg:col-span-5 space-y-6">
                                <div>
                                  <h4 className="text-xs font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                    <Users size={14} className="text-amber-400" /> بيانات المستلم
                                  </h4>
                                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                                    <p className="text-white font-bold text-lg mb-1">{customer?.full_name || '—'}</p>
                                    <p className="text-slate-400 text-xs mb-4 font-mono">{customer?.email}</p>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                          <Users size={14} />
                                        </div>
                                        <p className="text-white font-bold text-sm dir-ltr">{customer?.phone || 'لا يوجد رقم هاتف'}</p>
                                      </div>
                                      {customer?.phone && (
                                        <button
                                          onClick={() => { navigator.clipboard.writeText(customer.phone as string); }}
                                          className="text-xs font-bold text-amber-400 hover:underline"
                                        >
                                          نسخ
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-xs font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                    <Package size={14} className="text-amber-400" /> عنوان التوصيل والشحن
                                  </h4>
                                  <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5">
                                    <p className="text-slate-200 font-bold text-sm whitespace-pre-wrap leading-relaxed mb-4">
                                      {(order as any).shipping_address || 'لم يتم تحديد عنوان'}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                      <span className="text-xs font-bold text-slate-500">تفاصيل العنوان</span>
                                      <button
                                        onClick={() => { navigator.clipboard.writeText((order as any).shipping_address || ''); }}
                                        className="text-xs font-bold text-amber-400 hover:underline"
                                      >
                                        نسخ العنوان
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Order Manifest */}
                              <div className="lg:col-span-7">
                                <h4 className="text-xs font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                  <ShoppingBag size={14} className="text-amber-400" /> تفاصيل الكتب والمحتويات
                                </h4>
                                <div className="space-y-3">
                                  {(items as any[]).map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-slate-950/80 border border-white/10 rounded-2xl p-3.5">
                                      <div className="w-14 h-20 overflow-hidden rounded-xl shadow-md bg-white/5 flex-shrink-0">
                                        {item.books?.cover_url ? (
                                          <img src={item.books.cover_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-slate-600"><BookOpen size={18} /></div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <p className="text-white font-bold text-sm mb-1">{item.books?.title_ar || item.books?.title_en}</p>
                                            <p className="text-slate-400 text-xs font-mono">{item.books?.title_en}</p>
                                          </div>
                                          <div className="text-left">
                                            <p className="text-amber-400 font-bold text-sm">{(item.quantity * item.unit_price).toFixed(2)} <span className="text-xs opacity-60">ج.م</span></p>
                                            <p className="text-slate-400 text-xs font-bold">الكمية: {item.quantity}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {order.notes && (
                                    <div className="mt-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                      <div className="flex items-center gap-2 mb-1">
                                        <PenTool size={14} className="text-amber-400" />
                                        <h5 className="text-xs font-bold text-amber-400">ملاحظات من العميل</h5>
                                      </div>
                                      <p className="text-slate-200 text-xs italic">"{order.notes}"</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-bold">لا توجد طلبات مسجلة</div>
        )}
      </div>
    </AdminLayout>
  );
}
