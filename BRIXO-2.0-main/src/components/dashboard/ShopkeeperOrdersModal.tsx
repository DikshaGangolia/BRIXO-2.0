import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Search, Phone, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  orderStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

interface ShopkeeperOrdersModalProps {
  onClose: () => void;
}

export const ShopkeeperOrdersModal: React.FC<ShopkeeperOrdersModalProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch shopkeeper orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE}/api/orders/status/${orderId}`, {
        orderStatus: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        fetchOrders();
      } else {
        alert("Failed to update status: " + res.data.message);
      }
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl text-slate-100 relative space-y-6 my-8"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest block">Shopkeeper Sales Dashboard</span>
              <h3 className="text-xl font-black text-slate-100">Customer Orders & Payments</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Refresh */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 text-slate-200"
            />
          </div>

          <button
            onClick={fetchOrders}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Orders
          </button>
        </div>

        {/* Orders Table / Cards */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Loading orders from MongoDB...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto opacity-20" />
            <p className="text-sm font-semibold">No customer orders recorded yet</p>
            <p className="text-xs opacity-60">Orders placed through published sites will appear here in real-time.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((order) => (
              <div
                key={order._id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-blue-400">{order.orderId}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-950 text-blue-400 border border-blue-900">
                        {order.paymentMethod || 'RAZORPAY'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase flex items-center gap-1 border ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                          : order.paymentStatus === 'FAILED'
                          ? 'bg-red-950 text-red-400 border-red-900'
                          : 'bg-amber-950 text-amber-400 border-amber-900'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {order.paymentStatus}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Amount</span>
                      <span className="text-lg font-black text-emerald-400">₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold mb-1">Order Status</span>
                      <select
                        value={order.orderStatus || 'Pending'}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1 text-3xs font-bold focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer Info */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Info</span>
                    <p className="font-bold text-slate-200">{order.customerName}</p>
                    <p className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-400" />
                      {order.customerPhone}
                    </p>
                    {order.razorpayPaymentId && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        Payment ID: {order.razorpayPaymentId}
                      </p>
                    )}
                  </div>

                  {/* Products List */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Purchased</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300 text-3xs">
                          <span className="truncate max-w-[180px] font-medium">• {item.name}</span>
                          <span className="font-semibold text-slate-400">
                            x{item.quantity} ({item.price.startsWith('₹') ? item.price : `₹${item.price}`})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
