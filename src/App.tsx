import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBoxes } from './components/CategoryBoxes';
import { CategoryVideoBanner } from './components/CategoryVideoBanner';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { FloatingActions } from './components/FloatingActions';
import { availableQty, qtyInCart, reconcileCart, refreshCartData } from './utils/inventory';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Product, CartItem, ProductColor, Category } from './types/furniture';
import { Toast, ToastData, ToastVariant } from './components/Toast';
import { EmptyState, ProductSkeletonGrid, ActiveFilter } from './components/EmptyState';

// استيراد دوال Firebase
import { collection, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, testFirestoreConnection } from './firebase';

// ⚡ تحميل كسول للوحة التحكم
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const AdminDashboardFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
    <div className="flex items-center gap-3 text-sm font-bold text-[#E8CC8A]">
      <span className="w-5 h-5 rounded-full border-2 border-[#D4B06A]/30 border-t-[#E8CC8A] animate-spin" />
      جارٍ تحميل لوحة التحكم...
    </div>
  </div>
);

// 💡 بيانات الصفحة الرئيسية الافتراضية
const homeCategoryData: Category = {
  id: 'all',
  name: 'الرئيسية',
  image: 'https://i.postimg.cc/TPJ91jBX/Designer1.png',
  bannerImage: 'https://i.postimg.cc/TPJ91jBX/Designer1.png',
  mobileBannerImage: 'https://i.postimg.cc/TPJ91jBX/Designer1.png',
  title: 'دكان 962.. وجهتك الأولى للتسوق الشامل',
  description: 'أفضل المنتجات والتصاميم المختارة بعناية، بجودة عالية وأسعار منافسة. تسوق كل ما يحتاجه بيتك وأناقتك الآن واستمتع بخدمة المعاينة عند الاستلام والتوصيل لجميع المحافظات.',
  buttonText: 'استكشف تشكيلاتنا الآن',
  badgeText: '✨ جودة تستحق الاقتناء',
  isActive: true,
  order: 0
};

export default function App() {
  // وضع ألوان المتجر فقط؛ لوحة الإدارة تبقى على تصميمها الحالي.
  const [isLightTheme, setIsLightTheme] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dukan962_store_theme') === 'light';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // 💡 هذا السطر مهم جداً ليتعرف المتصفح على الوضع (لشريط التمرير والحقول)
    document.documentElement.dataset.theme = isLightTheme ? 'light' : 'dark';
    try {
      localStorage.setItem('dukan962_store_theme', isLightTheme ? 'light' : 'dark');
    } catch {
      // استمرار عمل الواجهة حتى إذا كان التخزين المحلي غير متاح.
    }
  }, [isLightTheme]);

  // 1. حالات المنتجات والأقسام
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  // 2. جلب المنتجات والأقسام من السحابة (Live Sync)
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        prods.push({ 
          ...data,
          id: doc.id, 
          name: data.name || 'منتج بدون اسم',
          description: data.description || 'لا يوجد وصف',
          basePrice: Number(data.basePrice) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          images: Array.isArray(data.images) ? data.images : [],
          colors: Array.isArray(data.colors) ? data.colors : [],
        } as Product);
      });
      setProducts(prods);
      setProductsLoaded(true);
    }, (error) => {
      console.error('Error loading products:', error);
      setProductsLoaded(true);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ ...doc.data(), id: doc.id } as Category);
      });
      setCategories(cats.filter(c => c.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  // 🩺 اختبار الاتصال بقاعدة Firestore عند الإقلاع
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // 🔄 تحديث بيانات السلة تلقائياً عند أي تغيّر في المنتجات
  useEffect(() => {
    if (!productsLoaded || products.length === 0 || cart.length === 0) return;
    setCart((prev) => refreshCartData(prev, products));
  }, [products, productsLoaded]);

  // 💡 3. زراعة الأقسام الافتراضية — فقط عند أول تشغيل (مجموعة فارغة)
  useEffect(() => {
    const seedCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        
        const defaultCategories = [
          {
            id: 'tables',
            name: 'طاولات',
            image: 'https://i.postimg.cc/nLGkrKg6/Designer-(3).png',
            bannerImage: 'https://i.postimg.cc/nLGkrKg6/Designer-(3).png', 
            mobileBannerImage: 'https://i.postimg.cc/nLGkrKg6/Designer-(3).png',
            title: 'طاولات عصرية تجمع بين الأناقة والعملية',
            description: 'اكتشف تشكيلتنا المميزة من الطاولات المصممة لتناسب كافة زوايا منزلك. تصاميم فاخرة، خامات متينة، وأسعار منافسة مع خدمة المعاينة عند الاستلام والتوصيل لكل المحافظات',
            buttonText: 'استكشف طاولات العرض الآن',
            badgeText: '✨ يوجد معاينة عند وصول الطلب',
            isActive: true,
            order: 1
          },
          {
            id: 'shoes',
            name: 'أحذية',
            image: 'https://i.postimg.cc/Ls3T5kwz/Designer-(1).png',
            bannerImage: 'https://i.postimg.cc/Ls3T5kwz/Designer-(1).png', 
            mobileBannerImage: 'https://i.postimg.cc/Ls3T5kwz/Designer-(1).png', 
            title: 'أحدث صيحات الأحذية',
            description: 'خامات عالية الجودة وتصاميم عصرية تناسب كل الأذواق. راحة وتميز في كل خطوة.',
            buttonText: 'استكشف الأحذية الآن',
            badgeText: '👟 خامات أصلية',
            isActive: true,
            order: 2
          },
          {
            id: 'perfumes',
            name: 'عطور',
            image: 'https://i.postimg.cc/R0LRh1yY/Designer.png',
            bannerImage: 'https://i.postimg.cc/R0LRh1yY/Designer.png', 
            mobileBannerImage: 'https://i.postimg.cc/R0LRh1yY/Designer.png', 
            title: 'عطور تدوم طويلاً',
            description: 'عطور فاخرة بتركيزات عالية تناسب جميع المناسبات. عبق يبقى معك طوال اليوم.',
            buttonText: 'استكشف العطور الآن',
            badgeText: '🌟 عطور فاخرة',
            isActive: true,
            order: 3
          },
          {
            id: 'ramadan',
            name: 'زينة رمضان',
            image: 'https://i.postimg.cc/vmtzT7CF/Designer-(2).png',
            bannerImage: 'https://i.postimg.cc/vmtzT7CF/Designer-(2).png', 
            mobileBannerImage: 'https://i.postimg.cc/vmtzT7CF/Designer-(2).png', 
            title: 'زينة رمضان.. أضف البهجة لبيتك',
            description: 'فوانيس وزينة رمضانية مميزة لاستقبال الشهر الفضيل بأجواء روحانية ومبهجة.',
            buttonText: 'استكشف زينة رمضان',
            badgeText: '🌙 أجواء رمضانية',
            isActive: true,
            order: 4
          }
        ];

        if (snapshot.empty) {
          for (const defaultCat of defaultCategories) {
            await setDoc(doc(db, 'categories', defaultCat.id), defaultCat);
          }
          return;
        }

        for (const defaultCat of defaultCategories) {
          const existingDoc = snapshot.docs.find((d) => d.id === defaultCat.id);
          if (!existingDoc) continue;

          const currentData = existingDoc.data();
          const missingDefaults = Object.fromEntries(
            Object.entries(defaultCat).filter(([key]) =>
              currentData[key] === undefined
            )
          );
          if (Object.keys(missingDefaults).length > 0) {
            await setDoc(doc(db, 'categories', defaultCat.id), missingDefaults, { merge: true });
          }
        }
      } catch (error) {
        console.error('Error seeding categories:', error);
      }
    };

    seedCategories();
  }, []);

  // 4. ترحيل المنتجات القديمة من المتصفح إلى السحابة
  useEffect(() => {
    const migrateOldProducts = async () => {
      const savedOldProducts = localStorage.getItem('dukan962_products_v3');
      
      if (savedOldProducts) {
        const oldProducts = JSON.parse(savedOldProducts);
        
        if (oldProducts.length > 0) {
          const confirmMigration = window.confirm(
            `وجدنا ${oldProducts.length} منتج محفوظ في هذا المتصفح من قبل. هل تريد رفعهم إلى السحابة (Firebase) الآن؟`
          );
          
          if (confirmMigration) {
            try {
              for (const prod of oldProducts) {
                await setDoc(doc(db, 'products', prod.id), prod);
              }
              localStorage.removeItem('dukan962_products_v3');
              alert('تم رفع جميع المنتجات والتعديلات إلى السحابة بنجاح! 🎉');
              window.location.reload(); 
            } catch (error) {
              console.error('Error migrating data:', error);
              alert('حدث خطأ أثناء الرفع. تأكد من اتصالك بالإنترنت.');
            }
          }
        }
      }
    };
    setTimeout(migrateOldProducts, 1500); 
  }, []);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dukan962_cart');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dukan962_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Filtering state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); 
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc'>('featured');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Modals & Drawers state
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Admin Security & Dashboard state
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cart & Wishlist persistence
  useEffect(() => {
    localStorage.setItem('dukan962_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dukan962_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };

  const showToast = (
    message: string,
    options: { variant?: ToastVariant; actionLabel?: string; onAction?: () => void } = {}
  ) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, variant: options.variant ?? 'success', ...options });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // Add to cart with color & quantity
  const handleAddToCart = (product: Product, chosenColor?: ProductColor, quantity: number = 1) => {
    const liveProduct = products.find((p) => p.id === product.id);
    if (productsLoaded && !liveProduct) {
      showToast('هذا المنتج لم يعد متوفراً في المتجر', { variant: 'warning' });
      return;
    }
    
    const live = liveProduct || product;
    const liveColors = Array.isArray(live.colors) ? live.colors : [];
    
    let activeColor: ProductColor;

    // 💡 التحقق الصارم من اختيار العميل
    if (chosenColor && chosenColor.name) {
      const matchedColor = liveColors.find((c) => c.name === chosenColor.name);
      if (liveColors.length > 0 && !matchedColor) {
        // العميل اختار لوناً، ولكن هذا اللون لم يعد موجوداً في أحدث نسخة من المنتج
        showToast(`عذراً، اللون "${chosenColor.name}" لم يعد متاحاً لهذا المنتج. يرجى اختيار لون آخر.`, { variant: 'warning' });
        return;
      }
      activeColor = matchedColor || chosenColor; // إذا كان المنتج بلا ألوان، نأخذ اختيار العميل
    } else if (liveColors.length > 0) {
      // العميل لم يختر لوناً (مثلاً ضغط إضافة للسلة من كرت المنتج)، نختار أول لون متاح تلقائياً
      activeColor = liveColors[0];
    } else {
      // منتج بلا ألوان والعميل لم يرسل لوناً
      activeColor = {
        name: 'افتراضي',
        hex: '#3E2723',
        price: live.basePrice,
        image: live.images?.[0] || '',
      };
    }

    const canAdd = availableQty(live) - qtyInCart(cart, product.id);
    if (canAdd <= 0) {
      showToast(`"${product.name}" نفدت الكمية المتاحة`, { variant: 'warning' });
      return;
    }
    const requestedQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const addQty = Math.min(requestedQty, canAdd);

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor.name === activeColor.name
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          product: live,
          selectedColor: activeColor,
          quantity: next[existingIdx].quantity + addQty,
        };
        return next;
      } else {
        return [...prev, { product: live, quantity: addQty, selectedColor: activeColor }];
      }
    });

    if (addQty < requestedQty) {
      showToast(`تمت إضافة ${addQty} فقط من "${product.name}" (المتاح ${availableQty(live)})`, {
        variant: 'warning',
        actionLabel: 'عرض السلة',
        onAction: () => setIsCartOpen(true),
      });
      return;
    }

    showToast(`${product.name} (${activeColor.name})`, {
      variant: 'cart',
      actionLabel: 'عرض السلة',
      onAction: () => setIsCartOpen(true),
    });
  };

  const handleUpdateCartQuantity = (id: string, colorName: string, delta: number) => {
    if (delta > 0) {
      const live = products.find((p) => p.id === id);
      if (live && availableQty(live) - qtyInCart(cart, id) < delta) {
        showToast(`الكمية المتاحة من "${live.name}" ${availableQty(live)} فقط`, { variant: 'warning' });
        return;
      }
    }
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id && item.selectedColor.name === colorName) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string, colorName: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === id && item.selectedColor.name === colorName))
    );
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(product.name, { variant: 'remove' });
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(product.name, {
          variant: 'wishlist',
          actionLabel: 'عرض المفضلة',
          onAction: () => setIsWishlistOpen(true),
        });
        return [...prev, product];
      }
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange([0, 1000]);
    setSelectedColor('');
  };

  // Filtered Products logic
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((prod) => {
      if (prod.isActive === false) return false;

      const matchesCategory = selectedCategory === 'all' || prod.categoryId === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === '' ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(prod.itemNumber).includes(searchQuery.trim());

      const matchesPrice = prod.basePrice >= priceRange[0] && prod.basePrice <= priceRange[1];

      const matchesColor =
        selectedColor === '' ||
        prod.colors?.some((c) => c.name.toLowerCase().includes(selectedColor.toLowerCase()));

      return matchesCategory && matchesSearch && matchesPrice && matchesColor;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.basePrice) - Number(b.basePrice);
      if (sortBy === 'price-desc') return Number(b.basePrice) - Number(a.basePrice);
      if (sortBy === 'newest') {
        return (
          String(b.createdAt || '').localeCompare(String(a.createdAt || '')) ||
          (Number(b.itemNumber) || 0) - (Number(a.itemNumber) || 0)
        );
      }
      return Number(b.isBestSeller || false) - Number(a.isBestSeller || false);
    });

    return filtered;
  }, [products, selectedCategory, searchQuery, priceRange, selectedColor, sortBy]);

  // منتجات مشابهة لنافذة التفاصيل
  const relatedProducts = useMemo(
    () =>
      selectedProductModal
        ? products
            .filter((p) => p.isActive !== false && p.id !== selectedProductModal.id)
            .sort(
              (a, b) =>
                Number(b.categoryId === selectedProductModal.categoryId) -
                Number(a.categoryId === selectedProductModal.categoryId)
            )
            .slice(0, 4)
        : [],
    [products, selectedProductModal]
  );

  const cartTotalCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // ✅ عند اختيار قسم: الصعود لأعلى الصفحة لرؤية بانر القسم الجديد في Hero
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🎯 يُستخدم فقط في زر "استكشف تشكيلاتنا الآن" داخل Hero — يريد الزائر رؤية المنتجات فعلاً.
  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  // الفلاتر النشطة
  const activeFilters: ActiveFilter[] = [];
  if (selectedCategory !== 'all') {
    activeFilters.push({
      key: 'category',
      label: categories.find((c) => c.id === selectedCategory)?.name || 'قسم محدد',
      onRemove: () => setSelectedCategory('all'),
    });
  }
  if (searchQuery.trim() !== '') {
    activeFilters.push({ key: 'search', label: `بحث: ${searchQuery.trim()}`, onRemove: () => setSearchQuery('') });
  }
  if (selectedColor !== '') {
    activeFilters.push({ key: 'color', label: `اللون: ${selectedColor}`, onRemove: () => setSelectedColor('') });
  }
  if (priceRange[0] !== 0 || priceRange[1] !== 1000) {
    activeFilters.push({
      key: 'price',
      label: `${priceRange[0]} - ${priceRange[1]} د.أ`,
      onRemove: () => setPriceRange([0, 1000]),
    });
  }

  const currentCategoryData = selectedCategory === 'all' 
    ? homeCategoryData 
    : categories.find(c => c.id === selectedCategory) || homeCategoryData;

  // 🔎 SEO ديناميكي
  useEffect(() => {
    const setMetaDescription = (content: string) => {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = 'description';
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    if (selectedProductModal) {
      const price = Number(selectedProductModal.basePrice || 0).toFixed(2);
      document.title = `${selectedProductModal.name} | ${price} د.أ | دكان 962`;
      setMetaDescription(
        `${selectedProductModal.name} بسعر ${price} دينار أردني — ${selectedProductModal.description?.slice(0, 120) || 'منتج مختار بعناية من تشكيلات دكان 962 مع معاينة عند الاستلام والتوصيل لجميع المحافظات.'}`
      );
      return;
    }

    if (selectedCategory !== 'all' && currentCategoryData) {
      document.title = `${currentCategoryData.name} | دكان 962 للأثاث`;
      setMetaDescription(
        currentCategoryData.description ||
          `تشكيلة ${currentCategoryData.name} المميزة في دكان 962 — جودة عالية وأسعار منافسة والتوصيل لجميع محافظات المملكة بالدينار الأردني.`
      );
      return;
    }

    document.title = 'دكان 962 للأثاث | DUKAN 962 - طاولات وعفش فاخر';
    setMetaDescription(
      'دكان 962 للأثاث - تشكيلة طاولات وسط وصالون، طاولات شاشة وتلفزيون ومدافئ ديكور خشب تايلندي ثقيل. توصيل لكافة المحافظات بالدينار الأردني.'
    );
  }, [selectedCategory, selectedProductModal, currentCategoryData]);

  return (
    <ErrorBoundary>
      {/* 💡 التعديل هنا: إضافة storefront-theme و data-theme */}
      <div 
        className="storefront-theme min-h-screen flex flex-col text-[#F3EEE4] overflow-x-hidden"
        data-theme={isLightTheme ? 'light' : 'dark'}
      >
        
        <Toast toast={toast} onDismiss={dismissToast} />

        {/* Top Banner Notice */}
        <aside aria-label="شريط العروض" className="relative bg-[#080706] text-[#A39A8B] text-[11px] sm:text-xs py-2.5 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-5">
            <span className="text-[#E8CC8A] font-semibold">يوجد معاينة عند وصول الطلب قبل الاستلام والدفع</span>
            <span aria-hidden="true" className="hidden sm:block h-3 w-px bg-white/15" />
            <span className="hidden sm:inline">التوصيل لجميع محافظات المملكة</span>
            <span aria-hidden="true" className="hidden md:block h-3 w-px bg-white/15" />
            <span className="hidden md:inline">الدفع كاش أو عبر كليك (CliQ)</span>
          </div>
          <div aria-hidden="true" className="absolute bottom-0 inset-x-0 gold-rule opacity-60" />
        </aside>

        {/* Navigation Header */}
        <Navbar
          categories={categories}
          currentCategoryData={currentCategoryData}
          cartCount={cartTotalCount}
          wishlistCount={wishlist.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAdmin={() => setIsAdminAuthOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToTop();
          }}
          isLightTheme={isLightTheme}
          onToggleTheme={() => setIsLightTheme((current) => !current)}
        />

        {/* Hero Section */}
        <Hero onExploreClick={scrollToCatalog} categoryData={currentCategoryData} />

        {/* Categories Visual Section */}
        <CategoryBoxes
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToTop();
          }}
        />

        {/* Catalog & Shop Section */}
        <main id="catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#F3EEE4] tracking-tight font-serif">
                {selectedCategory !== 'all' ? `أحدث منتجات ${currentCategoryData.name}` : 'الأكثر مبيعاً وأحدث التشكيلات'}
              </h2>
              <p className="text-sm text-[#A39A8B] mt-2">
                اضغط على أي قطعة لمشاهدة التفاصيل والألوان.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start sm:self-auto h-9 px-4 rounded-full bg-[#7FD1A0]/10 ring-1 ring-[#7FD1A0]/25 text-xs font-bold text-[#7FD1A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7FD1A0]" />
              الأسعار بالدينار الأردني (د.أ) فقط
            </div>
          </div>

          {/* 🎬 بانر فيديو القسم — يظهر فقط عند اختيار قسم (ليس "الكل") ولديه فيديو */}
          {selectedCategory !== 'all' && currentCategoryData.videoUrl && (
            <CategoryVideoBanner
              videoUrl={currentCategoryData.videoUrl}
              poster={currentCategoryData.image}
              title={currentCategoryData.name}
            />
          )}

          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            onResetFilters={handleResetFilters}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-xs text-[#A39A8B]">
              {productsLoaded ? `${filteredProducts.length} منتج` : ''}
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
              <span className="text-xs font-bold text-[#F3EEE4] shrink-0 ml-1">ترتيب حسب:</span>
              {([
                ['featured', 'الأكثر مبيعاً'],
                ['newest', 'الأحدث'],
                ['price-asc', 'الأقل سعراً'],
                ['price-desc', 'الأعلى سعراً'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  aria-pressed={sortBy === value}
                  className={`py-1.5 px-3.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap active:scale-95 ${
                    sortBy === value
                      ? 'bg-gradient-to-b from-[#E8CC8A] to-[#D4B06A] text-[#0B0A09] shadow-gold'
                      : 'bg-white/[0.04] text-[#A39A8B] ring-1 ring-white/10 hover:text-[#F3EEE4] hover:ring-[#D4B06A]/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!productsLoaded ? (
            <ProductSkeletonGrid />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              variant={products.length === 0 ? 'no-products' : 'no-results'}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
              onReset={handleResetFilters}
              onBrowseCategories={scrollToCategories}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.some((w) => w.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p) => handleAddToCart(p)}
                  onQuickView={(p) => setSelectedProductModal(p)}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer
          categories={categories}
          currentCategoryData={currentCategoryData}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToTop();
          }}
          onOpenAdmin={() => setIsAdminAuthOpen(true)}
        />

        <ProductDetailsPage
          product={selectedProductModal}
          isWishlisted={Boolean(selectedProductModal && wishlist.some((w) => w.id === selectedProductModal.id))}
          onToggleWishlist={handleToggleWishlist}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={handleAddToCart}
          relatedProducts={relatedProducts}
          onSelectProduct={setSelectedProductModal}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedToCheckout={() => {
            if (!productsLoaded) {
              showToast('انتظر لحظة حتى يتم تحديث بيانات المنتجات والمخزون', { variant: 'warning' });
              return;
            }
            const { cart: reconciled, messages } = reconcileCart(cart, products);
            setCart(reconciled);
            if (messages.length > 0) {
              showToast(
                messages[0] + (messages.length > 1 ? ` (و${messages.length - 1} تنبيهات أخرى)` : ''),
                { variant: 'warning' }
              );
              return;
            }
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlist={wishlist}
          onRemoveFromWishlist={handleToggleWishlist}
          onAddToCart={(p) => handleAddToCart(p)}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          products={products}
          onCartChange={setCart}
          onSuccessOrder={() => {
            setCart([]);
            localStorage.removeItem('dukan962_cart');
          }}
        />

        <FloatingActions />
        
        <AdminAuthModal
          isOpen={isAdminAuthOpen}
          onClose={() => setIsAdminAuthOpen(false)}
          onSuccess={() => {
            setIsAdminAuthOpen(false);
            setIsAdminOpen(true);
          }}
        />

        <Suspense fallback={<AdminDashboardFallback />}>
          <AdminDashboard
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
          />
        </Suspense>

      </div>
    </ErrorBoundary>
  );
}
