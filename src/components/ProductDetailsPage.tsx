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

  // Active color variant (default to first color)
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || {
      name: 'اللون الافتراضي',
      hex: '#3E2723',
      price: product.basePrice,
      image: product.images[0] || '',
    }
  );

  // Active main preview image
  const [activeImage, setActiveImage] = useState<string>(
    selectedColor.image || product.images[0] || ''
  );

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // When product changes, reset to default color
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

  // Switch image AND automatically update color & price in real time!
  const handleSwitchImage = (imgUrl: string) => {
    setActiveImage(imgUrl);
    // Find matching color variant for this image (either primary or additional angle)
    const matchingColor = product.colors.find(
      (c) => c.image === imgUrl || c.additionalImages?.includes(imgUrl)
    );
    if (matchingColor) {
      setSelectedColor(matchingColor);
    }
  };

  // Compile all available thumbnails for all colors + angles of this product
  const availableThumbnails = Array.from(
    new Set([
      ...product.colors.flatMap((c) => [c.image, ...(c.additionalImages || [])]),
      ...(product.images || []),
    ].filter(Boolean))
  );

  // 💡 التعديل هنا: تحويل الأسعار إلى أرقام إجبارياً لمنع انهيار الموقع (toFixed)
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
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button & Wishlist in header */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/85 text-[#78716C] hover:text-rose-600'
            }`}
            aria-label="المفضلة"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/85 hover:bg-white text-[#1C1917] shadow-sm transition-all cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-[#EFE8DD]">
          
          {/* الجانب الأيمن (معرض الصور - Photo Gallery) */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#FAF7F2] flex flex-col justify-between">
            <div>
              {/* Large Main Showcase Image */}
              <div className="relative aspect-4/3 sm:aspect-1/1 w-full rounded-2xl overflow-hidden bg-white border border-[#E5DDD0] shadow-xs mb-4 group/carousel">
                <img
                  src={activeImage}
                  alt={`${product.name} - ${selectedColor.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain object-center p-4 transition-all duration-300"
                />

                {/* Olive Green Badge */}
                {product.isOffer && (
                  <div className="absolute top-4 right-4 bg-[#2E5339] text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs flex items-center gap-1.5 z-10">
                    <Sparkles className="w-3.5 h-3.5 text-[#A7F3D0]" />
                    <span>عرض خاص - كمية محدودة</span>
                  </div>
                )}

                {/* Selected Color Watermark indicator */}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md z-10 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span>اللون المعروض: {selectedColor.name}</span>
                </div>

                {/* Photo Carousel Flipping Arrows */}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1C1917] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1C1917] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
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

              {/* Thumbnails Strip (Angles & Colors with Instant Price Update) */}
              {availableThumbnails.length > 1 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-[#8C6D46] flex items-center gap-1.5">
                      <span>📷 صور وزوايا المنتج (يتغير السعر مع تقليب الصور):</span>
                    </p>
                    <span className="text-[10px] bg-[#EAE2D5] text-[#1C1917] px-2 py-0.5 rounded-md font-mono font-bold">
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
                            ? 'border-[#1C1917] shadow-sm scale-102 ring-2 ring-[#8C6D46]/30 bg-white'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#8C6D46] bg-white'
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
                  <p className="text-[10px] text-[#2E5339] font-medium mt-0.5">
                    * اضغط على أي صورة أو استخدم الأسهم لتحديث زاوية العرض واللون والسعر تلقائياً.
                  </p>
                </div>
              )}
            </div>

            {/* Reassurance pills & Inspection Notice */}
            <div className="mt-6 pt-4 border-t border-[#EBE3D7] space-y-2.5">
              {/* Prominent Inspection Guarantee Notice */}
              <div className="p-3 bg-[#EDF4EE] border border-[#C5DEC8] rounded-xl flex items-start gap-2.5 text-xs text-[#2E5339]">
                <ShieldCheck className="w-4 h-4 text-[#2E5339] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong className="block text-[#1E3B27] font-black mb-0.5">
                    ✨ يوجد معاينة عند وصول الطلب
                  </strong>
                  <span>
                    يحق لك فحص ومعاينة المنتج وتفاصيل الخشب واللون بالكامل عند وصول مندوب التوصيل لباب بيتك قبل الاستلام والدفع كاش أو عبر كليك.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#57534E]">
                <div className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-lg border border-[#EDE5D8]">
                  <Truck className="w-3.5 h-3.5 text-[#8C6D46] shrink-0" />
                  <span>توصيل لكافة المحافظات</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-lg border border-[#EDE5D8]">
                  <Shield className="w-3.5 h-3.5 text-[#8C6D46] shrink-0" />
                  <span>{product.warranty || 'ضمان سنتين'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* الجانب الأيسر (التفاصيل والخيارات - Product Specs & Buying Module) */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div>
              {/* Category & Item Number */}
              <div className="flex items-center gap-2 text-xs text-[#8C827A] mb-2 font-medium">
                <span className="text-[#8C6D46] font-bold">{product.categoryLabel || 'منتج'}</span>
                <span aria-hidden="true">·</span>
                <span>القطعة رقم #{product.itemNumber || '-'}</span>
                {product.woodType && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#2E5339] font-bold">{product.woodType}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-[#1C1917] leading-tight mb-2 font-serif">
                {product.name}
              </h1>

              {/* Price: Big and Clear in Jordanian Dinars (د.أ) */}
              <div className="flex items-baseline gap-3 my-4 pb-2 border-b border-[#F0EAE1]">
                <span className="text-3xl sm:text-4xl font-black text-[#1C1917] tabular-nums font-mono transition-all duration-300">
                  {currentPrice.toFixed(2)}
                </span>
                <span className="text-base font-bold text-[#78716C]">
                  دينار أردني (د.أ)
                </span>
                {/* 💡 تم تأمين السعر القديم هنا */}
                {currentOriginalPrice > 0 && (
                  <span className="text-sm text-[#A8A29E] line-through tabular-nums font-mono">
                    {currentOriginalPrice.toFixed(2)} د.أ
                  </span>
                )}
                {Number(selectedColor.price) !== Number(product.basePrice) && (
                  <span className="text-[11px] bg-[#FAF4E8] text-[#8C6D46] font-bold px-2 py-0.5 rounded-md border border-[#E6D4B8] mr-auto">
                    سعر هذا اللون
                  </span>
                )}
              </div>

              {/* Real-time price switch notice */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] text-[#2E5339] bg-[#EDF4EE] px-2.5 py-1 rounded-lg font-medium border border-[#C5DEC8] flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#2E5339] shrink-0" />
                  <span>السعر يتغير تلقائياً مع تقليب صور الألوان المختلفة</span>
                </span>
              </div>

              {/* General Description */}
              <div className="mb-6">
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications Block */}
              {(product.dimensions || product.woodType) && (
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EDE5D8] mb-6 space-y-2.5">
                  {product.dimensions && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <Ruler className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#1C1917]">المقاسات والأبعاد:</strong>{' '}
                        <span className="text-[#66605B]">{product.dimensions}</span>
                      </div>
                    </div>
                  )}

                  {product.woodType && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <Shield className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#1C1917]">نوعية الخشب:</strong>{' '}
                        <span className="text-[#66605B]">{product.woodType}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* محدد الألوان (Color Selector) */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-[#1C1917]">
                      اختر اللون:{' '}
                      <span className="text-[#8C6D46] font-semibold">{selectedColor.name}</span>
                    </label>
                    <span className="text-[11px] text-[#78716C]">
                      السعر: <strong className="text-[#1C1917] font-mono">{currentPrice.toFixed(2)} د.أ</strong>
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
                              ? 'border-[#1C1917] bg-[#FAF8F5] shadow-xs text-[#1C1917] ring-1 ring-[#1C1917]'
                              : 'border-[#E2D9CC] bg-white text-[#57534E] hover:border-[#8C6D46]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                          {/* 💡 تم تأمين سعر اللون هنا */}
                          {Number(color.price) !== Number(product.basePrice) && (
                            <span className="text-[10px] text-[#8C6D46] font-mono">
                              ({Number(color.price).toFixed(2)} د.أ)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold text-[#1C1917]">الكمية المطلوبة:</span>
                <div className="flex items-center border border-[#DDD5C7] rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-base hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold tabular-nums text-[#1C1917] font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-base hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#78716C]">
                  الإجمالي: <strong className="text-[#1C1917] font-mono">{(currentPrice * quantity).toFixed(2)} د.أ</strong>
                </span>
              </div>
            </div>

            {/* Buttons: Add to Cart 🛒 & WhatsApp */}
            <div className="pt-4 border-t border-[#F0EAE1] space-y-2.5">
              <button
                onClick={handleAdd}
                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-[#1C1917] hover:bg-[#332E2B] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 text-xs font-bold text-[#2E5339] bg-[#EDF4EE] hover:bg-[#DEEFE0] border border-[#C5DEC8] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#2E5339]" />
                <span>طلب مباشر واستفسار عبر واتساب</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
