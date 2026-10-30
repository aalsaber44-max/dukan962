import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBoxes } from './components/CategoryBoxes';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Product, CartItem, ProductColor, Category } from './types/furniture';
import { Toast, ToastData, ToastVariant } from './components/Toast';
import { EmptyState, ProductSkeletonGrid, ActiveFilter } from './components/EmptyState';

// استيراد دوال Firebase
import { collection, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

// 💡 بيانات الصفحة الرئيسية الافتراضية (تم تحديث الروابط إلى Postimages)
const homeCategoryData: Category = {
  id: 'all',
  name: 'الرئيسية',
  image: 'https://i.postimg.cc/TPJ91jBX/Designer1.png',
  bannerImage: 'https://i.postimg.cc/TPJ91jBX/Designer1.png', // 💻 كمبيوتر
  mobileBannerImage: 'https://i.postimg.cc/TPJ91jBX/Designer1.png', // 📱 هاتف
  title: 'دكان 962.. وجهتك الأولى للتسوق الشامل',
  description: 'أفضل المنتجات والتصاميم المختارة بعناية، بجودة عالية وأسعار منافسة. تسوق كل ما يحتاجه بيتك وأناقتك الآن واستمتع بخدمة المعاينة عند الاستلام والتوصيل لجميع المحافظات.',
  buttonText: 'استكشف تشكيلاتنا الآن',
  badgeText: '✨ جودة تستحق الاقتناء',
  isActive: true,
  order: 0
};

export default function App() {
  // 1. حالات المنتجات والأقسام
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  // 2. جلب المنتجات والأقسام من السحابة (Live Sync)
  useEffect(() => {
    // جلب المنتجات
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        prods.push({ 
          id: doc.id, 
          name: data.name || 'منتج بدون اسم',
          description: data.description || 'لا يوجد وصف',
          basePrice: Number(data.basePrice) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          ...data 
        } as Product);
      });
      setProducts(prods);
      setProductsLoaded(true);
    }, (error) => {
      console.error('Error loading products:', error);
      setProductsLoaded(true);
    });

    // جلب الأقسام
    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(cats.filter(c => c.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  // 💡 3. كود زراعة الأقسام (Auto-Seeding) + التحديث الإجباري لجميع الصور
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
          for (const cat of defaultCategories) {
            await setDoc(doc(db, 'categories', cat.id), cat);
          }
          console.log('✅ تمت إضافة الأقسام الافتراضية بنجاح!');
        } else {
          for (const defaultCat of defaultCategories) {
            const existingDoc = snapshot.docs.find(d => d.id === defaultCat.id);
            if (existingDoc) {
              const currentData = existingDoc.data();
              if (
                currentData.image !== defaultCat.image || 
                currentData.bannerImage !== defaultCat.bannerImage || 
                currentData.mobileBannerImage !== defaultCat.mobileBannerImage ||
                currentData.title !== defaultCat.title ||
                currentData.description !== defaultCat.description
              ) {
                await setDoc(doc(db, 'categories', defaultCat.id), {
                  ...currentData,
                  image: defaultCat.image,
                  bannerImage: defaultCat.bannerImage,
                  mobileBannerImage: defaultCat.mobileBannerImage,
                  title: defaultCat.title,
                  description: defaultCat.description
                });
                console.log(`✅ تم تحديث صورة قسم ${defaultCat.name} بنجاح!`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error seeding categories:', error);
      }
    };

    seedCategories();
  }, []);

  // 4. كود ترحيل المنتجات القديمة من المتصفح إلى السحابة
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
    const activeColor = chosenColor || product.colors?.[0] || {
      name: 'افتراضي',
      hex: '#3E2723',
      price: product.basePrice,
      image: product.images?.[0] || '',
    };

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor.name === activeColor.name
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
        return next;
      } else {
        return [...prev, { product, quantity, selectedColor: activeColor }];
      }
    });

    showToast(`${product.name} (${activeColor.name})`, {
      variant: 'cart',
      actionLabel: 'عرض السلة',
      onAction: () => setIsCartOpen(true),
    });
  };

  const handleUpdateCartQuantity = (id: string, colorName: string, delta: number) => {
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
  const filteredProducts = products.filter((prod) => {
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

  filteredProducts.sort((a, b) => Number(b.isBestSeller || false) - Number(a.isBestSeller || false));

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  // الفلاتر النشطة (تظهر كشرائح قابلة للإزالة في حالة عدم وجود نتائج)
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col text-[#F3EEE4] overflow-x-hidden">
        
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
            scrollToCatalog();
          }}
        />

        {/* Hero Section */}
        <Hero onExploreClick={scrollToCatalog} categoryData={currentCategoryData} />

        {/* Categories Visual Section */}
        <CategoryBoxes
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToCatalog();
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
            scrollToCatalog();
          }}
          onOpenAdmin={() => setIsAdminAuthOpen(true)}
        />

        <ProductDetailsPage
          product={selectedProductModal}
          isWishlisted={Boolean(selectedProductModal && wishlist.some((w) => w.id === selectedProductModal.id))}
          onToggleWishlist={handleToggleWishlist}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={handleAddToCart}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedToCheckout={() => {
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
          onSuccessOrder={() => {
            setCart([]);
            localStorage.removeItem('dukan962_cart');
          }}
        />

        <AdminAuthModal
          isOpen={isAdminAuthOpen}
          onClose={() => setIsAdminAuthOpen(false)}
          onSuccess={() => {
            setIsAdminAuthOpen(false);
            setIsAdminOpen(true);
          }}
        />

        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
