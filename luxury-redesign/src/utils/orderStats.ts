import { Order, Product } from '../types/furniture';

export interface SeriesPoint {
  key: string;
  label: string;
  total: number;
  count: number;
}

export interface ProductStat {
  id: string;
  name: string;
  units: number;
  revenue: number;
}

export interface OrderStats {
  validCount: number;
  salesTotal: number;        // مبيعات الطلبات غير الملغاة (شامل التوصيل)
  deliveredTotal: number;    // مبيعات الطلبات المُسلّمة فقط
  avgOrder: number;
  todayTotal: number;
  todayCount: number;
  monthTotal: number;
  monthCount: number;
  statusCounts: Record<string, number>;
  cancelledCount: number;
  daily: SeriesPoint[];      // آخر 30 يوماً
  monthly: SeriesPoint[];    // آخر 12 شهراً
  topProducts: ProductStat[];
  bottomProducts: ProductStat[];
  governorates: { name: string; count: number }[];
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/** يحسب كل أرقام لوحة الإحصائيات. الطلبات الملغاة تُستثنى من المبيعات. */
export const computeOrderStats = (orders: Order[], products: Product[], now: Date = new Date()): OrderStats => {
  const valid = orders.filter((o) => o.status !== 'ملغي');
  const total = (o: Order) => Number(o.total) || 0;
  const sum = (arr: Order[]) => arr.reduce((s, o) => s + total(o), 0);

  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const k = o.status || 'جديد';
    statusCounts[k] = (statusCounts[k] || 0) + 1;
  });

  // السلاسل الزمنية
  const daily: SeriesPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    daily.push({ key: dayKey(d), label: `${d.getDate()}/${d.getMonth() + 1}`, total: 0, count: 0 });
  }
  const monthly: SeriesPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthly.push({ key: monthKey(d), label: `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`, total: 0, count: 0 });
  }
  const dailyMap = new Map(daily.map((p) => [p.key, p]));
  const monthlyMap = new Map(monthly.map((p) => [p.key, p]));

  valid.forEach((o) => {
    const d = parseDate(o.createdAt);
    if (!d) return;
    const dp = dailyMap.get(dayKey(d));
    if (dp) { dp.total += total(o); dp.count += 1; }
    const mp = monthlyMap.get(monthKey(d));
    if (mp) { mp.total += total(o); mp.count += 1; }
  });

  const todayP = dailyMap.get(dayKey(now));
  const monthP = monthlyMap.get(monthKey(now));

  // المنتجات
  const statMap = new Map<string, ProductStat>();
  valid.forEach((o) => {
    (o.items || []).forEach((it) => {
      const id = it.product?.id || it.product?.name || 'unknown';
      const price = Number(it.selectedColor?.price) || Number(it.product?.basePrice) || 0;
      const qty = Number(it.quantity) || 1;
      const cur = statMap.get(id) || { id, name: it.product?.name || 'منتج محذوف', units: 0, revenue: 0 };
      cur.units += qty;
      cur.revenue += price * qty;
      statMap.set(id, cur);
    });
  });

  const topProducts = [...statMap.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, 5);

  const activeProducts = products.filter((p) => p.isActive !== false);
  const bottomProducts = activeProducts
    .map((p) => statMap.get(p.id) || { id: p.id, name: p.name, units: 0, revenue: 0 })
    .sort((a, b) => a.units - b.units || a.name.localeCompare(b.name))
    .slice(0, 5);

  // المحافظات
  const govMap = new Map<string, number>();
  valid.forEach((o) => {
    const g = (o.governorate || 'غير محدد').trim();
    govMap.set(g, (govMap.get(g) || 0) + 1);
  });
  const governorates = [...govMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const salesTotal = sum(valid);
  return {
    validCount: valid.length,
    salesTotal,
    deliveredTotal: sum(orders.filter((o) => o.status === 'تم التسليم')),
    avgOrder: valid.length ? salesTotal / valid.length : 0,
    todayTotal: todayP?.total || 0,
    todayCount: todayP?.count || 0,
    monthTotal: monthP?.total || 0,
    monthCount: monthP?.count || 0,
    statusCounts,
    cancelledCount: statusCounts['ملغي'] || 0,
    daily,
    monthly,
    topProducts,
    bottomProducts: activeProducts.length > 5 ? bottomProducts : [],
    governorates,
  };
};
