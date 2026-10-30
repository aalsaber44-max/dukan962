import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, MessageCircle, Ruler, Shield, Truck, Check, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { Product, ProductColor } from '../types/furniture';
import { STORE_PHONE_INTL } from '../utils/jordanLocations';

interface ProductDetailsPageProps {
  product: Product | null;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor: ProductColor, quantity: number) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || {
      name: 'اللون الافتراضي',
      hex: '#3E2723',
      price: product.basePrice,
      image: product.images[0] || '',
    }
  );

  const [activeImage, setActiveImage] = useState<string>(
    selectedColor.image || product.images[0] || ''
  );

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      const defaultColor = product.colors[0];
      setSelectedColor(defaultColor);
      setActiveImage(defaultColor.image);
    } else {
      setActiveImage(product.images[0] || '');
    }
  }, [product]);

  const handleSelectColor = (color: ProductColor) => {
    setSelectedColor(color);
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  const handleSwitchImage = (imgUrl: string) => {
    setActiveImage(imgUrl);
    const matchingColor = product.colors.find(
      (c) => c.image === imgUrl || c.additionalImages?.includes(imgUrl)
    );
    if (matchingColor) {
      setSelectedColor(matchingColor);
    }
  };

  const availableThumbnails = Array.from(
    new Set([
      ...product.colors.flatMap((c) => [c.image, ...(c.additionalImages || [])]),
      ...(product.images || []),
    ].filter(Boolean))
  );

  const currentPrice = Number(selectedColor.price || product.basePrice || 0);
  const currentOriginalPrice = Number(selectedColor.originalPrice || product.originalPrice || 0);

  const handleAdd = () => {
    onAddToCart(product, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 850);
  };

  const whatsAppUrl = `https://wa.me/${STORE_PHONE_INTL}?text=${encodeURIComponent(
    `مرحباً دكان 962 (Dukan 962)،\nأود الاستفسار وتأكيد طلب القطعة التالية:\n\n*القطعة:* ${product.name}\n*اللون المختار:* ${selectedColor.name}\n*السعر:* ${currentPrice.toFixed(2)} دينار أردني\n*الكمية:* ${quantity}\n*الأبعاد:* ${product.dimensions || '-'}\n\nيرجى تأكيد موعد التوصيل للمحافظة.`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#141210] rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500/10 text-rose-400 border border-rose-400/30'
                : 'bg-[#141210]/85 text-[#A39A8B] hover:text-rose-400'
            }`}
            aria-label="المفضلة"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#141210]/85 hover:bg-[#1E1A17] text-[#F3EEE4] shadow-sm transition-all cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-white/10">
          
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#1C1815] flex flex-col justify-between">
            <div>
              <div className="relative aspect-4/3 sm:aspect-1/1 w-full rounded-2xl overflow-hidden bg-[#141210] border border-white/10 shadow-none mb-4 group/carousel">
                <img
                  src={activeImage}
                  alt={`${product.name} - ${selectedColor.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain object-center p-4 transition-all duration-300"
                />

                {product.isOffer && (
                  <div className="absolute top-4 right-4 bg-[#2E5339] text-white text-xs font-bold px-3 py-1 rounded-md shadow-none flex items-center gap-1.5 z-10">
                    <Sparkles className="w-3.5 h-3.5 text-[#A7F3D0]" />
                    <span>عرض خاص - كمية محدودة</span>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md z-10 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span>اللون المعروض: {selectedColor.name}</span>
                </div>

                {availableThumbnails.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const currentIdx = availableThumbnails.indexOf(activeImage);
                        const prevIdx =
                          currentIdx <= 0 ? availableThumbnails.length - 1 : currentIdx - 1;
                        handleSwitchImage(availableThumbnails[prevIdx]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#141210]/85 hover:bg-[#1E1A17] text-[#F3EEE4] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                      aria-label="الصورة السابقة"
                      title="الصورة السابقة (يتغير السعر تلقائياً)"
                    >
                      <span className="text-base font-bold font-mono">›</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const currentIdx = availableThumbnails.indexOf(activeImage);
                        const nextIdx =
                          currentIdx >= availableThumbnails.length - 1 ? 0 : currentIdx + 1;
                        handleSwitchImage(availableThumbnails[nextIdx]);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#141210]/85 hover:bg-[#1E1A17] text-[#F3EEE4] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                      aria-label="الصورة التالية"
                      title="الصورة التالية (يتغير السعر تلقائياً)"
                    >
                      <span className="text-base font-bold font-mono">‹</span>
                    </button>

                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-mono z-10">
                      {Math.max(1, availableThumbnails.indexOf(activeImage) + 1)} / {availableThumbnails.length}
                    </div>
                  </>
                )}
              </div>

              {availableThumbnails.length > 1 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-[#D4B06A] flex items-center gap-1.5">
                      <span>📷 صور وزوايا المنتج (يتغير السعر مع تقليب الصور):</span>
                    </p>
                    <span className="text-[10px] bg-[#1C1815] text-[#F3EEE4] px-2 py-0.5 rounded-md font-mono font-bold">
                      {availableThumbnails.length} صور متاحة
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {availableThumbnails.map((thumbUrl, idx) => (
                      <button
                        key={`${thumbUrl}-${idx}`}
                        onClick={() => handleSwitchImage(thumbUrl)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImage === thumbUrl
                            ? 'border-white/10 shadow-sm scale-102 ring-2 ring-white/10/30 bg-[#141210]'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-white/10 bg-[#141210]'
                        }`}
                        title={`اضغط لرؤية هذه الزاوية وتحديث السعر تلقائياً (${idx + 1})`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`زاوية ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#7FD1A0] font-medium mt-0.5">
                    * اضغط على أي صورة أو استخدم الأسهم لتحديث زاوية العرض واللون والسعر تلقائياً.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
              {/* 💡 تم إصلاح الحدود هنا */}
              <div className="p-3 bg-[#7FD1A0]/10 border border-[#7FD1A0]/25 rounded-xl flex items-start gap-2.5 text-xs text-[#7FD1A0]">
                <ShieldCheck className="w-4 h-4 text-[#7FD1A0] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong className="block text-[#9BE0B8] font-black mb-0.5">
                    ✨ يوجد معاينة عند وصول الطلب
                  </strong>
                  <span>
                    يحق لك فحص ومعاينة المنتج وتفاصيل الخشب واللون بالكامل عند وصول مندوب التوصيل لباب بيتك قبل الاستلام والدفع كاش أو عبر كليك.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#B9B0A0]">
                <div className="flex items-center gap-2 bg-[#1C1815] p-2 rounded-lg border border-white/10">
                  <Truck className="w-3.5 h-3.5 text-[#D4B06A] shrink-0" />
                  <span>توصيل لكافة المحافظات</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1C1815] p-2 rounded-lg border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-[#D4B06A] shrink-0" />
                  <span>{product.warranty || 'ضمان سنتين'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[#141210]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8A8173] mb-2 font-medium">
                <span className="text-[#D4B06A] font-bold">{product.categoryLabel || 'منتج'}</span>
                <span aria-hidden="true">·</span>
                <span>القطعة رقم #{product.itemNumber || '-'}</span>
                {product.woodType && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#7FD1A0] font-bold">{product.woodType}</span>
                  </>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#F3EEE4] leading-tight mb-2 font-serif">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 my-4 pb-2 border-b border-white/10">
                <span className="text-3xl sm:text-4xl font-black text-[#F3EEE4] tabular-nums font-mono transition-all duration-300">
                  {currentPrice.toFixed(2)}
                </span>
                <span className="text-base font-bold text-[#A39A8B]">
                  دينار أردني (د.أ)
                </span>
                {currentOriginalPrice > 0 && (
                  <span className="text-sm text-[#8A8173] line-through tabular-nums font-mono">
                    {currentOriginalPrice.toFixed(2)} د.أ
                  </span>
                )}
                {Number(selectedColor.price) !== Number(product.basePrice) && (
                  <span className="text-[11px] bg-[#1C1815] text-[#D4B06A] font-bold px-2 py-0.5 rounded-md border border-white/10/30 mr-auto">
                    سعر هذا اللون
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] text-[#7FD1A0] bg-[#7FD1A0]/10 px-2.5 py-1 rounded-lg font-medium border border-white/10/25 flex items-center gap-1.5 shadow-none">
                  <Sparkles className="w-3.5 h-3.5 text-[#7FD1A0] shrink-0" />
                  <span>السعر يتغير تلقائياً مع تقليب صور الألوان المختلفة</span>
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xs sm:text-sm text-[#B9B0A0] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {(product.dimensions || product.woodType) && (
                <div className="bg-[#1C1815] p-4 rounded-2xl border border-white/10 mb-6 space-y-2.5">
                  {product.dimensions && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <Ruler className="w-4 h-4 text-[#D4B06A] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#F3EEE4]">المقاسات والأبعاد:</strong>{' '}
                        <span className="text-[#B0A797]">{product.dimensions}</span>
                      </div>
                    </div>
                  )}

                  {product.woodType && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <Shield className="w-4 h-4 text-[#D4B06A] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#F3EEE4]">نوعية الخشب:</strong>{' '}
                        <span className="text-[#B0A797]">{product.woodType}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-[#F3EEE4]">
                      اختر اللون:{' '}
                      <span className="text-[#D4B06A] font-semibold">{selectedColor.name}</span>
                    </label>
                    <span className="text-[11px] text-[#A39A8B]">
                      السعر: <strong className="text-[#F3EEE4] font-mono">{currentPrice.toFixed(2)} د.أ</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor.name === color.name;
                      return (
                        <button
                          key={color.name}
                          onClick={() => handleSelectColor(color)}
                          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#D4B06A] bg-[#1C1815] shadow-none text-[#F3EEE4] ring-1 ring-[#D4B06A]'
                              : 'border-white/10 bg-[#141210] text-[#B9B0A0] hover:border-[#D4B06A]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/15 shrink-0 shadow-none"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                          {Number(color.price) !== Number(product.basePrice) && (
                            <span className="text-[10px] text-[#D4B06A] font-mono">
                              ({Number(color.price).toFixed(2)} د.أ)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold text-[#F3EEE4]">الكمية المطلوبة:</span>
                <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-[#141210]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-base hover:bg-[#26211D] transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold tabular-nums text-[#F3EEE4] font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-base hover:bg-[#26211D] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#A39A8B]">
                  الإجمالي: <strong className="text-[#F3EEE4] font-mono">{(currentPrice * quantity).toFixed(2)} د.أ</strong>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <button
                onClick={handleAdd}
                className="w-full py-3.5 px-6 text-sm font-bold text-[#0B0A09] bg-[#D4B06A] hover:bg-[#E8CC8A] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>تمت الإضافة إلى السلة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>أضف إلى السلة 🛒</span>
                  </>
                )}
              </button>

              {/* 💡 تم إصلاح الحدود هنا */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 text-xs font-bold text-[#7FD1A0] bg-[#7FD1A0]/10 hover:bg-[#7FD1A0]/15 border border-[#7FD1A0]/25 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#7FD1A0]" />
                <span>طلب مباشر واستفسار عبر واتساب</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
