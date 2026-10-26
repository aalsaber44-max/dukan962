import React, { useState, useEffect } from 'react';
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
import { ErrorBoundary } from './components/ErrorBoundary'; // 💡 إضافة درع الحماية
import { Product, CartItem, ProductColor, Category } from './types/furniture';
import { Check, Sparkles } from 'lucide-react';

// استيراد دوال Firebase
import { collection, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // تأكد أن مسار ملف firebase.ts صحيح

// 💡 بيانات الصفحة الرئيسية الافتراضية (تظهر عند اختيار "الكل")
const homeCategoryData: Category = {
  id: 'all',
  name: 'الرئيسية',
  image: 'https://i.ibb.co/8JFbkz2/Designer-1.png',
  bannerImage: 'https://i.ibb.co/vbvFC4f/Designer.png', 
  mobileBannerImage: 'https://i.ibb.co/8JFbkz2/Designer-1.png', 
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
    });

    // جلب الأقسام
    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      // بنعرض الأقسام المفعلة بس وبنرتبها
      setCategories(cats.filter(c => c.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  // 💡 3. كود زراعة الأقسام (Auto-Seeding) + التحديث الإجباري لجميع الصور (كمبيوتر + هاتف)
  useEffect(() => {
    const seedCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        
        // 💡 قائمة الأقسام بالروابط الجديدة
        const defaultCategories = [
          {
            id: 'tables',
            name: 'طاولات',
            image: 'https://i.ibb.co/S7wsCmCD/Designer-3.png',
            bannerImage: 'https://i.ibb.co/W4T7KCZS/Designer-3.png', 
            mobileBannerImage: 'https://i.ibb.co/S7wsCmCD/Designer-3.png',
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
            image: 'https://i.ibb.co/4wG7G99X/Designer-1.png',
            bannerImage: 'https://i.ibb.co/cSJ75xmn/Designer-1.png', 
            mobileBannerImage: 'https://i.ibb.co/4wG7G99X/Designer-1.png', 
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
            image: 'https://i.ibb.co/JDf95Zn/Designer.png',
            bannerImage: 'https://i.ibb.co/JDf95Zn/Designer.png', 
            mobileBannerImage: 'https://i.ibb.co/Xf5vk4tq/Designer.png', 
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
            image: 'https://i.ibb.co/Xfynd3V2/Designer-2.png',
            bannerImage: 'https://i.ibb.co/Xfynd3V2/Designer-2.png', 
            mobileBannerImage: 'https://i.ibb.co/bg4S0DwG/Designer-2.png', 
            title: 'زينة رمضان.. أضف البهجة لبيتك',
            description: 'فوانيس وزينة رمضانية مميزة لاستقبال الشهر الفضيل بأجواء روحانية ومبهجة.',
            buttonText: 'استكشف زينة رمضان',
            badgeText: '🌙 أجواء رمضانية',
            isActive: true,
            order: 4
          }
        ];

        if (snapshot.empty) {
          // إذا كانت قاعدة البيانات فاضية، نقوم بإنشاء الأقسام
          for (const cat of defaultCategories) {
            await setDoc(doc(db, 'categories', cat.id), cat);
          }
          console.log('✅ تمت إضافة الأقسام الافتراضية بنجاح!');
        } else {
          // 💡 التحديث الإجباري: نقوم بتحديث صور جميع الأقسام (الكمبيوتر والهاتف) إذا كانت مختلفة
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

  // 4. كود ترحيل المنتجات القديمة من المتصفح إلى السحابة (يعمل مرة واحدة فقط)
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart & Wishlist persistence
  useEffect(() => {
    localStorage.setItem('dukan962_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dukan962_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800); // 💡 زدنا الوقت قليلاً ليتناسب مع الأنيميشن
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

    showToast(`تمت إضافة "${product.name} (${activeColor.name})" إلى السلة`);
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
        showToast(`تمت إزالة "${product.name}" من المفضلة`);
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`تمت إضافة "${product.name}" إلى المفضلة ❤️`);
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
    // 💡 إخفاء المنتجات غير النشطة
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

  // 💡 السطر السحري: ترتيب المنتجات بحيث تظهر المنتجات المميزة (الأكثر مبيعاً) أولاً
  filteredProducts.sort((a, b) => Number(b.isBestSeller || false) - Number(a.isBestSeller || false));

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 💡 بنجيب بيانات القسم المختار، وإذا كان "الكل" بنجيب بيانات الصفحة الرئيسية
  const currentCategoryData = selectedCategory === 'all' 
    ? homeCategoryData 
    : categories.find(c => c.id === selectedCategory) || homeCategoryData;

  return (
    // 💡 درع الحماية يحيط بكل شيء
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] overflow-x-hidden">
        
        {/* 💡 إضافة أنيميشن مخصص للتنبيهات */}
        <style>
          {`
            @keyframes slideUpFade {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes shrinkWidth {
              from { width: 100%; }
              to { width: 0%; }
            }
            .animate-toast {
              animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-progress {
              animation: shrinkWidth 2.8s linear forwards;
            }
          `}
        </style>

        {/* 💡 تحسين شكل التنبيه (Toast) ليصبح زجاجياً واحترافياً */}
        {toastMessage && (
          <div className="fixed bottom-8 right-8 z-50 animate-toast">
            <div className="bg-[#1C1917]/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-[#D4AF37]/30 min-w-[280px] relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#2E5339] text-[#A7F3D0] flex items-center justify-center shrink-0 shadow-inner">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#D4AF37] font-bold tracking-wider mb-0.5">دكان 962</span>
                <span className="text-xs font-semibold leading-relaxed">{toastMessage}</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-[#D4AF37] animate-progress rounded-b-2xl"></div>
            </div>
          </div>
        )}

        {/* Top Banner Notice */}
        <aside aria-label="شريط العروض" className="bg-[#1C1917] text-[#EDE8E0] text-[11px] py-2 px-4 text-center border-b border-[#2C2825]">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[#D4AF37] font-bold">👑 دكان 962 (Dukan 962)</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>جودة نخب أول</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="text-[#A7F3D0] font-bold">✨ يوجد معاينة عند وصول الطلب قبل الاستلام والدفع</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>التوصيل لجميع محافظات المملكة</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="text-white/80">الدفع كاش أو عبر كليك (CliQ)</span>
          </div>
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#EAE3D7]">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D46] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{selectedCategory !== 'all' ? `تشكيلة ${currentCategoryData.name}` : 'تشكيلات دكان 962 الحصرية'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight font-serif">
                {selectedCategory !== 'all' ? `أحدث منتجات ${currentCategoryData.name}` : 'الأكثر مبيعاً وأحدث التشكيلات'}
              </h2>
              <p className="text-xs text-[#78716C] mt-1">
                استكشف منتجاتنا، اضغط على أي قطعة لمشاهدة التفاصيل والألوان.
              </p>
            </div>

            <div className="text-xs font-bold text-[#2E5339] bg-[#EDF4EE] px-3.5 py-1.5 rounded-xl border border-[#C5DEC8] flex items-center gap-1.5 self-start sm:self-auto">
              <span>الأسعار بالدينار الأردني (د.أ) فقط</span>
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

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-[#ECE5D9] p-8">
              <p className="text-base font-bold text-[#1C1917] mb-2">
                لا توجد منتجات مطابقة لمعايير البحث الحالية (أو لم يتم إضافة منتجات بعد)
              </p>
              <p className="text-xs text-[#78716C] mb-6">
                جرّب توسيع نطاق السعر أو اختيار تصنيف آخر، أو قم بإضافة منتجات من لوحة التحكم.
              </p>
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-6 text-xs font-bold text-white bg-[#1C1917] rounded-xl cursor-pointer"
              >
                عرض جميع المنتجات
              </button>
            </div>
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
