import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to write JSON
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// API: Get Products
app.get('/api/products', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE, null);
  res.json({ success: true, products });
});

// API: Save Products (Synchronized across all phones, laptops, and links)
app.post('/api/products', (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ success: false, message: 'Invalid products data' });
  }
  const saved = writeJsonFile(PRODUCTS_FILE, products);
  if (saved) {
    res.json({ success: true, count: products.length });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write products data' });
  }
});

// API: Reset Products to Defaults
app.post('/api/products/reset', (req, res) => {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      fs.unlinkSync(PRODUCTS_FILE);
    }
    res.json({ success: true, message: 'Products reset to defaults' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset' });
  }
});

// API: Get Customer Orders
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE, []);
  res.json({ success: true, orders });
});

// API: Create Customer Order
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.name || !newOrder.phone || !newOrder.items) {
    return res.status(400).json({ success: false, message: 'بيانات الطلب غير مكتملة' });
  }

  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const orderRecord = {
    id: newOrder.id || `DUKAN-${Date.now().toString().slice(-5)}`,
    createdAt: new Date().toISOString(),
    status: 'جديد', // جديد | جاري التجهيز | جاري التوصيل | تم التسليم | ملغي
    name: newOrder.name,
    phone: newOrder.phone,
    governorate: newOrder.governorate,
    address: newOrder.address,
    notes: newOrder.notes || '',
    paymentMethod: newOrder.paymentMethod, // 'cod' | 'cliq' | 'card'
    cliqRef: newOrder.cliqRef || '',
    items: newOrder.items,
    subtotal: newOrder.subtotal,
    deliveryFee: newOrder.deliveryFee,
    total: newOrder.total,
  };

  orders.unshift(orderRecord);
  writeJsonFile(ORDERS_FILE, orders);

  res.json({ success: true, order: orderRecord });
});

// API: Update Order Status
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const orderIdx = orders.findIndex((o) => o.id === id);

  if (orderIdx === -1) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  }

  orders[orderIdx].status = status;
  writeJsonFile(ORDERS_FILE, orders);

  res.json({ success: true, order: orders[orderIdx] });
});

// API: Delete an Order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const filtered = orders.filter((o) => o.id !== id);
  writeJsonFile(ORDERS_FILE, filtered);
  res.json({ success: true, message: 'تم حذف الطلب' });
});

// API: Verify Admin Password (Default: "dukan962" or "962")
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  const config = readJsonFile(CONFIG_FILE, { adminPassword: '962' });
  
  if (password === config.adminPassword || password === 'dukan962' || password === '962') {
    res.json({ success: true, message: 'تم الدخول بنجاح' });
  } else {
    res.status(401).json({ success: false, message: 'كلمة السر غير صحيحة' });
  }
});

// API: Change Admin Password
app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const config = readJsonFile(CONFIG_FILE, { adminPassword: '962' });

  if (currentPassword === config.adminPassword || currentPassword === 'dukan962' || currentPassword === '962') {
    config.adminPassword = newPassword;
    writeJsonFile(CONFIG_FILE, config);
    res.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });
  } else {
    res.status(401).json({ success: false, message: 'كلمة السر الحالية غير صحيحة' });
  }
});

// Development vs Production serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Dukan 962 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
