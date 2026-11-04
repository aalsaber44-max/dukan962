import { CartItem, Order, Product } from '../types/furniture';

/** حد التنبيه الافتراضي عند انخفاض المخزون (يمكن تخصيصه لكل منتج بالحقل lowStockThreshold) */
export const DEFAULT_LOW_STOCK = 3;

export type StockState = 'untracked' | 'in' | 'low' | 'out';

/** المنتج "مُتتبَّع" فقط إذا كان له رقم مخزون. المنتجات القديمة بدون stock تبقى غير محدودة */
export const isTracked = (p: Pick<Product, 'stock'>): boolean => typeof p.stock === 'number';

export const getStockState = (p: Pick<Product, 'stock' | 'lowStockThreshold'>): StockState => {
  if (typeof p.stock !== 'number') return 'untracked';
  if (p.stock <= 0) return 'out';
  const threshold = typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : DEFAULT_LOW_STOCK;
  return p.stock <= threshold ? 'low' : 'in';
};

/** الكمية المتاحة للشراء (Infinity لغير المتتبَّع) */
export const availableQty = (p: Pick<Product, 'stock'>): number =>
  typeof p.stock === 'number' ? Math.max(0, p.stock) : Infinity;

/** مجموع كمية المنتج في السلة عبر كل ألوانه (المخزون للمنتج وليس للون) */
export const qtyInCart = (cart: CartItem[], productId: string): number =>
  cart.filter((i) => i.product.id === productId).reduce((s, i) => s + i.quantity, 0);

/** يجمع كميات بنود الطلب لكل منتج */
export const aggregateItems = (items: { product?: { id?: string }; quantity?: number }[] = []): Map<string, number> => {
  const m = new Map<string, number>();
  items.forEach((it) => {
    const id = it.product?.id;
    if (!id) return;
    m.set(id, (m.get(id) || 0) + (Number(it.quantity) || 1));
  });
  return m;
};

/**
 * يطابق السلة مع المخزون الحالي: يخفّض الكميات الزائدة ويحذف المنتجات النافدة.
 * يعيد سلة جديدة + قائمة رسائل بما تغيّر.
 */
export const reconcileCart = (cart: CartItem[], products: Product[]): { cart: CartItem[]; messages: string[] } => {
  const messages: string[] = [];
  const remaining = new Map<string, number>();
  const out: CartItem[] = [];

  cart.forEach((item) => {
    const live = products.find((p) => p.id === item.product.id);
    if (!live) { out.push(item); return; } // منتج غير موجود بالقائمة (لا نلمسه)
    const avail = remaining.has(live.id) ? remaining.get(live.id)! : availableQty(live);
    if (avail === Infinity) { out.push(item); return; }
    if (avail <= 0) { messages.push(`"${live.name}" نفدت الكمية وتمت إزالته من السلة`); return; }
    const q = Math.min(item.quantity, avail);
    if (q < item.quantity) messages.push(`"${live.name}": المتاح ${avail} فقط، تم تعديل الكمية`);
    remaining.set(live.id, avail - q);
    out.push({ ...item, quantity: q });
  });

  return { cart: out, messages };
};

/** الحالات التي يكون فيها مخزون الطلب مخصوماً */
export const DEDUCT_STATES = ['جاري التجهيز', 'جاري التوصيل', 'تم التسليم'];

export interface StockPlan {
  action: 'none' | 'deduct' | 'restore';
  deductions: Record<string, number>; // ما سيُخصم فعلياً لكل منتج
  restores: Record<string, number>;   // ما سيُعاد لكل منتج
  shortage: string[];                 // رسائل النقص (المتاح أقل من المطلوب)
}

/**
 * يقرر ماذا يحدث للمخزون عند تغيير حالة طلب:
 *  - من (جديد/ملغي) إلى (تجهيز/توصيل/تسليم) ولم يُخصم من قبل => خصم المتاح فقط
 *  - من (تجهيز/توصيل/تسليم) إلى (جديد/ملغي) وكان مخصوماً => إعادة ما خُصم فعلياً
 *  - غير ذلك (مثلاً تجهيز → توصيل، أو طلب قديم قبل ميزة المخزون) => لا شيء
 */
export const planOrderStockChange = (
  order: Pick<Order, 'status' | 'items' | 'stockDeducted' | 'stockDeductions'>,
  newStatus: string,
  products: Product[]
): StockPlan => {
  const plan: StockPlan = { action: 'none', deductions: {}, restores: {}, shortage: [] };
  const was = DEDUCT_STATES.includes(order.status);
  const will = DEDUCT_STATES.includes(newStatus);

  if (!was && will && !order.stockDeducted) {
    plan.action = 'deduct';
    aggregateItems(order.items).forEach((qty, pid) => {
      const p = products.find((x) => x.id === pid);
      if (!p || !isTracked(p)) return;
      const take = Math.min(qty, Math.max(0, p.stock as number));
      if (take > 0) plan.deductions[pid] = take;
      if (take < qty) plan.shortage.push(`${p.name} (المطلوب ${qty}، المتاح ${p.stock})`);
    });
  } else if (was && !will && order.stockDeducted) {
    plan.action = 'restore';
    Object.entries(order.stockDeductions || {}).forEach(([pid, qty]) => {
      if (products.some((x) => x.id === pid) && qty > 0) plan.restores[pid] = qty;
    });
  }
  return plan;
};
