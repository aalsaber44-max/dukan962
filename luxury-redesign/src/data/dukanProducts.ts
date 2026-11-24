import { Product } from '../types/furniture';

export const DUKAN_PRODUCTS: Product[] = [
  {
    id: 'dukan-item-1',
    itemNumber: 1,
    name: 'طقم طاولات وسط هندسية مضلعة فاخرة (وسط + 2 خدمة)',
    nameEn: 'Geometric Facet-Cut Solid Coffee Table Set',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 104.99,
    originalPrice: 130.00,
    woodType: 'خشب تايلندي ثقيل نخب أول',
    description: 'طقم طاولات صالون بتصميم مضلع هندسي فريد يحاكي قطع الألماس المعمارية. يتكون الطقم من طاولة وسط دائرية كبيرة بالإضافة إلى طاولتي خدمة جانبيتين بنفس القاعدة الهندسية المجسمة، مصنعة من خشب تايلندي ثقيل مقاوم للخدوش والرطوبة.',
    dimensions: 'طاولة الوسط: قطر 90 سم × ارتفاع 45 سم | طاولات الخدمة: قطر 45 سم × ارتفاع 52 سم',
    warranty: 'ضمان سنتين على الخشب والطلاء الثابت',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'بني جوزي محروق',
        hex: '#3E2723',
        price: 104.99,
        originalPrice: 130.00,
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80',
        additionalImages: [
          'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'أبيض ناصع لامع (بيانو)',
        hex: '#FFFFFF',
        price: 119.99,
        originalPrice: 145.00,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
        additionalImages: [
          'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop&q=80'
        ]
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-2',
    itemNumber: 2,
    name: 'طقم طاولات دائرية بقاعدة مضلعة أسطوانية (وسط + 2 خدمة)',
    nameEn: 'Fluted Tambour Round Coffee Table Set',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 69.99,
    originalPrice: 85.00,
    woodType: 'خشب تايلندي ثقيل معالج',
    description: 'تصميم أوروبي نيو-كلاسيك مع قاعدة أسطوانية مضلعة ناعمة (Tambour Fluting) تضفي انسيابية رائعة على غرف المعيشة. يتضمن طاولة وسط دائرية رئيسية مع طاولتين جانبيتين مريحتين للضيافة.',
    dimensions: 'طاولة الوسط: قطر 85 سم × ارتفاع 44 سم | طاولات الخدمة: قطر 40 سم × ارتفاع 50 سم',
    warranty: 'ضمان سنة ضد عيوب التصنيع',
    images: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'أبيض عاجي ناعم',
        hex: '#F8F6F0',
        price: 69.99,
        originalPrice: 85.00,
        image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'بني شوكولاتة دافئ',
        hex: '#4A3B32',
        price: 69.99,
        originalPrice: 85.00,
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-3',
    itemNumber: 3,
    name: 'طاولة قهوة مستطيلة زجاج سيكوريت وقوائم ملكية مقوسة',
    nameEn: 'Royal Curved-Leg Glass Coffee Table Set',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 134.99,
    originalPrice: 160.00,
    woodType: 'خشب تايلندي ثقيل وزجاج مقسى',
    description: 'قطعة فاخرة تجمع بين صلابة الخشب التايلندي المفرز وقوة الزجاج العاكس للضوء. تتميز بأرجل مقوسة منحوتة بتصميم إيطالي رشيق مع رف سفلي واسع لتنسيق الكتب والإكسسوارات.',
    dimensions: '120 سم طول × 65 سم عرض × 46 سم ارتفاع',
    warranty: 'ضمان سنتين شامل الهيكل والزجاج',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'بني محروق داكن',
        hex: '#2B1D0C',
        price: 134.99,
        originalPrice: 160.00,
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'بلوط عسلي طبيعي',
        hex: '#C19A6B',
        price: 134.99,
        originalPrice: 160.00,
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-4',
    itemNumber: 4,
    name: 'طقم طاولات متداخلة ناعمة مع مقاعد أسطوانية كوزي',
    nameEn: 'Organic Curved Nesting Table with Poufs',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 79.99,
    originalPrice: 95.00,
    woodType: 'خشب تايلندي نخب أول',
    description: 'تصميم عملي وذكي جداً للمنازل العصرية. طاولة وسط بيضاوية ذات مستويين متداخلين مع طاولتين دائريتين مضلعتين بقوائم مائلة تتناغم مع زوايا الصالون بدفء لا يضاهى.',
    dimensions: 'طاولة الوسط: 110 سم × 60 سم | الطاولات الجانبية: قطر 42 سم × ارتفاع 48 سم',
    warranty: 'ضمان سنة كاملة',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'بيج كابتشينو دافئ',
        hex: '#D7C7B0',
        price: 79.99,
        originalPrice: 95.00,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: false,
    isOffer: true
  },
  {
    id: 'dukan-item-5',
    itemNumber: 5,
    name: 'طاولة وسط بيضاوية مستويين بقاعدة مضلعة ناعمة',
    nameEn: 'Two-Tier Oval Fluted Coffee Table',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 54.99,
    originalPrice: 70.00,
    woodType: 'خشب تايلندي ثقيل',
    description: 'طاولة وسط استثنائية من مستويين متراكبين؛ المستوى العلوي البيضاوي بالخشب الداكن والمستوى الدائري المدمج، مستندة على قاعدة تضليع أوف وايت أنيقة تمنح إحساس الفنادق الفاخرة.',
    dimensions: '115 سم طول × 60 سم عرض × 44 سم ارتفاع',
    warranty: 'ضمان سنة ضد عيوب التصنيع',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'سطح جوزي مع قاعدة أوف وايت',
        hex: '#5C4033',
        price: 54.99,
        originalPrice: 70.00,
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-6',
    itemNumber: 6,
    name: 'طاولة شاشة وتلفزيون مودرن مع تقليمات بارزة وحواف ذهبية',
    nameEn: 'Modern Fluted TV Console with Gold Trim',
    category: 'tv-tables',
    categoryLabel: 'طاولات شاشة وتلفزيون',
    basePrice: 54.99,
    originalPrice: 70.00,
    woodType: 'خشب تايلندي ثقيل عالي المتانة',
    description: 'طاولة شاشة وتلفزيون بتصميم مميز يجمع بين الأناقة المودرن والعملية الفائقة. واجهة مضلعة جذابة بحواف دائرية آمنة، محلاة بإطار ذهبي ملكي لامع وأدراج سحب ناعمة تتسع لجميع الأجهزة والأسلاك.',
    dimensions: '160 سم طول × 40 سم عمق × 48 سم ارتفاع',
    warranty: 'ضمان سنتين على الهيكل والمقابض',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'أبيض لؤلؤي مع شريط ذهبي',
        hex: '#F9F8F6',
        price: 54.99,
        originalPrice: 70.00,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'بني جوزي كلاسيكي مع شريط ذهبي',
        hex: '#3E2723',
        price: 54.99,
        originalPrice: 70.00,
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-7',
    itemNumber: 7,
    name: 'طاولة شاشة فاخرة مع مدفأة كهربائية نارية مدمجة (ديكور دافئ)',
    nameEn: 'Luxury Fireplace TV Console with LED Flames',
    category: 'fireplace-tables',
    categoryLabel: 'طاولات شاشة مع مدفأة',
    basePrice: 94.99,
    originalPrice: 120.00,
    woodType: 'خشب تايلندي ثقيل ومعدن ذهبي معالج حرارياً',
    description: 'أفخم قطعة لتزيين صالة المعيشة وغرف الضيوف! طاولة شاشة مقوسة الأطراف مدمج بداخلها مدفأة كهربائية ديكورية محاكية للهب الحقيقي وكتل الجمر المتوهجة، تضفي دفئاً ساحراً وإضاءة رومانسية هادئة مع رف علوي واسع للشاشات الكبيرة حتى 75 بوصة.',
    dimensions: '180 سم طول × 42 سم عمق × 55 سم ارتفاع',
    warranty: 'ضمان سنتين شامل وحدة المدفأة والهيكل الخشبي',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'بني موكا داكن مع مدفأة ديكور',
        hex: '#37271E',
        price: 94.99,
        originalPrice: 120.00,
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'أبيض عاجي مع مدفأة ديكور',
        hex: '#F4EFE6',
        price: 94.99,
        originalPrice: 120.00,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-12',
    itemNumber: 12,
    name: 'طاولة شاشة 160 سم بقاعدة هيكل ذهبي مقوسة مستمرة',
    nameEn: 'Continuous Gold Arch Frame TV Console 160cm',
    category: 'tv-tables',
    categoryLabel: 'طاولات شاشة وتلفزيون',
    basePrice: 59.99,
    originalPrice: 75.00,
    woodType: 'خشب تايلندي ثقيل ومعدن ستانلس ذهبي',
    description: 'تتميز هذه الطاولة بقاعدة حديدية ذهبية متصلة ترفعها عن الأرضية بوقار وتسهل حركة مكانس الروبوت والتنظيف تحتها، مع أدراج واسعة وتقليمات بارزة.',
    dimensions: 'الطول 160 سم × العمق 40 سم × الارتفاع 48 سم',
    warranty: 'ضمان سنتين',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'أبيض ناصع مع قاعدة ذهبية',
        hex: '#FFFFFF',
        price: 59.99,
        originalPrice: 75.00,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: false,
    isOffer: true
  },
  {
    id: 'dukan-item-13',
    itemNumber: 13,
    name: 'طاولة وسط عضوية منحوتة بشكل حبة الفاصوليا المزدوجة',
    nameEn: 'Organic Sculptural Kidney Double Coffee Table',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 69.99,
    originalPrice: 85.00,
    woodType: 'خشب تايلندي ثقيل معالج بحبيبات ملساء',
    description: 'تحفة عصرية من طراز الباوهاوس والمنحنيات الطبيعية. مستويان عضويان بدون أي زوايا حادة، مثالية للعائلات وتوفر مظهراً مودرن استثنائي لغرف الجلوس.',
    dimensions: '120 سم طول × 70 سم عرض × 42 سم ارتفاع',
    warranty: 'ضمان سنة كاملة',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'أوف وايت ناعم غير لامع',
        hex: '#FAF7F0',
        price: 69.99,
        originalPrice: 85.00,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-16',
    itemNumber: 16,
    name: 'طقم طاولات رخامية مثلثة الأطراف ناعمة (وسط + 2 خدمة)',
    nameEn: 'Pebble Soft-Triangle Trio Marble Table Set',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 69.99,
    originalPrice: 85.00,
    woodType: 'خشب تايلندي مضلع مع سطح ماربل فاخر',
    description: 'طقم طاولات مستوحى من شكل الحصى البحري الأملس (Pebble Shape)، بقواعد أسطوانية مضلعة عصرية وسطح رخامي معرق جذاب مقاوم للحرارة والانسكابات.',
    dimensions: 'طاولة الوسط: 90 × 80 سم | طاولات الخدمة: 45 × 40 سم',
    warranty: 'ضمان سنة كاملة',
    images: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'سطح رخامي أبيض مع قاعدة بيضاء مضلعة',
        hex: '#EFEFEF',
        price: 69.99,
        originalPrice: 85.00,
        image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'سطح رخامي أبيض مع قاعدة سوداء مضلعة',
        hex: '#1E1E1E',
        price: 69.99,
        originalPrice: 85.00,
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'سطح كراميل دافئ مع قاعدة بيضاء مضلعة',
        hex: '#966F33',
        price: 69.99,
        originalPrice: 85.00,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'سطح رخامي أبيض مع قاعدة بنية مضلعة',
        hex: '#4A3B32',
        price: 69.99,
        originalPrice: 85.00,
        image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-17',
    itemNumber: 17,
    name: 'طقم طاولات خدمة وضيافة 3 قطع متداخلة بقوائم كلاسيكية',
    nameEn: 'Classic French Cabriole Nesting End Tables 3-Piece',
    category: 'side-tables',
    categoryLabel: 'طاولات خدمة وضيافة',
    basePrice: 24.99,
    originalPrice: 35.00,
    woodType: 'خشب تايلندي وسويد متين',
    description: 'عرض لا يُفوت! طقم طاولات ضيافة 3 أحجام تتداخل تحت بعضها لتوفير المساحة عند عدم الاستخدام، تتميز بقوائم منحنية أنيقة وثبات عالي للتقديم اليومي والشاي والقهوة.',
    dimensions: 'الكبيرة: 55 × 40 × 50 سم | الوسطى: 45 × 35 × 44 سم | الصغيرة: 35 × 30 × 38 سم',
    warranty: 'ضمان سنة ضد عيوب التصنيع',
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'أبيض كلاسيكي ملكي',
        hex: '#FFFFFF',
        price: 24.99,
        originalPrice: 35.00,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'بني جوزي كلاسيكي دافئ',
        hex: '#3B271A',
        price: 24.99,
        originalPrice: 35.00,
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: true,
    isOffer: true
  },
  {
    id: 'dukan-item-18',
    itemNumber: 18,
    name: 'طقم طاولات وسط أسطوانية خشبية مع طاولة زاوية مرتفعة',
    nameEn: 'Cylindrical Fluted Coffee & Pedestal Accent Table',
    category: 'center-tables',
    categoryLabel: 'طاولات وسط وصالون',
    basePrice: 64.99,
    originalPrice: 80.00,
    woodType: 'خشب تايلندي ثقيل داكن',
    description: 'يتألف هذا الطقم من طاولة صالون دائرية منخفضة بقاعدة مضلعة سميكة، بالإضافة إلى طاولة عمودية مرتفعة تستخدم لوضع التحف أو بجانب الأريكة، تعطي بُعداً معمارياً مبهراً للغرفة.',
    dimensions: 'الطاولة الكبيرة: قطر 80 سم × ارتفاع 42 سم | طاولة الزاوية: قطر 40 سم × ارتفاع 60 سم',
    warranty: 'ضمان سنتين',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80'
    ],
    colors: [
      {
        name: 'خشب بني جوزي فاخر',
        hex: '#4A3525',
        price: 64.99,
        originalPrice: 80.00,
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?w=800&auto=format&fit=crop&q=80'
      }
    ],
    inStock: true,
    featured: false,
    isOffer: true
  }
];
