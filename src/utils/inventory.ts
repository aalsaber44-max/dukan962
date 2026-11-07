import { CartItem, Order, Product } from '../types/furniture';

/** حد التنبيه الافتراضي عند انخفاض المخزون (يمكن تخصيصه لكل منتج بالحقل lowStockThreshold) */
export const DEFAULT_LOW_STOCK = 3;

export type StockState = 'untracked' | 'in' | 'low' | 'out';

/** المنتج "مُتتبَّع" فقط إذا كان له رقم مخزون. المنتجات القديمة بدون stock تبقى غير محدودة */
export const isTracked = (p: Pick<Product, 'stock'>): boolean => typeof p.stock === 'number';

export const getStockState = (p: Pick<Product, 'stock' | 'lowStockThreshold'>): StockState => {
  if (typeof p.stock !== 'number') return 'untracked';
  if (!Number.isFinite(p.stock) || p.stock <= 0) return 'out';
  const threshold = typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : DEFAULT_LOW_STOCK;
  return p.stock <= threshold ? 'low' : 'in';
};

/** الكمية المتاحة للشراء (Infinity لغير المتتبَّع) */
export const availableQty = (p: Pick<Product, 'stock'>): number =>
  typeof p.stock === 'number' ? (Number.isFinite(p.stock) ? Math.max(0, p.stock) : 0) : Infinity;

/** مجموع كمية المنتج في السلة عبر كل ألوانه (المخزون للمنتج وليس للون) */
export const qtyInCart = (cart: CartItem[], productId: string): number =>
  cart.filter((i) => i.product.id === productId).reduce((sum, item) => {
    const quantity = Number(item.quantity);
    return sum + (Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0);
  }, 0);

/** يجمع كميات بنود الطلب لكل منتج */
export const aggregateItems = (items: { product?: { id?: string }; quantity?: number }[] = []): Map<string, number> => {
  const m = new Map<string, number>();
  items.forEach((it) => {
    const id = it.product?.id;
    if (!id) return;
    const quantity = Number(it.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    m.set(id, (m.get(id) || 0) + quantity);
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
    if (!live) {
      messages.push(`"${item.product.name}" لم يعد متوفراً وتمت إزالته من السلة`);
      return;
    }

    // حدّث بيانات المنتج والسعر من آخر نسخة وصلت من Firestore، لا من نسخة قديمة مخزنة في المتصفح.
    const matchingColor = live.colors?.find((color) => color.name === item.selectedColor?.name);
    const liveColor = matchingColor || live.colors?.[0] || {
      name: item.selectedColor?.name || 'افتراضي',
      hex: item.selectedColor?.hex || '#3E2723',
      price: Number(live.basePrice) || 0,
      image: live.images?.[0] || '',
    };
    const refreshedItem: CartItem = { ...item, product: live, selectedColor: liveColor };
    const requestedQuantity = Number(item.quantity);
    const safeQuantity = Number.isFinite(requestedQuantity) ? Math.floor(requestedQuantity) : 0;
    if (safeQuantity <= 0) {
      messages.push(`"${live.name}" تمت إزالة كميته غير الصالحة من السلة`);
      return;
    }
    const avail = remaining.has(live.id) ? remaining.get(live.id)! : availableQty(live);
    if (avail === Infinity) { out.push({ ...refreshedItem, quantity: safeQuantity }); return; }
    if (avail <= 0) { messages.push(`"${live.name}" نفدت الكمية وتمت إزالته من السلة`); return; }
    const q = Math.min(safeQuantity, avail);
    if (q < safeQuantity) messages.push(`"${live.name}": المتاح ${avail} فقط، تم تعديل الكمية`);
    remaining.set(live.id, avail - q);
    out.push({ ...refreshedItem, quantity: q });
  });

  return { cart: out, messages };
};

/**
 * يحدّث بيانات المنتجات داخل السلة (السعر، الصور، الاسم، اللون) من أحدث نسخة وصلت من
 * Firestore دون حذف أي بند ودون تغيير الكميات. يُستدعى تلقائياً عند تحدث بيانات المنتجات،
 * حتى يبقى ما يدفعه الزبون دائماً مطابقاً لآخر بيانات المتجر حتى لحظة إتمام الطلب.
 */
export const refreshCartData = (cart: CartItem[], products: Product[]): CartItem[] => {
  if (cart.length === 0 || products.length === 0) return cart;
  let changed = false;
  const next = cart.map((item) => {
    const live = products.find((p) => p.id === item.product.id);
    if (!live) return item;
    const matchingColor = live.colors?.find((color) => color.name === item.selectedColor?.name);
    const liveColor = matchingColor || item.selectedColor;
    const sameProduct = item.product === live;
    const sameColor = item.selectedColor === liveColor;
    if (sameProduct && sameColor) return item;
    changed = true;
    return { ...item, product: live, selectedColor: liveColor };
  });
  return changed ? next : cart;
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
      if (!p) {
        plan.shortage.push(`منتج محذوف أو غير موجود (المعرّف ${pid})`);
        return;
      }
      if (!isTracked(p)) return;
      const available = Math.max(0, Number(p.stock) || 0);
      if (available < qty) {
        plan.shortage.push(`${p.name} (المطلوب ${qty}، المتاح ${available})`);
        return;
      }
      if (qty > 0) plan.deductions[pid] = qty;
    });
    // لا تخصم جزءاً من الطلب: إما تتوفر كل الكميات أو يبقى الطلب دون تغيير.
    if (plan.shortage.length > 0) plan.deductions = {};
  } else if (was && !will && order.stockDeducted) {
    plan.action = 'restore';
    Object.entries(order.stockDeductions || {}).forEach(([pid, qty]) => {
      if (products.some((x) => x.id === pid) && qty > 0) plan.restores[pid] = qty;
    });
  }
  return plan;
};
