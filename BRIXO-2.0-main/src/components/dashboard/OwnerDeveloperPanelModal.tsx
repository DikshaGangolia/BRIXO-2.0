import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Code2, Layout, Database, Terminal, ShoppingBag, CreditCard, QrCode, BarChart3,
  Settings, ExternalLink, ShieldAlert, CheckCircle2, Play, RefreshCw, Copy, Download,
  Layers, FileCode, Check, Smartphone, User, Plus, Trash2, Edit3, Lock
} from 'lucide-react';
import axios from 'axios';

interface OwnerDeveloperPanelModalProps {
  siteId: string;
  onClose: () => void;
}

export const OwnerDeveloperPanelModal: React.FC<OwnerDeveloperPanelModalProps> = ({ siteId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'database' | 'apis' | 'orders' | 'payments' | 'qrcode' | 'analytics' | 'settings'>('frontend');
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [data, setData] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [apiTesting, setApiTesting] = useState<string | null>(null);
  const [apiTestResult, setApiTestResult] = useState<any | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Database CRUD state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('₹99.00');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchDeveloperData = async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/developer/website/${siteId}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setData(res.data);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setForbidden(true);
      } else {
        console.error("Developer panel fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/developer/website/${siteId}/database`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDbData(res.data.database);
      }
    } catch (err) {
      console.error("Database fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDeveloperData();
    fetchDatabaseData();
  }, [siteId]);

  const handleTestApi = async (endpoint: string, method: string) => {
    setApiTesting(endpoint);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/api/developer/website/${siteId}/api-test`,
        { endpoint, method, payload: { test: true } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApiTestResult(res.data);
    } catch (err: any) {
      setApiTestResult({ error: err.message });
    } finally {
      setApiTesting(null);
    }
  };

  const handleCopyUrl = () => {
    if (data?.project?.url) {
      navigator.clipboard.writeText(data.project.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Verifying Website Ownership & Initializing Developer Hub...</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-red-900/60 p-8 rounded-3xl max-w-md w-full text-center space-y-4 text-slate-100 shadow-2xl">
          <div className="w-16 h-16 bg-red-950/60 border border-red-800 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest block">Security Restriction</span>
            <h2 className="text-xl font-black text-slate-100 mt-1">403 Forbidden</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Access Denied. Only the authenticated owner of this published website is authorized to open developer tools.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    );
  }

  const proj = data?.project || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl text-slate-100 flex flex-col h-[90vh] overflow-hidden my-4"
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow shadow-blue-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-100">{proj.title || 'Published Website'}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-950 text-emerald-400 border border-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {proj.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                <span>{proj.url}</span>
                <button onClick={handleCopyUrl} className="hover:text-blue-400 transition-colors">
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={proj.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-3xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              Open Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Developer Hub Navigation Bar (11 Buttons) */}
        <div className="border-b border-slate-800 bg-slate-950/90 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'frontend', label: 'Frontend', icon: Layout },
            { id: 'backend', label: 'Backend', icon: Terminal },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'apis', label: 'APIs', icon: Code2 },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'qrcode', label: 'QR Code', icon: QrCode },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl font-bold text-3xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/40">
          {/* TAB 1: FRONTEND */}
          {activeTab === 'frontend' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pages & Structure</span>
                  <div className="space-y-1.5">
                    {(data?.frontend?.pages || []).map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-xs">
                        <span className="font-bold text-slate-200">{p.name}</span>
                        <span className="text-3xs text-slate-500 font-mono">{p.componentsCount} components</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Design Tokens & Theme</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl">
                      <span className="text-slate-400">Primary Color:</span>
                      <span className="font-mono font-bold" style={{ color: data?.frontend?.designTokens?.primaryColor }}>
                        {data?.frontend?.designTokens?.primaryColor || '#3b82f6'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl">
                      <span className="text-slate-400">Font Family:</span>
                      <span className="font-mono font-bold text-slate-200">{data?.frontend?.designTokens?.fontFamily || 'Inter'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl">
                      <span className="text-slate-400">Border Radius:</span>
                      <span className="font-mono font-bold text-slate-200">{data?.frontend?.designTokens?.borderRadius || 'rounded-xl'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assets & Layouts</span>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1 text-xs">
                    <p className="text-slate-300 font-semibold">• Industry: {data?.frontend?.industry}</p>
                    <p className="text-slate-400 text-3xs">• CleanBlockRenderer Active</p>
                    <p className="text-slate-400 text-3xs">• Dynamic HSL Palette Enabled</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKEND */}
          {activeTab === 'backend' && (
            <div className="space-y-6">
              <div className="bg-amber-950/30 border border-amber-900/40 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-300">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Website-Specific Backend Node. Platform core secrets (.env, Mongo URI, Razorpay/Twilio keys) are protected and sanitized.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">Registered Routes</span>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(data?.backend?.routes || []).map((r: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${r.method === 'GET' ? 'bg-blue-950 text-blue-400 border border-blue-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'}`}>
                            {r.method}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200">{r.path}</span>
                        </div>
                        <p className="text-3xs text-slate-400">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">Models & Controllers</span>
                  <div className="space-y-2">
                    {(data?.backend?.controllers || []).map((c: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="font-bold text-xs text-slate-200 block">{c.name}</span>
                        <span className="text-3xs text-slate-400">{c.responsibility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Website MongoDB Collections (Products & Orders)</span>
                <span className="text-3xs text-slate-500 font-mono">Isolated Site Workspace</span>
              </div>

              {/* Products Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-black text-slate-100">Products Collection</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(dbData?.products || []).map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs">
                      <div>
                        <span className="font-bold text-slate-200 block">{p.name}</span>
                        <span className="text-3xs text-slate-500">{p.desc}</span>
                      </div>
                      <span className="font-bold text-emerald-400">{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APIs EXPLORER */}
          {activeTab === 'apis' && (
            <div className="space-y-6">
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">Interactive API Explorer & Tester</span>
              <div className="space-y-4">
                {(data?.apis || []).map((api: any) => (
                  <div key={api.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${api.method === 'GET' ? 'bg-blue-950 text-blue-400 border border-blue-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'}`}>
                          {api.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-200">{api.endpoint}</span>
                      </div>

                      <button
                        disabled={apiTesting === api.endpoint}
                        onClick={() => handleTestApi(api.endpoint, api.method)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-3xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
                      >
                        <Play className={`w-3 h-3 ${apiTesting === api.endpoint ? 'animate-spin' : ''}`} />
                        {apiTesting === api.endpoint ? 'Testing...' : 'Test API'}
                      </button>
                    </div>

                    {apiTestResult && apiTestResult.endpoint === api.endpoint && (
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-3xs font-mono space-y-1 text-emerald-400">
                        <span className="text-slate-400 block">// Live Response Payload</span>
                        <pre className="overflow-x-auto">{JSON.stringify(apiTestResult, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">Customer Sales & Orders</span>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {(data?.orders || []).map((o: any) => (
                  <div key={o._id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <span className="font-mono font-bold text-blue-400">{o.orderId}</span>
                      <span className="font-black text-emerald-400">₹{o.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-3xs text-slate-400">
                      <span>Customer: {o.customerName} ({o.customerPhone})</span>
                      <span className="text-emerald-400 font-bold uppercase">{o.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">Razorpay Payment Logs</span>
              <div className="space-y-3">
                {(dbData?.payments || []).map((p: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-slate-300 font-bold block">Order: {p.orderId}</span>
                      <span className="text-3xs text-slate-500 font-mono">Pay ID: {p.razorpayPaymentId || 'N/A'}</span>
                    </div>
                    <span className="font-bold text-emerald-400">₹{p.amount?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">High-Resolution Printable QR Code</span>
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                {proj.qrCodeDataUrl ? (
                  <img src={proj.qrCodeDataUrl} alt="Website QR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">QR Code Preview</div>
                )}
              </div>
              <span className="text-3xs text-slate-400 font-mono">{proj.url}</span>
            </div>
          )}

          {/* TAB 8: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
                <span className="text-3xs text-slate-400 font-bold uppercase">Total Views</span>
                <p className="text-2xl font-black text-blue-400">{data?.analytics?.totalViews || 142}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
                <span className="text-3xs text-slate-400 font-bold uppercase">Orders</span>
                <p className="text-2xl font-black text-emerald-400">{data?.analytics?.totalOrders || 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
                <span className="text-3xs text-slate-400 font-bold uppercase">Revenue</span>
                <p className="text-2xl font-black text-emerald-400">₹{(data?.analytics?.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
                <span className="text-3xs text-slate-400 font-bold uppercase">Conversion</span>
                <p className="text-2xl font-black text-purple-400">{data?.analytics?.conversionRate || '0.0%'}</p>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 max-w-xl">
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">Website Developer Settings</span>
              <div className="space-y-2 text-xs">
                <label className="text-slate-400 block font-semibold">Website Title</label>
                <input type="text" value={proj.title || ''} readOnly className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 outline-none" />
              </div>
              <div className="space-y-2 text-xs">
                <label className="text-slate-400 block font-semibold">Published Slug</label>
                <input type="text" value={proj.slug || ''} readOnly className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 outline-none font-mono" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
