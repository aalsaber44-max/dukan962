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
import { Product, CartItem, ProductColor, Category } from './types/furniture';
import { Check, Sparkles } from 'lucide-react';

// استيراد دوال Firebase
import { collection, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // تأكد أن مسار ملف firebase.ts صحيح

// 💡 بيانات الصفحة الرئيسية الافتراضية (تظهر عند اختيار "الكل")
const homeCategoryData: Category = {
  id: 'all',
  name: 'الرئيسية',
  image: 'https://res.cloudinary.com/pxn4yowl/image/upload/f_auto,q_auto:best/Gemini_Generated_Image_tqd22ztqd22ztqd2',
  bannerImage: 'https://res.cloudinary.com/pxn4yowl/image/upload/f_auto,q_auto:best/Gemini_Generated_Image_tqd22ztqd22ztqd2',
  title: 'دكان 962.. وجهتك الأولى للأثاث والعطور والأحذية',
  description: 'أرقى التصاميم والمنتجات الفاخرة بجودة عالية وأسعار منافسة. تسوق الآن واستمتع بخدمة المعاينة عند الوصول والتوصيل لجميع المحافظات.',
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
        prods.push({ id: doc.id, ...doc.data() } as Product);
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

  // 💡 3. كود زراعة الأقسام (Auto-Seeding) - يشتغل مرة واحدة بس لو السحابة فاضية
  useEffect(() => {
    const seedCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        if (snapshot.empty) {
          const defaultCategories = [
            {
              id: 'tables',
              name: 'طاولات',
              // تم تحديث الرابط هنا بالصورة الصحيحة وبجودة عالية
              image: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo6w_3vzo.png',
              bannerImage: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo6w_3vzo.png',
              title: 'أثاث يجمع بين الراحة والأناقة',
              description: 'أرقى تصاميم طاولات الوسط، طاولات الشاشات الفاخرة، والمدافئ الديكورية النارية. قطع عملية متقنة مصنعة من أثقل وأجود أخشاب التايلندي لتزيد صالتك فخامة وسحراً.',
              buttonText: 'استكشف طاولات العرض الآن',
              badgeText: '✨ يوجد معاينة عند وصول الطلب',
              isActive: true,
              order: 1
            },
            {
              id: 'shoes',
              name: 'أحذية',
              image: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo7v_mr44.png',
              bannerImage: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo7v_mr44.png',
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
              image: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo85_kjtm.png',
              bannerImage: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo85_kjtm.png',
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
              image: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo7c_obi9.png',
              bannerImage: 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo7c_obi9.png',
              title: 'زينة رمضان.. أضف البهجة لبيتك',
              description: 'فوانيس وزينة رمضانية مميزة لاستقبال الشهر الفضيل بأجواء روحانية ومبهجة.',
              buttonText: 'استكشف زينة رمضان',
              badgeText: '🌙 أجواء رمضانية',
              isActive: true,
              order: 4
            }
          ];

          for (const cat of defaultCategories) {
            await setDoc(doc(db, 'categories', cat.id), cat);
          }
          console.log('✅ تمت إضافة الأقسام الافتراضية بنجاح!');
        } else {
          // 💡 تحديث إجباري لصورة قسم الطاولات إذا كانت البيانات موجودة مسبقاً
          const tablesSnapshot = snapshot.docs.find(d => d.id === 'tables');
          if (tablesSnapshot) {
            const currentData = tablesSnapshot.data();
            const correctImage = 'https://ais-dev-rjiko7jwa6cnpdxkc7bovc-156223768736.europe-west2.run.app/raw/img_mvkwbo6w_3vzo.png';
            if (currentData.image !== correctImage) {
              await setDoc(doc(db, 'categories', 'tables'), {
                ...currentData,
                image: correctImage,
                bannerImage: correctImage
              });
              console.log('✅ تم تحديث صورة قسم الطاولات بنجاح!');
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
    // تأخير بسيط للتأكد من تحميل Firebase
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // وسعنا النطاق عشان يناسب كل المنتجات
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
    setTimeout(() => setToastMessage(null), 2500);
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#3E3834] animate-bounce">
          <div className="w-5 h-5 rounded-full bg-[#2E5339] text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
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
        currentCategoryData={currentCategoryData} // 💡 أضف هذا السطر هنا
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
        currentCategoryData={currentCategoryData} // 💡 أضف هذا السطر
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
  );
}
