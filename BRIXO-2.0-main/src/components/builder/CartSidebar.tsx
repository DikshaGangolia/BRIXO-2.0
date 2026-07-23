import axios from "axios";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight, CheckCircle, Smartphone, User, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const CartSidebar: React.FC = () => {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, getCartCount, getCartTotal } = useCartStore();

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerPhone, setCustomerPhone] = useState('+919528620651');
  const [customerEmail, setCustomerEmail] = useState('customer@brixo.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayWithRazorpay = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter customer name and phone number");
      return;
    }

    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay Checkout SDK. Check your network connection.");
        setIsProcessing(false);
        return;
      }

      const totalAmount = getCartTotal();
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // 1. Create Razorpay order on backend
      const response = await axios.post(`${API_BASE}/api/payment/create-cart-order`, {
        amount: totalAmount,
        items,
        customerName,
        customerPhone
      });

      const { order, key_id } = response.data;

      // 2. Open Razorpay Checkout popup in Test Mode
      const options = {
        key: key_id,
        amount: order.amount,
        currency: "INR",
        name: "BRIXO Checkout",
        description: `Order for ${getCartCount()} items`,
        order_id: order.id,
        prefill: {
          name: customerName,
          contact: customerPhone,
          email: customerEmail
        },
        theme: {
          color: "#3b82f6"
        },
        handler: async (razorpayResponse: any) => {
          try {
            // 3. Verify signature on backend
            const verifyRes = await axios.post(`${API_BASE}/api/payment/verify-cart-payment`, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              customerName,
              customerPhone,
              customerEmail,
              items,
              totalAmount,
              siteId: items[0]?.siteId || 'default'
            });

            if (verifyRes.data.success) {
              const savedOrder = verifyRes.data.order;
              clearCart();
              setShowCustomerForm(false);
              setCompletedOrder(savedOrder);
            } else {
              alert("Payment verification failed: " + verifyRes.data.message);
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            alert("Failed to verify payment with server: " + (err.response?.data?.message || err.message));
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpayObj = new (window as any).Razorpay(options);
      razorpayObj.open();

    } catch (err: any) {
      console.error("Checkout error:", err);
      alert("Failed to initiate checkout: " + (err.response?.data?.message || err.message));
      setIsProcessing(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter customer name and phone number");
      return;
    }

    if (paymentMethod === 'COD') {
      setIsProcessing(true);
      try {
        const totalAmount = getCartTotal();
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.post(`${API_BASE}/api/orders/place-cod`, {
          customerName,
          customerPhone,
          customerEmail,
          items,
          totalAmount,
          siteId: items[0]?.siteId || 'default'
        });

        if (response.data.success) {
          const savedOrder = response.data.order;
          clearCart();
          setShowCustomerForm(false);
          setCompletedOrder(savedOrder);
        } else {
          alert("Order placement failed: " + response.data.message);
        }
      } catch (err: any) {
        console.error("COD order error:", err);
        alert("Failed to place order: " + (err.response?.data?.message || err.message));
      } finally {
        setIsProcessing(false);
      }
    } else {
      await handlePayWithRazorpay();
    }
  };

  const handleStartCheckout = () => {
    setShowCustomerForm(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-200 block">Your Cart</span>
                  <span className="text-[10px] text-slate-500">{getCartCount()} items</span>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {completedOrder ? (
                /* Order Success Confirmation View */
                <div className="py-6 space-y-4 text-center">
                  <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Payment Verified</span>
                    <h3 className="text-lg font-black text-slate-100 mt-1">Order Placed Successfully!</h3>
                    <p className="text-3xs text-slate-400 mt-1">SMS confirmation sent to customer phone.</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order ID:</span>
                      <span className="font-mono font-bold text-slate-200">{completedOrder.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-semibold text-slate-200">{completedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-semibold text-slate-200">{completedOrder.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Paid:</span>
                      <span className="font-extrabold text-blue-400">₹{completedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Status:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-4xs uppercase border border-emerald-800">
                        {completedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCompletedOrder(null);
                      closeCart();
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors shadow"
                  >
                    Done & Return to Builder
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                  <span className="text-sm font-semibold">Your cart is empty</span>
                  <span className="text-xs opacity-60 mt-1">Add products to get started</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex gap-4 group"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                        <p className="text-xs font-bold text-blue-400 mt-1">{item.price}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-300 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors self-start"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {!completedOrder && items.length > 0 && (
              <div className="border-t border-slate-800 px-6 py-5 space-y-3 shrink-0">
                {showCustomerForm ? (
                  /* Customer Details Input Modal before Razorpay */
                  <div className="space-y-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-left">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-850">
                      <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Customer Details</span>
                      <button onClick={() => setShowCustomerForm(false)} className="text-slate-500 hover:text-slate-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-4xs font-bold text-slate-400 uppercase">Customer Name</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-4xs font-bold text-slate-400 uppercase">Phone (for Twilio SMS)</label>
                      <div className="relative">
                        <Smartphone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-4xs font-bold text-slate-400 uppercase tracking-wider block">Payment Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`flex items-center gap-1.5 p-2 rounded-xl border text-slate-200 transition-all cursor-pointer text-4xs font-bold ${paymentMethod === 'RAZORPAY' ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'RAZORPAY'}
                            onChange={() => setPaymentMethod('RAZORPAY')}
                            className="accent-blue-500"
                          />
                          <span>Pay Online</span>
                        </label>
                        <label className={`flex items-center gap-1.5 p-2 rounded-xl border text-slate-200 transition-all cursor-pointer text-4xs font-bold ${paymentMethod === 'COD' ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800'}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'COD'}
                            onChange={() => setPaymentMethod('COD')}
                            className="accent-blue-500"
                          />
                          <span>Cash on Delivery</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-3xs text-slate-400 block uppercase">Total Payable</span>
                        <span className="text-base font-black text-slate-100">₹{getCartTotal()}</span>
                      </div>
                      <button
                        disabled={isProcessing}
                        onClick={handleCheckoutSubmit}
                        className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        {paymentMethod === 'COD' 
                          ? (isProcessing ? 'Placing Order...' : 'Place COD Order')
                          : (isProcessing ? 'Connecting Razorpay...' : 'Pay with Razorpay')}
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subtotal</span>
                      <span className="text-lg font-black text-slate-100">₹{getCartTotal()}</span>
                    </div>
                    <button
                      onClick={handleStartCheckout}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
