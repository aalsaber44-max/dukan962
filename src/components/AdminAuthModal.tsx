import React, { useMemo, useState } from 'react';
import { DollarSign, ShoppingBag, Bell, CheckCircle2, XCircle, TrendingUp, CalendarDays, Receipt, Trophy, TrendingDown, MapPin } from 'lucide-react';
import { Order, Product } from '../types/furniture';
import { computeOrderStats } from '../utils/orderStats';

interface AdminStatsProps {
  orders: Order[];
  products: Product[];
  loading?: boolean;
}

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_ORDER: { key: string; color: string }[] = [
  { key: 'جديد', color: '#E11D48' },
  { key: 'جاري التجهيز', color: '#D97706' },
  { key: 'جاري التوصيل', color: '#2563EB' },
  { key: 'تم التسليم', color: '#7FD1A0' },
  { key: 'ملغي', color: '#8A8173' },
];

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[#141210] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-soft ${className}`}>{children}</div>
);

const Kpi: React.FC<{ icon: React.ReactNode; tint: string; label: string; value: string; sub?: string }> = ({ icon, tint, label, value, sub }) => (
  <Card className="flex items-center gap-3.5">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1 ${tint}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-[#A39A8B] font-semibold">{label}</p>
      <p className="text-lg sm:text-xl font-black text-[#F3EEE4] font-mono truncate">{value}</p>
      {sub && <p className="text-[10px] text-[#8A8173] mt-0.5">{sub}</p>}
    </div>
  </Card>
);

export const AdminStats: React.FC<AdminStatsProps> = ({ orders, products, loading }) => {
  const [range, setRange] = useState<'daily' | 'monthly'>('daily');
  const stats = useMemo(() => computeOrderStats(orders, products), [orders, products]);

  if (loading) {
    return <p className="text-xs text-[#A39A8B] py-10 text-center">جاري تحميل الإحصائيات...</p>;
  }

  const series = range === 'daily' ? stats.daily : stats.monthly;
  const max = Math.max(1, ...series.map((p) => p.total));
  const seriesTotal = series.reduce((s, p) => s + p.total, 0);
  const inProgress = (stats.statusCounts['جاري التجهيز'] || 0) + (stats.statusCounts['جاري التوصيل'] || 0);
  const totalOrders = orders.length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#F3EEE4]">نظرة عامة على المتجر</h3>
        <p className="text-xs text-[#A39A8B]">
          المبيعات تشمل رسوم التوصيل وتستثني الطلبات الملغاة.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi
          icon={<DollarSign className="w-5 h-5" />}
          tint="bg-[#D4B06A]/10 text-[#E8CC8A] ring-[#D4B06A]/30"
          label="إجمالي المبيعات (د.أ)"
          value={money(stats.salesTotal)}
          sub={`${stats.validCount} طلب غير ملغي`}
        />
        <Kpi
          icon={<CalendarDays className="w-5 h-5" />}
          tint="bg-[#7FD1A0]/10 text-[#7FD1A0] ring-[#7FD1A0]/30"
          label="مبيعات اليوم (د.أ)"
          value={money(stats.todayTotal)}
          sub={`${stats.todayCount} طلب اليوم`}
        />
        <Kpi
          icon={<TrendingUp className="w-5 h-5" />}
          tint="bg-blue-500/10 text-blue-400 ring-blue-500/30"
          label="مبيعات هذا الشهر (د.أ)"
          value={money(stats.monthTotal)}
          sub={`${stats.monthCount} طلب هذا الشهر`}
        />
        <Kpi
          icon={<Receipt className="w-5 h-5" />}
          tint="bg-white/[0.04] text-[#B9B0A0] ring-white/10"
          label="متوسط قيمة الطلب (د.أ)"
          value={money(stats.avgOrder)}
        />
        <Kpi
          icon={<Bell className="w-5 h-5" />}
          tint="bg-rose-500/10 text-rose-400 ring-rose-500/30"
          label="طلبات جديدة"
          value={String(stats.statusCounts['جديد'] || 0)}
          sub="بانتظار المعالجة"
        />
        <Kpi
          icon={<ShoppingBag className="w-5 h-5" />}
          tint="bg-amber-500/10 text-amber-400 ring-amber-500/30"
          label="قيد التنفيذ"
          value={String(inProgress)}
          sub="تجهيز أو توصيل"
        />
        <Kpi
          icon={<CheckCircle2 className="w-5 h-5" />}
          tint="bg-[#7FD1A0]/10 text-[#7FD1A0] ring-[#7FD1A0]/30"
          label="مكتملة"
          value={String(stats.statusCounts['تم التسليم'] || 0)}
          sub={`${money(stats.deliveredTotal)} د.أ`}
        />
        <Kpi
          icon={<XCircle className="w-5 h-5" />}
          tint="bg-white/[0.04] text-[#8A8173] ring-white/10"
          label="ملغاة"
          value={String(stats.cancelledCount)}
        />
      </div>

      {/* Sales Chart */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-[#F3EEE4]">
              المبيعات {range === 'daily' ? 'اليومية (آخر 30 يوماً)' : 'الشهرية (آخر 12 شهراً)'}
            </h4>
            <p className="text-[11px] text-[#A39A8B]">
              المجموع في الفترة: <strong className="font-mono text-[#E8CC8A]">{money(seriesTotal)} د.أ</strong>
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] ring-1 ring-white/10 rounded-xl">
            {(['daily', 'monthly'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  range === r
                    ? 'bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] shadow-gold'
                    : 'text-[#A39A8B] hover:text-[#F3EEE4]'
                }`}
              >
                {r === 'daily' ? 'يومي' : 'شهري'}
              </button>
            ))}
          </div>
        </div>

        {seriesTotal === 0 ? (
          <p className="text-xs text-[#8A8173] text-center py-12">لا توجد مبيعات في هذه الفترة بعد.</p>
        ) : (
          <div role="img" aria-label={`رسم بياني للمبيعات ${range === 'daily' ? 'اليومية' : 'الشهرية'}`}>
            <div className="flex items-end gap-[3px] h-44 border-b border-white/10">
              {series.map((p) => (
                <div key={p.key} className="group relative flex-1 min-w-0 h-full flex items-end">
                  <div
                    className={`w-full rounded-t-md transition-colors ${
                      p.total > 0
                        ? 'bg-gradient-to-t from-[#8A6D2F] to-[#D4B06A] group-hover:from-[#E8CC8A] group-hover:to-[#E8CC8A]'
                        : 'bg-white/5'
                    }`}
                    style={{ height: p.total > 0 ? `${Math.max(4, (p.total / max) * 100)}%` : '2px' }}
                  />
                  <div className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-[#0B0A09] border border-[#D4B06A]/40 px-2.5 py-1.5 text-[10px] text-[#F3EEE4] shadow-lg">
                    <span className="font-mono text-[#E8CC8A]">{p.label}</span>: <strong className="font-mono">{money(p.total)} د.أ</strong> ({p.count} طلب)
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-[3px] mt-1.5">
              {series.map((p, i) => (
                <span key={p.key} className="flex-1 min-w-0 text-center text-[9px] text-[#8A8173] font-mono overflow-visible whitespace-nowrap">
                  {range === 'monthly' || i % 5 === 0 || i === series.length - 1 ? p.label : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Status + Governorates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h4 className="text-sm font-bold text-[#F3EEE4] mb-3">توزيع حالات الطلبات</h4>
          {totalOrders === 0 ? (
            <p className="text-xs text-[#8A8173] py-6 text-center">لا توجد طلبات بعد.</p>
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.06] mb-4 ring-1 ring-white/10">
                {STATUS_ORDER.map(({ key, color }) => {
                  const c = stats.statusCounts[key] || 0;
                  return c > 0 ? (
                    <div
                      key={key}
                      style={{ width: `${(c / totalOrders) * 100}%`, backgroundColor: color }}
                      title={`${key}: ${c}`}
                    />
                  ) : null;
                })}
              </div>
              <ul className="space-y-2">
                {STATUS_ORDER.map(({ key, color }) => {
                  const c = stats.statusCounts[key] || 0;
                  return (
                    <li key={key} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-[#B9B0A0]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {key}
                      </span>
                      <span className="font-mono text-[#F3EEE4]">
                        <strong>{c}</strong>{' '}
                        <span className="text-[#8A8173]">({Math.round((c / totalOrders) * 100)}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>

        <Card>
          <h4 className="text-sm font-bold text-[#F3EEE4] mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4B06A]" />
            أكثر المحافظات طلباً
          </h4>
          {stats.governorates.length === 0 ? (
            <p className="text-xs text-[#8A8173] py-6 text-center">لا توجد بيانات بعد.</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.governorates.map((g) => (
                <li key={g.name} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#B9B0A0]">{g.name}</span>
                    <strong className="font-mono text-[#F3EEE4]">{g.count}</strong>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-[#8A6D2F] to-[#D4B06A] rounded-full"
                      style={{ width: `${(g.count / stats.governorates[0].count) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Top + Bottom Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h4 className="text-sm font-bold text-[#F3EEE4] mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4B06A]" />
            الأكثر مبيعاً
          </h4>
          {stats.topProducts.length === 0 ? (
            <p className="text-xs text-[#8A8173] py-6 text-center">لم تُسجَّل مبيعات بعد.</p>
          ) : (
            <ol className="space-y-2.5">
              {stats.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#D4B06A]/15 text-[#E8CC8A] font-mono font-bold grid place-items-center shrink-0 ring-1 ring-[#D4B06A]/30">
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-[#F3EEE4] font-semibold">{p.name}</span>
                  <span className="text-[#A39A8B] font-mono shrink-0">{p.units} قطعة</span>
                  <span className="text-[#7FD1A0] font-mono font-bold shrink-0 w-24 text-left">
                    {money(p.revenue)} د.أ
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <h4 className="text-sm font-bold text-[#F3EEE4] mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#D4B06A]" />
            الأقل مبيعاً
          </h4>
          {stats.bottomProducts.length === 0 ? (
            <p className="text-xs text-[#8A8173] py-6 text-center">
              تظهر هنا عندما يزيد عدد منتجاتك الفعّالة عن 5.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {stats.bottomProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-xs">
                  <span className="flex-1 min-w-0 truncate text-[#F3EEE4] font-semibold">{p.name}</span>
                  {p.units === 0 ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full shrink-0 ring-1 ring-rose-500/30">
                      لم يُبع بعد
                    </span>
                  ) : (
                    <span className="text-[#A39A8B] font-mono shrink-0">{p.units} قطعة</span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <p className="text-[11px] text-[#8A8173] leading-relaxed">
        ملاحظة: الأرباح الصافية غير متاحة لأن المنتجات لا تحمل سعر تكلفة. المعروض هو المبيعات (الإيراد) فقط.
      </p>
    </div>
  );
};
