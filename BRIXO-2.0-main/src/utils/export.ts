import JSZip from 'jszip';
import type { WebsiteConfig, ComponentBlock, DesignTokens, WebsiteProject } from '../types/builder';
import { generatePublishedHTML } from './publishHtml';

export interface ExportConfigOptions {
  siteName?: string;
  apiUrl?: string;
  razorpayKeyId?: string;
  includeBackend?: boolean;
  customEnv?: boolean;
}

const DEFAULT_EXPORT_TOKENS: DesignTokens = {
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  fontFamily: 'font-sans',
  borderRadius: 'rounded-xl',
  boxShadow: 'shadow-md',
  paddingTop: 16,
  paddingBottom: 16,
};

// Helper to convert theme design tokens into Tailwind CSS config string
const buildTailwindConfig = (tokens?: DesignTokens) => {
  const safeTokens = { ...DEFAULT_EXPORT_TOKENS, ...(tokens || {}) };
  return `module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${safeTokens.primaryColor}",
        secondary: "${safeTokens.secondaryColor}",
        accent: "${safeTokens.accentColor}",
        customBg: "${safeTokens.backgroundColor}",
        customText: "${safeTokens.textColor}",
      },
      fontFamily: {
        custom: ["${safeTokens.fontFamily === 'font-serif' ? 'Georgia, serif' : safeTokens.fontFamily === 'font-mono' ? 'Courier, monospace' : 'Inter, sans-serif'}"],
      },
      borderRadius: {
        custom: "${safeTokens.borderRadius === 'rounded-full' ? '9999px' : safeTokens.borderRadius === 'rounded-3xl' ? '1.5rem' : safeTokens.borderRadius === 'rounded-xl' ? '0.75rem' : safeTokens.borderRadius === 'rounded-md' ? '0.375rem' : '0px'}",
      }
    },
  },
  plugins: [],
};`;
};

// Generates complete, functional, multi-page React TypeScript App
const generateReactWorkspaceCode = (project: WebsiteProject, options: ExportConfigOptions = {}) => {
  const rawConfig = project.config || (project as any).data?.config || (project as any).data || {};
  const tokens = { ...DEFAULT_EXPORT_TOKENS, ...(rawConfig.designTokens || {}) };
  const config = { ...rawConfig, designTokens: tokens, pages: rawConfig.pages || [] };
  const siteTitle = options.siteName || project.name || 'My Website';
  const apiUrl = options.apiUrl || 'http://localhost:5000';
  const rzpKey = options.razorpayKeyId || 'rzp_test_your_key_id';

  const serializedConfig = JSON.stringify(config, null, 2);

  return `import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Truck,
  ExternalLink,
  ChevronRight,
  Menu
} from 'lucide-react';

const PROJECT_CONFIG = ${serializedConfig};
const API_BASE_URL = import.meta.env.VITE_API_URL || "${apiUrl}";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "${rzpKey}";

interface CartItem {
  id: string;
  name: string;
  price: string;
  image?: string;
  qty: number;
}

export default function App() {
  const tokens = PROJECT_CONFIG.designTokens;
  const pages = PROJECT_CONFIG.pages || [];
  const [activePageId, setActivePageId] = useState(pages[0]?.id || 'home');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart_${project.id}');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  // Customer checkout state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('cart_${project.id}', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const parsePrice = (p: any): number => {
    if (typeof p === 'number') return p;
    const m = String(p || '').replace(/,/g, '').match(/-?\\d+(?:\\.\\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  };

  const totalAmount = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.qty, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product: { id: string; name: string; price: string; image?: string }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(\`\${product.name} added to cart\`);
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSendVerification = async () => {
    if (!customerPhone.trim()) {
      showToast('Please enter a mobile phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/verification/send\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, phone: customerPhone }),
      });
      const data = await res.json();
      if (data.success) {
        if (!data.smsSent) {
          const smsInfo = data.smsStatus || \`SMS OTP: \${data.devPhoneCode || data.devCodes?.phoneCode}\`;
          setDevHint(smsInfo);
          if (data.devPhoneCode || data.devCodes?.phoneCode) setPhoneCode(data.devPhoneCode || data.devCodes?.phoneCode);
        } else {
          setDevHint(\`✓ Verification code dispatched via mobile SMS to \${customerPhone}.\`);
        }
        setCheckoutStep(2);
      } else {
        showToast(data.message || 'Failed to send verification SMS');
      }
    } catch (err: any) {
      showToast('Backend network error connecting to ' + API_BASE_URL);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodes = async () => {
    if (!phoneCode.trim()) {
      showToast('Please enter the mobile SMS verification code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/verification/verify\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, phone: customerPhone, phoneCode }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationToken(data.verificationToken || data.token);
        setCheckoutStep(3);
        showToast('Mobile number verified successfully!');
      } else {
        showToast(data.message || 'Invalid verification code');
      }
    } catch (err: any) {
      showToast('Validation network error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!verificationToken) {
      showToast('Please complete verification first');
      setCheckoutStep(2);
      return;
    }

    setLoading(true);

    if (paymentMethod === 'COD') {
      try {
        const res = await fetch(\`\${API_BASE_URL}/api/orders/place-cod\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            customerPhone,
            customerEmail,
            shippingAddress,
            items: cart,
            totalAmount: totalAmount.toFixed(2),
            siteId: "${project.id}",
            verificationToken,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const ordId = data.order?.orderId || 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
          setPlacedOrderId(ordId);
          setCart([]);
          setCheckoutStep(4);
        } else {
          showToast(data.message || 'Order placement failed');
        }
      } catch (err: any) {
        showToast('Network error placing order');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Razorpay Online Flow
    try {
      const ordRes = await fetch(\`\${API_BASE_URL}/api/payment/create-cart-order\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount.toFixed(2),
          items: cart,
          customerName,
          customerPhone,
          customerEmail,
          verificationToken,
        }),
      });
      const ordData = await ordRes.json();
      if (!ordData.success) {
        showToast(ordData.message || 'Failed to start payment');
        setLoading(false);
        return;
      }

      const options = {
        key: ordData.key_id || RAZORPAY_KEY,
        amount: ordData.order.amount,
        currency: 'INR',
        name: "${siteTitle}",
        description: \`Order for \${totalCount} items\`,
        order_id: ordData.order.id,
        prefill: { name: customerName, contact: customerPhone, email: customerEmail },
        theme: { color: tokens.primaryColor },
        handler: async (rzpResp: any) => {
          try {
            const vRes = await fetch(\`\${API_BASE_URL}/api/payment/verify-cart-payment\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...rzpResp,
                customerName,
                customerPhone,
                customerEmail,
                shippingAddress,
                items: cart,
                totalAmount: totalAmount.toFixed(2),
                siteId: "${project.id}",
                verificationToken,
              }),
            });
            const vData = await vRes.json();
            if (vData.success) {
              const ordId = vData.order?.orderId || 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
              setPlacedOrderId(ordId);
              setCart([]);
              setCheckoutStep(4);
            } else {
              showToast(vData.message || 'Payment verification failed');
            }
          } catch (e: any) {
            showToast('Verification network error');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        showToast('Razorpay Checkout SDK not loaded');
        setLoading(false);
      }
    } catch (err: any) {
      showToast('Payment connection error');
      setLoading(false);
    }
  };

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: tokens.backgroundColor, color: tokens.textColor }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-2xl text-sm font-semibold border border-slate-700">
          {toastMsg}
        </div>
      )}

      {/* Multi-page Top Bar */}
      {pages.length > 1 && (
        <div className="w-full border-b text-xs font-bold uppercase tracking-wider py-2 px-6 flex gap-6" style={{ borderColor: tokens.primaryColor + '20' }}>
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePageId(p.id)}
              className="transition-opacity hover:opacity-100"
              style={{ opacity: activePageId === p.id ? 1 : 0.5, borderBottom: activePageId === p.id ? \`2px solid \${tokens.primaryColor}\` : 'none' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Page Rendering */}
      <main className="flex-1">
        {(activePage?.components || []).map((comp, idx) => {
          const f = comp.fields || {};

          if (comp.type === 'Navbar') {
            return (
              <header key={idx} className="sticky top-0 z-40 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between" style={{ borderColor: tokens.primaryColor + '20', backgroundColor: tokens.backgroundColor + 'ee' }}>
                <span className="font-black text-xl tracking-tight" style={{ color: tokens.primaryColor }}>
                  {f.title || "${siteTitle}"}
                </span>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
                    style={{ color: tokens.primaryColor }}
                    aria-label="View Cart"
                  >
                    <ShoppingBag className="w-6 h-6" />
                    {totalCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center text-white" style={{ backgroundColor: tokens.accentColor }}>
                        {totalCount}
                      </span>
                    )}
                  </button>
                </div>
              </header>
            );
          }

          if (comp.type === 'Hero') {
            return (
              <section key={idx} className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: tokens.primaryColor }}>
                    {f.title || 'Welcome'}
                  </h1>
                  <p className="text-base opacity-80 mb-8 leading-relaxed">
                    {f.subtitle || ''}
                  </p>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="px-6 py-3.5 font-bold text-white rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: tokens.primaryColor }}
                  >
                    {f.ctaText || 'Shop Catalog'}
                  </button>
                </div>
                {f.imageUrl && (
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                    <img src={f.imageUrl} alt="Hero" className="w-full h-full object-cover" />
                  </div>
                )}
              </section>
            );
          }

          if (comp.type === 'Products') {
            const items = (f.items as any[]) || [];
            return (
              <section key={idx} className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-black text-center mb-10" style={{ color: tokens.primaryColor }}>
                  {f.title || 'Our Products'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {items.map((prod, pIdx) => (
                    <div key={pIdx} className="border rounded-2xl overflow-hidden flex flex-col justify-between p-4 shadow-sm" style={{ borderColor: tokens.primaryColor + '20' }}>
                      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                        <img src={prod.img || prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-sm" style={{ color: tokens.primaryColor }}>{prod.name}</h3>
                          <span className="font-bold text-sm" style={{ color: tokens.accentColor }}>{prod.price}</span>
                        </div>
                        <p className="text-xs opacity-70 mb-4">{prod.desc || ''}</p>
                      </div>
                      <button
                        onClick={() => addToCart({ id: \`p-\${pIdx}-\${prod.name}\`, name: prod.name, price: prod.price, image: prod.img || prod.image })}
                        className="w-full py-2.5 font-semibold text-xs border rounded-xl flex items-center justify-center gap-2 hover:bg-black/5 transition-colors"
                        style={{ borderColor: tokens.primaryColor, color: tokens.primaryColor }}
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (comp.type === 'Services' || comp.type === 'Features') {
            const items = (f.items as any[]) || [];
            return (
              <section key={idx} className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-black text-center mb-10" style={{ color: tokens.primaryColor }}>
                  {f.title || 'Features'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {items.map((item, iIdx) => (
                    <div key={iIdx} className="p-6 border rounded-2xl shadow-sm" style={{ borderColor: tokens.primaryColor + '20' }}>
                      <h3 className="font-bold text-base mb-2" style={{ color: tokens.primaryColor }}>{item.title}</h3>
                      <p className="text-sm opacity-80 leading-relaxed">{item.desc || item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (comp.type === 'ContactForm') {
            return (
              <section key={idx} className="py-16 px-6 max-w-md mx-auto">
                <div className="p-8 border rounded-3xl shadow-xl" style={{ borderColor: tokens.primaryColor + '20' }}>
                  <h2 className="text-2xl font-bold text-center mb-6" style={{ color: tokens.primaryColor }}>{f.title || 'Contact Us'}</h2>
                  <form onSubmit={(e) => { e.preventDefault(); showToast('Message received! We will reach out shortly.'); }} className="space-y-4">
                    <input required placeholder="Your Name" className="w-full px-4 py-3 border rounded-xl text-sm outline-none" style={{ borderColor: tokens.primaryColor + '30' }} />
                    <input required type="email" placeholder="Email Address" className="w-full px-4 py-3 border rounded-xl text-sm outline-none" style={{ borderColor: tokens.primaryColor + '30' }} />
                    <textarea required placeholder="Message" rows={4} className="w-full px-4 py-3 border rounded-xl text-sm outline-none" style={{ borderColor: tokens.primaryColor + '30' }}></textarea>
                    <button type="submit" className="w-full py-3.5 font-bold text-white rounded-xl shadow" style={{ backgroundColor: tokens.primaryColor }}>
                      {f.ctaText || 'Send Message'}
                    </button>
                  </form>
                </div>
              </section>
            );
          }

          if (comp.type === 'Footer') {
            return (
              <footer key={idx} className="py-10 px-6 border-t text-center text-xs opacity-75 mt-auto" style={{ borderColor: tokens.primaryColor + '20' }}>
                <p>{f.title || '© 2026 All Rights Reserved.'}</p>
              </footer>
            );
          }

          return null;
        })}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 text-slate-100 h-full p-6 flex flex-col shadow-2xl z-10">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-extrabold text-base">Your Cart ({totalCount})</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-sm">Your cart is empty</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                      <span className="text-xs text-blue-400 font-bold">{item.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 bg-slate-800 rounded text-slate-300">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-xs min-w-[20px] text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 bg-slate-800 rounded text-slate-300">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-slate-500 hover:text-red-400 ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between font-extrabold text-base">
                  <span>Total Amount</span>
                  <span className="text-blue-400">₹{totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg"
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base">Verified Customer Checkout</h3>
                <p className="text-3xs text-slate-400">Total: ₹{totalAmount.toFixed(2)} • {totalCount} items</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-4 text-xs">
              {checkoutStep === 1 && (
                <div className="space-y-3">
                  <span className="text-3xs font-black uppercase text-slate-400 block tracking-wider">Step 1: Contact & Delivery</span>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Name *" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500" />
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Mobile Number *" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500" />
                  <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email Address *" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500" />
                  <input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Shipping Address *" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500" />
                  <button onClick={handleSendVerification} disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold rounded-xl shadow-lg mt-2">
                    {loading ? 'Sending Codes...' : 'Verify Contact & Continue →'}
                  </button>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className="space-y-4">
                  <span className="text-3xs font-black uppercase text-slate-400 block tracking-wider">Step 2: Enter Mobile SMS Code</span>
                  {devHint && <div className="p-3 bg-blue-950/60 border border-blue-900 rounded-xl text-blue-300 text-3xs">{devHint}</div>}
                  <div>
                    <label className="block text-3xs font-bold text-slate-400 uppercase mb-1">Mobile SMS Code</label>
                    <input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} placeholder="6-digit mobile SMS code" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none tracking-widest text-center text-sm font-bold" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCheckoutStep(1)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold">← Back</button>
                    <button onClick={handleVerifyCodes} disabled={loading} className="flex-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg">
                      {loading ? 'Validating...' : 'Verify SMS Code & Continue →'}
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-emerald-300 flex items-center gap-2 text-3xs">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Contact details verified for <strong>{customerName}</strong> ({customerEmail})</span>
                  </div>
                  <span className="text-3xs font-black uppercase text-slate-400 block tracking-wider">Step 3: Select Payment Method</span>
                  <div className="grid grid-cols-2 gap-3">
                    <label onClick={() => setPaymentMethod('RAZORPAY')} className={\`p-4 rounded-xl border flex items-center gap-2 cursor-pointer \${paymentMethod === 'RAZORPAY' ? 'border-blue-500 bg-blue-950/30' : 'border-slate-800 bg-slate-950'}\`}>
                      <input type="radio" checked={paymentMethod === 'RAZORPAY'} onChange={() => {}} className="accent-blue-600" />
                      <span className="font-bold text-xs">Pay Online</span>
                    </label>
                    <label onClick={() => setPaymentMethod('COD')} className={\`p-4 rounded-xl border flex items-center gap-2 cursor-pointer \${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-950/30' : 'border-slate-800 bg-slate-950'}\`}>
                      <input type="radio" checked={paymentMethod === 'COD'} onChange={() => {}} className="accent-blue-600" />
                      <span className="font-bold text-xs">Cash on Delivery</span>
                    </label>
                  </div>
                  <button onClick={handlePlaceOrder} disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold rounded-xl shadow-lg mt-2">
                    {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Cash on Delivery Order' : \`Pay ₹\${totalAmount.toFixed(2)} with Razorpay\`}
                  </button>
                </div>
              )}

              {checkoutStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-lg text-slate-100">Order Placed Successfully!</h4>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left space-y-1.5 text-xs text-slate-300">
                    <div><strong>Order ID:</strong> <span className="text-blue-400 font-mono">{placedOrderId}</span></div>
                    <div><strong>Customer:</strong> {customerName}</div>
                    <div><strong>Contact:</strong> {customerPhone} • {customerEmail}</div>
                    <div><strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}</div>
                    <div><strong>Payment Method:</strong> {paymentMethod === 'COD' ? 'Cash on Delivery (Pending)' : 'Online (PAID)'}</div>
                  </div>
                  <button onClick={() => { setIsCheckoutOpen(false); setCheckoutStep(1); }} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg">
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
};

// Generates lightweight standalone backend for handling orders and Razorpay
const generateStandaloneBackendServer = (project: WebsiteProject, options: ExportConfigOptions = {}) => {
  const siteTitle = options.siteName || project.name || 'My Website';
  const rzpKey = options.razorpayKeyId || 'rzp_test_your_key_id';

  return `const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB database'))
  .catch(err => console.error('MongoDB connection error:', err));

// Order Schema
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  shippingAddress: { type: String, default: '' },
  items: { type: Array, default: [] },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['COD', 'RAZORPAY'], default: 'RAZORPAY' },
  paymentStatus: { type: String, default: 'PENDING' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '${rzpKey}',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key'
});

// In-Memory Verification store for OTPs
const verificationStore = new Map();

// 1. Send Verification SMS OTP
app.post('/api/verification/send', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number required' });
  }

  const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
  const key = String(phone).trim();
  verificationStore.set(key, {
    phoneCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
    verified: false
  });

  console.log(\`[SMS VERIFICATION CODE] \${phone} : \${phoneCode}\`);

  res.json({
    success: true,
    message: 'Mobile SMS verification code dispatched',
    devPhoneCode: phoneCode,
    devCodes: { phoneCode }
  });
});

// 2. Validate Verification OTP
app.post('/api/verification/verify', (req, res) => {
  const { phone, phoneCode } = req.body;
  const key = String(phone||'').trim();
  const record = verificationStore.get(key);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Code expired or not found' });
  }

  if (record.phoneCode !== String(phoneCode).trim()) {
    return res.status(400).json({ success: false, message: 'Invalid SMS verification code' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  record.verified = true;
  record.token = token;

  res.json({
    success: true,
    message: 'Mobile number verified successfully',
    token,
    verificationToken: token
  });
});

// 3. Place COD Order
app.post('/api/orders/place-cod', async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, shippingAddress, items, totalAmount, verificationToken } = req.body;
    
    // Check verification
    const key = \`\${(customerEmail||'').toLowerCase().trim()}-\${(customerPhone||'').trim()}\`;
    const record = verificationStore.get(key);
    if (!record || !record.verified || record.token !== verificationToken) {
      return res.status(403).json({ success: false, message: 'Customer verification required before placing order' });
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
    const order = await Order.create({
      orderId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      shippingAddress: shippingAddress || '',
      items,
      totalAmount: parseFloat(totalAmount),
      paymentMethod: 'COD',
      paymentStatus: 'PENDING (COD)'
    });

    res.json({ success: true, message: 'Order placed successfully', order });
  } catch (err) {
    console.error('COD order error:', err);
    res.status(500).json({ success: false, message: 'Server error placing order' });
  }
});

// 4. Create Razorpay Cart Order
app.post('/api/payment/create-cart-order', async (req, res) => {
  try {
    const { amount, customerEmail, customerPhone, verificationToken } = req.body;
    
    const key = \`\${(customerEmail||'').toLowerCase().trim()}-\${(customerPhone||'').trim()}\`;
    const record = verificationStore.get(key);
    if (!record || !record.verified || record.token !== verificationToken) {
      return res.status(403).json({ success: false, message: 'Verification required before payment' });
    }

    const paise = Math.round(parseFloat(amount) * 100);
    const order = await razorpay.orders.create({
      amount: paise,
      currency: 'INR',
      receipt: \`rcpt_\${Date.now()}\`
    });

    res.json({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID || '${rzpKey}' });
  } catch (err) {
    console.error('Create cart order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
  }
});

// 5. Verify Razorpay Payment Signature
app.post('/api/payment/verify-cart-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerName, customerPhone, customerEmail, shippingAddress, items, totalAmount } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(\`\${razorpay_order_id}|\${razorpay_payment_id}\`);
    const generated = hmac.digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
    const order = await Order.create({
      orderId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      shippingAddress: shippingAddress || '',
      items,
      totalAmount: parseFloat(totalAmount),
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    res.json({ success: true, message: 'Payment verified and order saved', order });
  } catch (err) {
    console.error('Verify cart payment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification error' });
  }
});

app.listen(PORT, () => {
  console.log(\`${siteTitle} Orders Backend running on http://localhost:\${PORT}\`);
});
`;
};

export const exportSiteZip = async (project: WebsiteProject, options: ExportConfigOptions = {}): Promise<Blob> => {
  const zip = new JSZip();
  const rawConfig = project.config || (project as any).data?.config || (project as any).data || {};
  const tokens = { ...DEFAULT_EXPORT_TOKENS, ...(rawConfig.designTokens || {}) };
  const config: WebsiteConfig = {
    pages: rawConfig.pages || [],
    designTokens: tokens,
  };
  const normalizedProject: WebsiteProject = {
    ...project,
    config,
  };
  const siteTitle = options.siteName || project.name || 'My Website';
  const siteSlug = siteTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // 1. Compile HTML/CSS standalone folder
  const htmlFolder = zip.folder("html_css_js");
  if (htmlFolder) {
    const fullHtml = generatePublishedHTML({
      ...normalizedProject,
      name: siteTitle
    });
    htmlFolder.file("index.html", fullHtml);
    htmlFolder.file("README.md", `# Static HTML & Tailwind CSS Website

Double-click \`index.html\` to open your website in any browser.
The cart and customer checkout will connect to your configured backend API:
\`${options.apiUrl || 'http://localhost:5000'}\`.
`);
  }

  // 2. Compile full ready-to-run Vite Project structure
  const viteFolder = zip.folder("vite_project");
  if (viteFolder) {
    viteFolder.file("package.json", `{
  "name": "${siteSlug}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}`);

    viteFolder.file("tsconfig.json", `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false
  },
  "include": ["src"]
}`);

    viteFolder.file("vite.config.ts", `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`);

    viteFolder.file("tailwind.config.js", buildTailwindConfig(config.designTokens));
    viteFolder.file("postcss.config.js", `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

    viteFolder.file(".env.example", `VITE_API_URL=${options.apiUrl || 'http://localhost:5000'}
VITE_RAZORPAY_KEY_ID=${options.razorpayKeyId || 'rzp_test_your_key_id'}
`);

    if (options.customEnv) {
      viteFolder.file(".env", `# Generated Environment Config - Keep Private
VITE_API_URL=${options.apiUrl || 'http://localhost:5000'}
VITE_RAZORPAY_KEY_ID=${options.razorpayKeyId || 'rzp_test_your_key_id'}
`);
    }

    viteFolder.file(".gitignore", `node_modules
dist
.env
.DS_Store
`);

    const srcFolder = viteFolder.folder("src");
    if (srcFolder) {
      srcFolder.file("main.tsx", `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

      srcFolder.file("index.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
`);

      srcFolder.file("App.tsx", generateReactWorkspaceCode(normalizedProject, options));
    }

    viteFolder.file("index.html", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${siteTitle}</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);
  }

  // 3. Compile Standalone Node.js Backend (if requested)
  if (options.includeBackend !== false) {
    const backendFolder = zip.folder("backend");
    if (backendFolder) {
      backendFolder.file("package.json", `{
  "name": "${siteSlug}-backend",
  "version": "1.0.0",
  "description": "Standalone orders & checkout backend for ${siteTitle}",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.3.0",
    "razorpay": "^2.9.2"
  }
}`);

      backendFolder.file("server.js", generateStandaloneBackendServer(normalizedProject, options));

      backendFolder.file(".env.example", `PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/${siteSlug}_db
RAZORPAY_KEY_ID=${options.razorpayKeyId || 'rzp_test_your_key_id'}
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
`);

      if (options.customEnv) {
        backendFolder.file(".env", `# Sensitive Configuration - Never commit to public repositories
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/${siteSlug}_db
RAZORPAY_KEY_ID=${options.razorpayKeyId || 'rzp_test_your_key_id'}
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
`);
      }

      backendFolder.file(".gitignore", `node_modules
.env
.DS_Store
*.log
`);
    }
  }

  // 4. Root README.md & Setup Documentation
  zip.file("README.md", `# ${siteTitle} — Generated Website Package

This archive contains the complete, isolated source code for **${siteTitle}** generated via BRIXO.
It contains **only your website's code and assets**, with zero platform dependencies or internal platform files.

---

## 📁 Package Structure

\`\`\`
├── html_css_js/          # Static HTML + Tailwind CSS version
│   └── index.html        # Directly runnable in any browser
│
├── vite_project/         # Production-ready Vite + React TypeScript App
│   ├── src/App.tsx       # Full website UI with interactive cart & checkout
│   ├── package.json      # Dependencies and build scripts
│   ├── .env.example      # Environment variables template
│   └── ...
│
└── backend/              # Standalone Node.js & Express Orders API (optional)
    ├── server.js         # Endpoints for cart checkout, verification & Razorpay
    ├── package.json      # Express, Mongoose & Razorpay dependencies
    └── .env.example      # Backend database & payment credentials
\`\`\`

---

## 🚀 Quick Start Guide

### Option 1: View Static HTML Version
Simply open \`html_css_js/index.html\` directly in Google Chrome, Edge, or Safari.

### Option 2: Run the Vite React Frontend
1. Open terminal and navigate to the frontend directory:
   \`\`\`bash
   cd vite_project
   npm install
   npm run dev
   \`\`\`
2. Open \`http://localhost:5173\` in your browser.

### Option 3: Run the Orders & Payment Backend
1. Open a new terminal and navigate to the backend:
   \`\`\`bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and Razorpay credentials
   npm start
   \`\`\`
2. Backend runs on \`http://localhost:5000\`.

---

## 🔒 Security & Privacy Notice
- Public keys like \`RAZORPAY_KEY_ID\` are kept in the frontend.
- Private secrets like \`RAZORPAY_KEY_SECRET\` and MongoDB credentials remain strictly on the backend.
- Do NOT commit \`.env\` files with real secrets to public repositories.

Enjoy your website!
`);

  zip.file("LICENSE", `MIT License

Copyright (c) 2026 ${siteTitle}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files to deal in the Software without restriction.
`);

  return await zip.generateAsync({ type: "blob" });
};
