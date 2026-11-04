import React from 'react';
import { Product } from '../types/furniture';
import { getStockState } from '../utils/inventory';

/** شارة حالة المخزون في لوحة التحكم */
export const StockBadge: React.FC<{ product: Pick<Product, 'stock' | 'lowStockThreshold'> }> = ({ product }) => {
  const state = getStockState(product);
  if (state === 'untracked') return <span className="text-[11px] text-[#8A8173]">غير مُتتبَّع</span>;

  const styles = {
    out: 'bg-rose-500/10 text-rose-400 ring-rose-400/30',
    low: 'bg-amber-500/10 text-amber-300 ring-amber-400/30',
    in: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/30',
  }[state];

  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-bold ring-1 ${styles}`}>
      <span className="font-mono">{state === 'out' ? 'نفد' : product.stock}</span>
      {state === 'low' && <span className="font-semibold">منخفض</span>}
    </span>
  );
};
