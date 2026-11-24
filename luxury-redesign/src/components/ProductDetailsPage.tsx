import React, { useState, useEffect, useRef } from 'react';
import { stripEmoji } from '../utils/emoji';
import { X, ShoppingBag, MessageCircle, Shield, Truck, Check, Sparkles, Heart, ShieldCheck, ZoomIn, Play, ExternalLink, Star, Share2 } from 'lucide-react'; //إضافة أيقونة Share2
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
    selectedColor.image || product.images[0] || '');

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

  //حسابات الخصم والمنتج الجديد
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

  //دالة المشاركة
  const handleShare = async () => {
    const shareData = {
      title: `شاهد هذا المنتج في دكان 962`,
      text: `شاهد هذا المنتج في دكان 962:\n*${stripEmoji(product.name)}*\nالسعر: ${currentPrice.toFixed(2)} د.أ\n`,
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
    { label: 'رقم القطعة', value: product.itemNumber ? `#${product.itemNumber}`: ''},
    { label: 'القسم', value: product.categoryLabel || ''},
    { label: 'الأبعاد والمقاسات', value: product.dimensions || ''},
    { label: 'الخامة / نوع الخشب', value: product.woodType || ''},
    { label: 'الألوان المتاحة', value: (product.colors || []).map((c) => c.name).join('، ') },
    ...(product.attributes || []).map((a) => ({ label: a.name, value: (a.options || []).join('، ') })),
    { label: 'الضمان', value: product.warranty || ''},
  ].filter((r) => r.value);

  const whatsAppUrl = `https://wa.me/${STORE_PHONE_INTL}?text=${encodeURIComponent(
    `مرحباً دكان 962 (Dukan 962)،\nأود الاستفسار وتأكيد طلب القطعة التالية:\n\n*القطعة:* ${stripEmoji(product.name)}\n*اللون المختار:* ${stripEmoji(selectedColor.name)}\n*السعر:* ${currentPrice.toFixed(2)} دينار أردني\n*الكمية:* ${quantity}\n*الأبعاد:* ${product.dimensions || '-'}\n\nيرجى تأكيد موعد التوصيل للمحافظة.`)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto"onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[var(--sf-surface)] rounded-[26px] shadow-lift border border-[var(--sf-border)] overflow-hidden my-6 max-h-[92vh] flex flex-col"onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500/10 text-rose-400 border border-rose-400/30': 'bg-[var(--sf-surface)]/85 text-[var(--sf-muted)] hover:text-rose-400'}`}
            aria-label="المفضلة">
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600': ''}`} />
          </button>

          {/*زر المشاركة */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-[var(--sf-surface)]/85 hover:bg-[var(--sf-panel)] text-[var(--sf-text)] shadow-sm transition-all cursor-pointer" aria-label="مشاركة المنتج" title="مشاركة المنتج">
            <Share2 className="w-5 h-5"/>
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[var(--sf-surface)]/85 hover:bg-[var(--sf-panel)] text-[var(--sf-text)] shadow-sm transition-all cursor-pointer" aria-label="إغلاق النافذة">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div ref={scrollRef} className="overflow-y-auto flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-[var(--sf-border)]">
          
          {/* قسم الصور */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[var(--sf-panel)] flex flex-col justify-between">
            <div>
              <div className="relative aspect-4/3 sm:aspect-1/1 w-full rounded-[18px] overflow-hidden sf-plate border border-[var(--sf-border)] mb-4 group/carousel">
                <img
                  src={activeImage}
                  alt={`${stripEmoji(product.name)} - ${stripEmoji(selectedColor.name)}`}
                  referrerPolicy="no-referrer"onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-contain object-center p-4 transition-all duration-300 cursor-zoom-in"/>

                {/*الشارات الجديدة أعلى يمين الصورة */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                  {product.isBestSeller && (
                    <span className="sf-badge sf-badge-gold h-auto py-1.5 px-3">
                      <Star className="w-3.5 h-3.5 fill-current"/>
                      الأكثر مبيعاً
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="sf-badge h-auto py-1.5 px-3 bg-rose-500 text-white border border-transparent font-mono">
                      خصم {discountPct}%
                    </span>
                  )}
                  {isNew && !hasDiscount && !product.isBestSeller && (
                    <span className="sf-badge sf-badge-soft h-auto py-1.5 px-3 text-[var(--sf-success)]">
                      <Sparkles className="w-3.5 h-3.5"/>
                      جديد
                    </span>
                  )}
                </div>

                <button
                  type="button"onClick={() => setLightboxOpen(true)}
                  aria-label="تكبير الصورة" className="absolute bottom-3 left-3 z-10 grid place-items-center w-9 h-9 rounded-full bg-[var(--sf-surface)]/85 hover:bg-[var(--sf-accent)] text-[var(--sf-text)] hover:text-[var(--sf-accent-contrast)] ring-1 ring-[var(--sf-border)] transition-all cursor-pointer active:scale-90">
                  <ZoomIn className="w-4 h-4"/>
                </button>

                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md z-10 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40" style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span>اللون: {stripEmoji(selectedColor.name)}</span>
                </div>

                {availableThumbnails.length > 1 && (
                  <>
                    <button
                      type="button"onClick={() => {
                        const currentIdx = availableThumbnails.indexOf(activeImage);
                        const prevIdx = currentIdx <= 0 ? availableThumbnails.length - 1 : currentIdx - 1;
                        handleSwitchImage(availableThumbnails[prevIdx]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--sf-surface)]/85 hover:bg-[var(--sf-panel)] text-[var(--sf-text)] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95" aria-label="الصورة السابقة">
                      <span className="text-base font-bold font-mono">›</span>
                    </button>

                    <button
                      type="button"onClick={() => {
                        const currentIdx = availableThumbnails.indexOf(activeImage);
                        const nextIdx = currentIdx >= availableThumbnails.length - 1 ? 0 : currentIdx + 1;
                        handleSwitchImage(availableThumbnails[nextIdx]);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--sf-surface)]/85 hover:bg-[var(--sf-panel)] text-[var(--sf-text)] flex items-center justify-center shadow-md transition-all cursor-pointer z-10 hover:scale-105 active:scale-95" aria-label="الصورة التالية">
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
                    <p className="text-[11px] font-bold text-[var(--sf-accent)] flex items-center gap-1.5">
                      <span>صور وزوايا المنتج:</span>
                    </p>
                    <span className="text-[10px] bg-[var(--sf-panel)] text-[var(--sf-text)] px-2 py-0.5 rounded-md font-mono font-bold">
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
                            ? 'border-[var(--sf-accent)] scale-[1.02] ring-2 ring-[var(--sf-accent)] bg-[var(--sf-surface)]': 'border-transparent opacity-60 hover:opacity-100 hover:border-[var(--sf-border)] bg-[var(--sf-surface)]'}`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`زاوية ${idx + 1}`}
                          referrerPolicy="no-referrer" className="w-full h-full object-contain p-1"/>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {videoSource && (
                <div className="mt-4">
                  {videoSource.kind === 'link'? (
                    <a
                      href={videoSource.src}
                      target="_blank"rel="noopener noreferrer" className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--sf-soft)] ring-1 ring-[var(--sf-border-strong)] text-[var(--sf-accent)] text-xs font-bold transition-all hover:bg-[var(--sf-accent)] hover:text-[var(--sf-accent-contrast)]">
                      <Play className="w-4 h-4"/>
                      <span>شاهد فيديو المنتج</span>
                      <ExternalLink className="w-3.5 h-3.5"/>
                    </a>
                  ) : !showVideo ? (
                    <button
                      type="button"onClick={() => setShowVideo(true)}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--sf-soft)] ring-1 ring-[var(--sf-border-strong)] text-[var(--sf-accent)] text-xs font-bold transition-all hover:bg-[var(--sf-accent)] hover:text-[var(--sf-accent-contrast)] cursor-pointer active:scale-[0.98]">
                      <Play className="w-4 h-4"/>
                      <span>شاهد فيديو المنتج</span>
                    </button>
                  ) : (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-[var(--sf-border)] bg-black">
                      {videoSource.kind === 'youtube'? (
                        <iframe
                          src={videoSource.src}
                          title={`فيديو ${stripEmoji(product.name)}`}
                          className="absolute inset-0 w-full h-full"allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"/>
                      ) : (
                        <video src={videoSource.src} controls autoPlay playsInline className="absolute inset-0 w-full h-full object-contain"/>
                      )}
                      <button
                        type="button"onClick={() => setShowVideo(false)}
                        aria-label="إخفاء الفيديو" className="absolute top-2 left-2 z-10 grid place-items-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--sf-border)] space-y-2.5">
              <div className="p-3 bg-[var(--sf-success-soft)] border border-[var(--sf-border)] rounded-xl flex items-start gap-2.5 text-xs text-[var(--sf-success)]">
                <ShieldCheck className="w-4 h-4 text-[var(--sf-success)] shrink-0 mt-0.5"/>
                <div className="leading-snug">
                  <strong className="block text-[#9BE0B8] font-black mb-0.5">يوجد معاينة عند وصول الطلب
                  </strong>
                  <span>
                    يحق لك فحص ومعاينة المنتج وتفاصيل الخشب واللون بالكامل عند وصول مندوب التوصيل لباب بيتك قبل الاستلام والدفع.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--sf-muted)]">
                <div className="flex items-center gap-2 bg-[var(--sf-panel)] p-2 rounded-lg border border-[var(--sf-border)]">
                  <Truck className="w-3.5 h-3.5 text-[var(--sf-accent)] shrink-0"/>
                  <span>توصيل لكافة المحافظات</span>
                </div>
                <div className="flex items-center gap-2 bg-[var(--sf-panel)] p-2 rounded-lg border border-[var(--sf-border)]">
                  <Shield className="w-3.5 h-3.5 text-[var(--sf-accent)] shrink-0"/>
                  <span>{product.warranty || 'ضمان سنتين'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* قسم التفاصيل */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[var(--sf-surface)]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--sf-muted)] mb-2 font-medium">
                <span className="text-[var(--sf-accent)] font-bold">{product.categoryLabel || 'منتج'}</span>
                <span aria-hidden="true">·</span>
                <span>القطعة رقم #{product.itemNumber || '-'}</span>
                {product.woodType && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--sf-success)] font-bold">{product.woodType}</span>
                  </>
                )}
              </div>

              <h1 className="text-[26px] sm:text-[34px] font-bold text-[var(--sf-text)] leading-[1.25] mb-3">
                {stripEmoji(product.name)}
              </h1>

              {/*تحسين عرض السعر */}
              <div className="flex flex-wrap items-end gap-3 my-4 pb-4 border-b border-[var(--sf-border)]">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[34px] sm:text-5xl font-extrabold text-[var(--sf-text)] tabular-nums font-mono leading-none">
                      {currentPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-[var(--sf-muted)]">د.أ</span>
                  </div>
                  {hasDiscount && (
                    <span className="text-sm text-[var(--sf-muted)] line-through tabular-nums font-mono mt-1.5">
                      {currentOriginalPrice.toFixed(2)} د.أ
                    </span>
                  )}
                </div>
                
                {/* شارة التوفير */}
                {hasDiscount && (
                  <span className="text-[11px] bg-[var(--sf-success-soft)] text-[var(--sf-success)] border border-[var(--sf-border)] px-2.5 py-1 rounded-full mb-1 font-bold">
                    وفر {(currentOriginalPrice - currentPrice).toFixed(2)} د.أ
                  </span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-xs sm:text-sm text-[var(--sf-muted)] leading-relaxed">
                  {stripEmoji(product.description)}
                </p>
              </div>

              {specRows.length > 0 && (
                <div className="mb-6 rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-surface)] overflow-hidden">
                  <h3 className="px-4 py-2.5 text-xs font-bold text-[var(--sf-text)] bg-[var(--sf-panel)]">مواصفات المنتج</h3>
                  <dl className="divide-y divide-[var(--sf-border)]">
                    {specRows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-xs">
                        <dt className="text-[var(--sf-muted)] shrink-0">{row.label}</dt>
                        <dd className="text-[var(--sf-text)] font-medium text-left">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/*تحسين أزرار الألوان */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-[var(--sf-text)]">
                      اختر اللون:{' '}
                      <span className="text-[var(--sf-accent)] font-semibold">{stripEmoji(selectedColor.name)}</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor.name === color.name;
                      return (
                        <button
                          key={stripEmoji(color.name)}
                          onClick={() => handleSelectColor(color)}
                          className={`flex items-center gap-2 py-2 px-3.5 rounded-full border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'border-[var(--sf-accent)] bg-[var(--sf-accent-soft)] text-[var(--sf-text)]': 'border-[var(--sf-border)] bg-[var(--sf-surface)] text-[var(--sf-muted)] hover:border-[var(--sf-border-strong)] hover:bg-[var(--sf-panel)]'}`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-[var(--sf-border)] shrink-0 shadow-inner" style={{ backgroundColor: color.hex }}
                          />
                          <span>{stripEmoji(color.name)}</span>
                          {Number(color.price) !== Number(product.basePrice) && (
                            <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[var(--sf-accent-contrast)] bg-[var(--sf-accent)] px-1.5 rounded': 'text-[var(--sf-accent)]'}`}>
                              {Number(color.price).toFixed(0)} د.أ
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {stockState !== 'untracked'&& (
                <div
                  className={`mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${
                    isOut
                      ? 'bg-rose-500/10 text-rose-400 ring-rose-400/30': stockState === 'low'? 'bg-amber-500/10 text-amber-600 ring-amber-400/40': 'bg-[var(--sf-success-soft)] text-[var(--sf-success)] ring-[var(--sf-border)]'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                  {isOut ? 'نفدت الكمية حالياً': stockState === 'low'? `آخر ${product.stock} قطع متوفرة`: 'متوفر في المخزون'}
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold text-[var(--sf-text)]">الكمية:</span>
                <div className="flex items-center border border-[var(--sf-border)] rounded-xl overflow-hidden bg-[var(--sf-panel)] shadow-inner">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-lg hover:bg-[var(--sf-panel-2)] hover:text-[var(--sf-accent)] transition-colors cursor-pointer text-[var(--sf-text)]">
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold tabular-nums text-[var(--sf-text)] font-mono border-x border-[var(--sf-border)] bg-[var(--sf-surface)] min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={isOut || quantity >= maxQty}
                    className="px-4 py-2 text-lg hover:bg-[var(--sf-panel-2)] hover:text-[var(--sf-accent)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[var(--sf-text)]">
                    +
                  </button>
                </div>
                <span className="text-xs text-[var(--sf-muted)]">
                  الإجمالي: <strong className="text-[var(--sf-accent)] font-mono text-sm">{(currentPrice * quantity).toFixed(2)} د.أ</strong>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--sf-border)] space-y-3">
              {/*زر إضافة للسلة الفاخر */}
              <button
                onClick={handleAdd}
                disabled={isOut}
                className="sf-btn sf-btn-gold w-full h-auto py-4 px-6 text-[15px] disabled:opacity-40 disabled:cursor-not-allowed rounded-full">
                {addedNotice ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-800"strokeWidth={3} />
                    <span className="text-emerald-900">تمت الإضافة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5"/>
                    <span>{isOut ? 'غير متوفر حالياً': 'أضف إلى السلة'}</span>
                  </>
                )}
              </button>

              <a
                href={whatsAppUrl}
                target="_blank"rel="noopener noreferrer" className="w-full py-3.5 px-6 text-[12px] font-bold text-[var(--sf-success)] bg-[var(--sf-success-soft)] hover:brightness-105 border border-[var(--sf-border)] rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer">
                <MessageCircle className="w-4 h-4 text-[var(--sf-success)]"/>
                <span>طلب مباشر واستفسار عبر واتساب</span>
              </a>
            </div>

          </div>

        </div>

        {/*قسم تقييمات العملاء */}
        <ProductReviews productId={product.id} />

        {relatedProducts.length > 0 && onSelectProduct && (
          <div className="border-t border-[var(--sf-border)] bg-[var(--sf-bg-alt)] p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--sf-text)] mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--sf-accent)]"/>
              منتجات مشابهة قد تعجبك
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => {
                const img = p.colors?.[0]?.image || p.images?.[0] || '';
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="group text-right rounded-2xl bg-[var(--sf-surface)] border border-[var(--sf-border)] hover:border-[var(--sf-border-strong)] hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer active:scale-[0.98]">
                    <div className="aspect-square bg-gradient-to-b from-[var(--sf-plate-a)] to-[var(--sf-plate-b)] relative">
                      <img
                        src={img}
                        alt={p.name}
                        loading="lazy"decoding="async"referrerPolicy="no-referrer" className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"/>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-[var(--sf-text)] line-clamp-1 font-serif group-hover:text-[var(--sf-accent)] transition-colors">{p.name}</p>
                      <p className="text-sm font-extrabold text-[var(--sf-accent)] font-mono mt-1">
                        {Number(p.basePrice || 0).toFixed(2)} <span className="text-[10px] font-bold text-[var(--sf-muted)]">د.أ</span>
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
          alt={stripEmoji(product.name)}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(i) => handleSwitchImage(availableThumbnails[i])}
        />
      )}
    </div>
  );
};

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = (props) =>
  props.product ? <ProductDetailsContent {...props} product={props.product} /> : null;
