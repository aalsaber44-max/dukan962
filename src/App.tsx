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
import { DUKAN_PRODUCTS } from './data/dukanProducts';
import { Product, CartItem, ProductColor } from './types/furniture';
import { Check, Sparkles } from 'lucide-react';

export default function App() {
  // Products state (synchronized with server backend and cached in localStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dukan962_products_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DUKAN_PRODUCTS;
  });

  // Sync products with backend on mount (so mobile and laptop are always identical)
  useEffect(() => {
    const fetchServerProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          localStorage.setItem('dukan962_products_v3', JSON.stringify(data.products));
        } else {
          // Initialize server store if first run
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products }),
          });
        }
      } catch (err) {
        console.warn('Backend products fetch warning:', err);
      }
    };
    fetchServerProducts();
  }, []);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dukan962_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dukan962_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Filtering state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 160]);
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

  // Update products permanently (saved to server database & localStorage)
  const handleUpdateProducts = async (nextProducts: Product[]) => {
    setProducts(nextProducts);
    localStorage.setItem('dukan962_products_v3', JSON.stringify(nextProducts));

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: nextProducts }),
      });
    } catch (err) {
      console.warn('Failed to sync products to server:', err);
    }
  };

  const handleResetDefaults = async () => {
    setProducts(DUKAN_PRODUCTS);
    localStorage.removeItem('dukan962_products_v3');
    try {
      await fetch('/api/products/reset', { method: 'POST' });
    } catch {}
    showToast('تمت استعادة كافة المنتجات والأسعار الأصلية لـ دكان 962');
  };

  // Add to cart with color & quantity
  const handleAddToCart = (product: Product, chosenColor?: ProductColor, quantity: number = 1) => {
    const activeColor = chosenColor || product.colors[0] || {
      name: 'افتراضي',
      hex: '#3E2723',
      price: product.basePrice,
      image: product.images[0] || '',
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
    setPriceRange([20, 160]);
    setSelectedColor('');
  };

  // Filtered Products logic
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.woodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(prod.itemNumber).includes(searchQuery.trim());

    const matchesPrice = prod.basePrice >= priceRange[0] && prod.basePrice <= priceRange[1];

    const matchesColor =
      selectedColor === '' ||
      prod.colors.some((c) => c.name.toLowerCase().includes(selectedColor.toLowerCase()));

    return matchesCategory && matchesSearch && matchesPrice && matchesColor;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#3E3834] animate-bounce">
          <div className="w-5 h-5 rounded-full bg-[#2E5339] text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Notice (Jordan Delivery & Cash / CliQ / Inspection) */}
      <aside aria-label="شريط العروض" className="bg-[#1C1917] text-[#EDE8E0] text-[11px] py-2 px-4 text-center border-b border-[#2C2825]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-[#D4AF37] font-bold">👑 دكان 962 (Dukan 962) للأثاث</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>خشب تايلندي ثقيل نخب أول</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="text-[#A7F3D0] font-bold">✨ يوجد معاينة عند وصول الطلب قبل الاستلام والدفع</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>التوصيل لجميع محافظات المملكة</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="text-white/80">الدفع كاش أو عبر كليك (CliQ)</span>
        </div>
      </aside>

      {/* Navigation Header (Clicking Logo prompts Password Auth for Admin) */}
      <Navbar
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
      <Hero onExploreClick={scrollToCatalog} />

      {/* Categories Visual Section (Dynamic Lowest Price Badges) */}
      <CategoryBoxes
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
      />

      {/* Catalog & Shop Section */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#EAE3D7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D46] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تشكيلات طاولات دكان 962 الحصرية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight font-serif">
              الأكثر مبيعاً وأحدث التشكيلات
            </h2>
            <p className="text-xs text-[#78716C] mt-1">
              مرّر الفأرة فوق أي طاولة لمشاهدة زاوية أخرى، واضغط على القطعة لتغيير الألوان ومطالعة الأسعار بدقة.
            </p>
          </div>

          <div className="text-xs font-bold text-[#2E5339] bg-[#EDF4EE] px-3.5 py-1.5 rounded-xl border border-[#C5DEC8] flex items-center gap-1.5 self-start sm:self-auto">
            <span>الأسعار بالدينار الأردني (د.أ) فقط</span>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          onResetFilters={handleResetFilters}
        />

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#ECE5D9] p-8">
            <p className="text-base font-bold text-[#1C1917] mb-2">
              لا توجد طاولات مطابقة لمعايير البحث الحالية
            </p>
            <p className="text-xs text-[#78716C] mb-6">
              جرّب توسيع نطاق السعر أو اختيار تصنيف آخر.
            </p>
            <button
              onClick={handleResetFilters}
              className="py-2.5 px-6 text-xs font-bold text-white bg-[#1C1917] rounded-xl cursor-pointer"
            >
              عرض جميع الطاولات
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
      <Footer onOpenAdmin={() => setIsAdminAuthOpen(true)} />

      {/* Product Details Page / Modal */}
      <ProductDetailsPage
        product={selectedProductModal}
        isWishlisted={Boolean(selectedProductModal && wishlist.some((w) => w.id === selectedProductModal.id))}
        onToggleWishlist={handleToggleWishlist}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-in Cart Drawer */}
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

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* Checkout Modal (with CliQ & Cash on delivery, backend order storage) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onSuccessOrder={() => {
          setCart([]);
          localStorage.removeItem('dukan962_cart');
        }}
      />

      {/* Admin Security Password Auth Modal (Triggered by Logo Click) */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsAdminOpen(true);
        }}
      />

      {/* Admin Dashboard (Orders management, price editing, new products, password settings) */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={handleUpdateProducts}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
