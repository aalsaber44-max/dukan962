import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, MessageCircle, Shield, Truck, Check, Sparkles, Heart, ShieldCheck, ZoomIn, Play, ExternalLink, Star, Share2 } from 'lucide-react'; // 💡 إضافة أيقونة Share2
import { Product, ProductColor } from '../types/furniture';
import { STORE_PHONE_INTL } from '../utils/jordanLocations';
import { getVideoSource } from '../utils/video';
import { getStockState, availableQty } from '../utils/inventory';
import { ImageLightbox } from './ImageLightbox';
import { ProductReviews } from './ProductReviews';

interface ProductDetailsPageProps {
  product: Product | null;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor: ProductColor, quantity: number) => void;
  relatedProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
}

interface ProductDetailsContentProps extends ProductDetailsPageProps {
  product: Product;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onClose,
  onAddToCart,
  relatedProducts = [],
  onSelectProduct,
}) => {

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoSource = getVideoSource(product.videoUrl);

  useEffect(() => {
    // عند الانتقال لمنتج مشابه: ارجع لأعلى النافذة وصفّر الكمية والفيديو
    setQuantity(1);
    setShowVideo(false);
    setLightboxOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
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

  // 💡 حسابات الخصم والمنتج الجديد
  const hasDiscount = currentOriginalPrice > currentPrice;
  const discountPct = hasDiscount ? Math.round((1 - currentPrice / currentOriginalPrice) * 100) : 0;
  const isNew = product.createdAt 
    ? (new Date().getTime() - new Date(product.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000 
    : false;

  const handleAdd = () => {
    if (isOut) return;
    onAddToCart(product, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 850);
  };

  // 💡 دالة المشاركة
  const handleShare = async () => {
    const shareData = {
      title: `شاهد هذا المنتج في دكان 962`,
      text: `شاهد هذا المنتج في دكان 962:\n*${product.name}*\nالسعر: ${currentPrice.toFixed(2)} د.أ\n`,
      url: window.location.origin, // نشارك رابط الموقع الحالي
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // كبديل لأجهزة الكمبيوتر أو المتصفحات القديمة: فتح واتساب
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + shareData.url)}`;
      window.open(waUrl, '_blank');
    }
  };

  const stockState = getStockState(product);
  const maxQty = availableQty(product);
  const isOut = stockState === 'out';

  const specRows: { label: string; value: string }[] = [
    { label: 'رقم القطعة', value: product.itemNumber ? `#${product.itemNumber}` : '' },
    { label: 'القسم', value: product.categoryLabel || '' },
    { label: 'الأبعاد والمقاسات', value: product.dimensions || '' },
    { label: 'الخامة / نوع الخشب', value: product.woodType || '' },
    { label: 'الألوان المتاحة', value: (product.colors || []).map((c) => c.name).join('، ') },
    ...(product.attributes || []).map((a) => ({ label: a.name, value: (a.options || []).join('، ') })),
    { label: 'الضمان', value: product.warranty || '' },
  ].filter((r) => r.value);

  const whatsAppUrl = `https://wa.me/${STORE_PHONE_INTL}?text=${encodeURIComponent(
    `مرحباً دكان 962 (Dukan 962)،\nأود الاستفسار وتأكيد طلب القطعة التالية:\n\n*القطعة:* ${product.name}\n*اللون المختار:* ${selectedColor.name}\n*السعر:* ${currentPrice.toFixed(2)} دينار أردني\n*الكمية:* ${quantity}\n*الأبعاد:* ${product.dimensions || '-'}\n\nيرجى تأكيد موعد التوصيل للمحافظة.`
  )}`;

  return (
    <div
      className="storefront-product-detail fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="luxury-panel relative w-full max-w-5xl bg-[#141210] rounded-3xl shadow-[0_0_80px_-20px_rgba(212,175,55,0.15)] border border-white/10 overflow-hidden my-6 max-h-[92vh] flex flex-col"
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

          {/* 💡 زر المشاركة */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-[#141210]/85 hover:bg-[#1E1A17] text-[#F3EEE4] shadow-sm transition-all cursor-pointer"
            aria-label="مشاركة المنتج"
            title="مشاركة المنتج"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#141210]/85 hover:bg-[#1E1A17] text-[#F3EEE4] shadow-sm transition-all cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="overflow-y-auto flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-white/10">
          
          {/* قسم الصور */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#1C1815] flex flex-col justify-between">
            <div>
              <div className="relative aspect-4/3 sm:aspect-1/1 w-full rounded-2xl overflow-hidden bg-[#141210] border border-white/10 shadow-none mb-4 group/carousel">
                <img
                  src={activeImage}
                  alt={`${product.name} - ${selectedColor.name}`}
                  referrerPolicy="no-referrer"
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-contain object-center p-4 transition-all duration-300 cursor-zoom-in"
                />

                {/* 💡 الشارات الجديدة أعلى يمين الصورة */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                  {product.isBestSeller && (
                    <span className="flex items-center gap-1.5 bg-gradient-to-b from-[#E8CC75] to-[#D4AF37] text-[#09090B] text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-gold">
                      <Star className="w-3.5 h-3.5 fill-[#09090B]" />
                      الأكثر مبيعاً
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="bg-rose-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg font-mono">
                      خصم {discountPct}%
                    </span>
                  )}
                  {isNew && !hasDiscount && !product.isBestSeller && (
                    <span className="flex items-center gap-1.5 bg-[#7FD1A0] text-[#09090B] text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      جديد
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="تكبير الصورة"
                  className="absolute bottom-3 left-3 z-10 grid place-items-center w-9 h-9 rounded-full bg-[#141210]/85 hover:bg-[#D4AF37] text-[#F3EEE4] hover:text-[#09090B] ring-1 ring-white/15 transition-all cursor-pointer active:scale-90"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md z-10 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span>اللون: {selectedColor.name}</span>
                </div>

                {availableThumbnails.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const currentIdx = availableThumbnails.indexOf(activeImage);
                        const prevIdx = currentIdx <= 0 ? availableThumbnails.length - 1 : currentIdx - 1;
                        handleSwitchImage(availableThumbnails[prevIdx]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#141210]/85 hover:bg-[#1E1A17] text-[#F3EEE4] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                      aria-label="الصورة السابقة"
                    >
                      <span className="text-base font-bold font-mono">›</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const currentIdx = availableThumbnails.indexOf(activeImage);
                        const nextIdx = currentIdx >= availableThumbnails.length - 1 ? 0 : currentIdx + 1;
                        handleSwitchImage(availableThumbnails[nextIdx]);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#141210]/85 hover:bg-[#1E1A17] text-[#F3EEE4] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                      aria-label="الصورة التالية"
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
                    <p className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1.5">
                      <span>📷 صور وزوايا المنتج:</span>
                    </p>
                    <span className="text-[10px] bg-[#1C1815] text-[#F3EEE4] px-2 py-0.5 rounded-md font-mono font-bold">
                      {availableThumbnails.length} صور
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {availableThumbnails.map((thumbUrl, idx) => (
                      <button
                        key={`${thumbUrl}-${idx}`}
                        onClick={() => handleSwitchImage(thumbUrl)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImage === thumbUrl
                            ? 'border-[#D4AF37] scale-[1.02] ring-2 ring-[#D4AF37]/30 bg-[#141210]'
                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20 bg-[#141210]'
                        }`}
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
                </div>
              )}

              {videoSource && (
                <div className="mt-4">
                  {videoSource.kind === 'link' ? (
                    <a
                      href={videoSource.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-[#D4AF37]/40 text-[#E8CC75] text-xs font-bold transition-all hover:bg-[#D4AF37] hover:text-[#09090B]"
                    >
                      <Play className="w-4 h-4" />
                      <span>شاهد فيديو المنتج</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : !showVideo ? (
                    <button
                      type="button"
                      onClick={() => setShowVideo(true)}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-[#D4AF37]/40 text-[#E8CC75] text-xs font-bold transition-all hover:bg-[#D4AF37] hover:text-[#09090B] cursor-pointer active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4" />
                      <span>شاهد فيديو المنتج</span>
                    </button>
                  ) : (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black">
                      {videoSource.kind === 'youtube' ? (
                        <iframe
                          src={videoSource.src}
                          title={`فيديو ${product.name}`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : (
                        <video src={videoSource.src} controls autoPlay playsInline className="absolute inset-0 w-full h-full object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowVideo(false)}
                        aria-label="إخفاء الفيديو"
                        className="absolute top-2 left-2 z-10 grid place-items-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
              <div className="p-3 bg-[#7FD1A0]/10 border border-[#7FD1A0]/25 rounded-xl flex items-start gap-2.5 text-xs text-[#7FD1A0]">
                <ShieldCheck className="w-4 h-4 text-[#7FD1A0] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong className="block text-[#9BE0B8] font-black mb-0.5">
                    ✨ يوجد معاينة عند وصول الطلب
                  </strong>
                  <span>
                    يحق لك فحص ومعاينة المنتج وتفاصيل الخشب واللون بالكامل عند وصول مندوب التوصيل لباب بيتك قبل الاستلام والدفع.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#B9B0A0]">
                <div className="flex items-center gap-2 bg-[#1C1815] p-2 rounded-lg border border-white/10">
                  <Truck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>توصيل لكافة المحافظات</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1C1815] p-2 rounded-lg border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{product.warranty || 'ضمان سنتين'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* قسم التفاصيل */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[#141210]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8A8173] mb-2 font-medium">
                <span className="text-[#D4AF37] font-bold">{product.categoryLabel || 'منتج'}</span>
                <span aria-hidden="true">·</span>
                <span>القطعة رقم #{product.itemNumber || '-'}</span>
                {product.woodType && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#7FD1A0] font-bold">{product.woodType}</span>
                  </>
                )}
              </div>

              <h1 id="product-detail-title" className="text-2xl sm:text-3xl font-black text-[#F3EEE4] leading-tight mb-3 font-serif">
                {product.name}
              </h1>

              {/* 💡 تحسين عرض السعر */}
              <div className="flex flex-wrap items-end gap-3 my-4 pb-4 border-b border-white/10">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-[#E8CC75] tabular-nums font-mono leading-none tracking-tight">
                      {currentPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-[#A39A8B]">د.أ</span>
                  </div>
                  {hasDiscount && (
                    <span className="text-sm text-[#8A8173] line-through tabular-nums font-mono mt-1.5">
                      {currentOriginalPrice.toFixed(2)} د.أ
                    </span>
                  )}
                </div>
                
                {/* شارة التوفير */}
                {hasDiscount && (
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md mb-1 font-bold">
                    وفر {(currentOriginalPrice - currentPrice).toFixed(2)} د.أ
                  </span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-xs sm:text-sm text-[#B9B0A0] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {specRows.length > 0 && (
                <div className="mb-6 rounded-2xl ring-1 ring-white/10 overflow-hidden">
                  <h3 className="px-4 py-2.5 text-xs font-bold text-[#F3EEE4] bg-[#1C1815]">مواصفات المنتج</h3>
                  <dl className="divide-y divide-white/10">
                    {specRows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-xs">
                        <dt className="text-[#A39A8B] shrink-0">{row.label}</dt>
                        <dd className="text-[#F3EEE4] font-medium text-left">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* 💡 تحسين أزرار الألوان */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-[#F3EEE4]">
                      اختر اللون:{' '}
                      <span className="text-[#D4AF37] font-semibold">{selectedColor.name}</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor.name === color.name;
                      return (
                        <button
                          key={color.name}
                          onClick={() => handleSelectColor(color)}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#1C1815] text-[#F3EEE4] ring-2 ring-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                              : 'border-white/10 bg-[#141210] text-[#B9B0A0] hover:border-[#D4AF37]/50 hover:bg-[#1C1815]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-inner"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                          {Number(color.price) !== Number(product.basePrice) && (
                            <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#09090B] bg-[#D4AF37] px-1.5 rounded' : 'text-[#D4AF37]'}`}>
                              {Number(color.price).toFixed(0)} د.أ
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {stockState !== 'untracked' && (
                <div
                  className={`mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${
                    isOut
                      ? 'bg-rose-500/10 text-rose-400 ring-rose-400/30'
                      : stockState === 'low'
                      ? 'bg-amber-500/10 text-amber-300 ring-amber-400/30'
                      : 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {isOut ? 'نفدت الكمية حالياً' : stockState === 'low' ? `آخر ${product.stock} قطع متوفرة` : 'متوفر في المخزون'}
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold text-[#F3EEE4]">الكمية:</span>
                <div className="flex items-center border border-white/20 rounded-xl overflow-hidden bg-[#1C1815] shadow-inner">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="تقليل الكمية"
                    className="px-4 py-2 text-lg hover:bg-[#26211D] hover:text-[#D4AF37] transition-colors cursor-pointer text-[#F3EEE4]"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold tabular-nums text-[#F3EEE4] font-mono border-x border-white/10 bg-[#141210] min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={isOut || quantity >= maxQty}
                    aria-label="زيادة الكمية"
                    className="px-4 py-2 text-lg hover:bg-[#26211D] hover:text-[#D4AF37] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[#F3EEE4]"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#A39A8B]">
                  الإجمالي: <strong className="text-[#E8CC75] font-mono text-sm">{(currentPrice * quantity).toFixed(2)} د.أ</strong>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              {/* 💡 زر إضافة للسلة الفاخر */}
              <button
                onClick={handleAdd}
                disabled={isOut}
                className="disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D4AF37] w-full py-4 px-6 text-base font-extrabold text-[#09090B] bg-gradient-to-b from-[#E8CC75] to-[#D4AF37] hover:from-[#E8CC75] hover:to-[#E8CC75] rounded-xl shadow-[0_8px_20px_-8px_rgba(212,175,55,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(212,175,55,0.8)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-800" strokeWidth={3} />
                    <span className="text-emerald-900">تمت الإضافة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>{isOut ? 'غير متوفر حالياً' : 'أضف إلى السلة 🛒'}</span>
                  </>
                )}
              </button>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 text-xs font-bold text-[#7FD1A0] bg-[#7FD1A0]/10 hover:bg-[#7FD1A0]/20 border border-[#7FD1A0]/30 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#7FD1A0]" />
                <span>طلب مباشر واستفسار عبر واتساب</span>
              </a>
            </div>

          </div>

        </div>

        {/* 💡 قسم تقييمات العملاء */}
        <ProductReviews productId={product.id} />

        {relatedProducts.length > 0 && onSelectProduct && (
          <div className="border-t border-white/10 bg-[#0F0D0B] p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold font-serif text-[#F3EEE4] mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              منتجات مشابهة قد تعجبك
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => {
                const img = p.colors?.[0]?.image || p.images?.[0] || '';
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="group text-right rounded-2xl bg-[#141210] ring-1 ring-white/10 hover:ring-[#D4AF37]/50 transition-all overflow-hidden cursor-pointer active:scale-[0.98]"
                  >
                    <div className="aspect-square bg-gradient-to-b from-[#EFE9DE] to-[#DCD4C5] relative">
                      <img
                        src={img}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-[#F3EEE4] line-clamp-1 font-serif group-hover:text-[#E8CC75] transition-colors">{p.name}</p>
                      <p className="text-sm font-extrabold text-[#E8CC75] font-mono mt-1">
                        {Number(p.basePrice || 0).toFixed(2)} <span className="text-[10px] font-bold text-[#A39A8B]">د.أ</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>

      </div>

      {lightboxOpen && availableThumbnails.length > 0 && (
        <ImageLightbox
          images={availableThumbnails}
          index={Math.max(0, availableThumbnails.indexOf(activeImage))}
          alt={product.name}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(i) => handleSwitchImage(availableThumbnails[i])}
        />
      )}
    </div>
  );
};

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = (props) =>
  props.product ? <ProductDetailsContent {...props} product={props.product} /> : null;
