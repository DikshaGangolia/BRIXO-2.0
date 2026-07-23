import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Sparkles,
  Trash2,
  CreditCard,
  Copy,
  Download,
  Edit3,
  LogOut,
  Search,
  Grid,
  ShoppingBag,
  Utensils,
  HeartPulse,
  Briefcase,
  User,
  GraduationCap,
  Dumbbell,
  Home as HomeIcon,
  ChevronRight,
  FolderOpen,
  BadgeCheck,
  Check,
  Crown,
  X,
  Menu,
  Code2,
  Zap
} from 'lucide-react';

import { useAuthStore } from '../../store/useAuthStore';
import { useBuilderStore } from '../../store/useBuilderStore';
import { getTemplatePreset } from '../../utils/templates';
import { exportSiteZip } from '../../utils/export';
import type { WebsiteProject } from '../../types/builder';
import { PaymentHistoryModal } from './PaymentHistoryModal';
import { ShopkeeperOrdersModal } from './ShopkeeperOrdersModal';
import { OwnerDeveloperPanelModal } from './OwnerDeveloperPanelModal';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://brixo-2-0.onrender.com';

export const Dashboard: React.FC = () => {
  const { session, projects, loadProjects, createProject, deleteProject, duplicateProject, logout } = useAuthStore();
  // const loadProject = useBuilderStore(state => state.loadProject);
  const loadProject = useBuilderStore(
  state => state.loadProject
);
  const navigate = useNavigate();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ category: string; name: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showShopkeeperOrders, setShowShopkeeperOrders] = useState(false);
  const [devPanelSiteId, setDevPanelSiteId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  // Filter templates list
  const categories = [
    { name: 'All', icon: <Grid className="w-3.5 h-3.5" /> },
    { name: 'Ecommerce', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { name: 'Restaurant', icon: <Utensils className="w-3.5 h-3.5" /> },
    { name: 'Healthcare', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { name: 'Business', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { name: 'Portfolio', icon: <User className="w-3.5 h-3.5" /> },
    { name: 'Education', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { name: 'Gym', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { name: 'Real Estate', icon: <HomeIcon className="w-3.5 h-3.5" /> }
  ];

  // Hardcoded template blueprints mapping
  const templatesList = [
    { category: 'Ecommerce', name: 'Fashion Store', desc: 'Luxury style apparel storefront.' },
    { category: 'Ecommerce', name: 'Electronics Store', desc: 'Sleek dark theme gadget listings.' },
    { category: 'Ecommerce', name: 'Grocery Store', desc: 'Fresh farm and organic delivery.' },
    { category: 'Restaurant', name: 'Fast Food', desc: 'Hot burgers and crispy fries.' },
    { category: 'Restaurant', name: 'Cafe', desc: 'Coffee roasters & pastry recipes.' },
    { category: 'Restaurant', name: 'Fine Dining', desc: 'Michelin star gourmet reservations.' },
    { category: 'Healthcare', name: 'Hospital', desc: 'Multi-specialty 24/7 emergency rooms.' },
    { category: 'Healthcare', name: 'Clinic', desc: 'General practitioner and family screening.' },
    { category: 'Healthcare', name: 'Dental', desc: 'Braces orthodontics & dental checkups.' },
    { category: 'Business', name: 'Agency', desc: 'Modern branding design & ROI scaling.' },
    { category: 'Business', name: 'Startup', desc: 'SaaS metrics telemetry platforms.' },
    { category: 'Business', name: 'Consulting', desc: 'Financial compliance operation maps.' },
    { category: 'Portfolio', name: 'Designer', desc: 'Glassmorphism Figma designs showroom.' },
    { category: 'Portfolio', name: 'Developer', desc: 'Command terminal projects grids.' },
    { category: 'Portfolio', name: 'Photographer', desc: 'Landscape, portrait, and photo sets.' },
    { category: 'Education', name: 'School', desc: 'Class schedules, coding labs and fields.' },
    { category: 'Education', name: 'Coaching', desc: 'Exam prep coaching study plans.' },
    { category: 'Education', name: 'Online Course', desc: 'Self-paced tech code courses.' },
    { category: 'Gym', name: 'Fitness Center', desc: 'Heavy weight zones and membership tiers.' },
    { category: 'Gym', name: 'Personal Trainer', desc: 'Diet supplement plans & body coaching.' },
    { category: 'Real Estate', name: 'Property Agency', desc: 'Exclusive penthouses and family villas.' }
  ];

  const filteredTemplates = templatesList.filter(t =>
    (activeCategory === 'All' || t.category === activeCategory) &&
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
  (p.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePayment = async (planType: 'pro' | 'max') => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          planType,
        }
      );

      if (!response.data || !response.data.success) {
        alert("Failed to create Razorpay order.");
        return;
      }

      const { order, key_id } = response.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: `BRIXO ${planType.toUpperCase()}`,
        description: `Unlock BRIXO ${planType.toUpperCase()} plan perks and visual templates`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/api/payment/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: session?.email,
                planType,
              }
            );

            if (verifyRes.data && verifyRes.data.success) {
              alert(`Congratulations! Plan upgraded successfully to ${planType.toUpperCase()}.`);
              const updatedSession = { ...session, plan: planType };
              localStorage.setItem('universal_builder_session', JSON.stringify(updatedSession));
              useAuthStore.setState({ session: updatedSession });
              setShowPlansModal(false);
            } else {
              alert("Verification failed: " + verifyRes.data.message);
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            alert("Payment verification failed: " + (err.response?.data?.message || err.message));
          }
        },
        prefill: {
          name: session?.name || "",
          email: session?.email,
        },
        theme: {
          color: planType === 'max' ? "#a855f7" : "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Payment initiation error:", err);
      alert("Failed to start payment process: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateWebsite = async () => {
    const siteName = newSiteName.trim();
    if (!siteName) {
      alert("Please enter a valid website name to launch the builder.");
      return;
    }

    const template = selectedTemplate || { category: 'Ecommerce', name: 'General Store' };
    const templateConfig = getTemplatePreset(template.category, siteName);

    try {
      // Try creating project on backend first
      let finalId = await createProject({
        id: '',
        name: siteName,
        category: template.category,
        templateName: template.name,
        config: templateConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Fallback if backend API call fails or returns empty string
      if (!finalId) {
        finalId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const localProject: WebsiteProject = {
          id: finalId,
          name: siteName,
          category: template.category,
          templateName: template.name,
          config: templateConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        useAuthStore.setState(state => ({
          projects: [localProject, ...state.projects]
        }));
      }

      // Retrieve full target project object
      const currentProjects = useAuthStore.getState().projects;
      const targetProject = currentProjects.find(p => p.id === finalId) || {
        id: finalId,
        name: siteName,
        category: template.category,
        templateName: template.name,
        config: templateConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Initialize Builder Store
      loadProject(targetProject);

      setShowCreateModal(false);
      setNewSiteName('');

      // Navigate to builder
      navigate(`/builder/${finalId}`);
    } catch (err: any) {
      console.error("Launch Builder Error:", err);
      alert("Failed to launch builder: " + (err?.message || "Unknown error"));
    }
  };


  const handleExport = async (project: WebsiteProject) => {
    try {
      const blob = await exportSiteZip(project);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_code.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Failed to generate export archive.');
    }
  };
  console.log("Projects:", projects);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-x-hidden">

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
className={`
fixed lg:static inset-y-0 left-0 z-50
w-72 bg-slate-900 border-r border-slate-800
transform transition-transform duration-300
${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
lg:translate-x-0
flex flex-col justify-between
overflow-y-auto
p-5
`}
>
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wider block bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">UNIVERSAL SaaS</span>
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Workspace Hub</span>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Navigation</span>
            <div className="space-y-1.5 text-xs font-bold text-slate-300">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl text-blue-400"
              >
                <FolderOpen className="w-4 h-4" />
                My Websites
              </button>
              <button
                onClick={() => {
                  setShowShopkeeperOrders(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 transition-all border border-slate-800 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                Customer Orders
              </button>
            </div>
          </div>
        </div>

        {/* Billing & User Session Profile widget */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center text-3xs font-bold uppercase text-slate-400">
              <span>Account Plan</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-wider font-extrabold uppercase ${
                session?.plan === 'max'
                  ? 'bg-purple-950 text-purple-400 border border-purple-900/60'
                  : session?.plan === 'pro'
                  ? 'bg-blue-950 text-blue-400 border border-blue-900/60'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {session?.plan === 'max' ? 'Max' : session?.plan === 'pro' ? 'Pro' : 'Normal'}
              </span>
            </div>

            {session?.plan !== 'max' ? (
              <button
                onClick={() => setShowPlansModal(true)}
                className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-[10px] font-bold rounded-lg text-white transition-all shadow-md shadow-blue-900/30 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                Upgrade Plan
              </button>
            ) : (
              <div className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-purple-400" />
                All Max features unlocked
              </div>
            )}
            <button
              onClick={() => setShowBillingHistory(true)}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-300 transition-all border border-slate-800 flex items-center justify-center gap-1 cursor-pointer mt-2"
            >
              <CreditCard className="w-3 h-3 text-blue-450" />
              Billing History
            </button>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {session?.name ? session?.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-200 block truncate">{session?.name || 'User Name'}</span>
              <span className="text-[9px] text-slate-500 block truncate">{session?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-3xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-all border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL */}
      {/* Mobile Overlay */}
{mobileMenuOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
    onClick={() => setMobileMenuOpen(false)}
  />
)}
      <main
className="
flex-1
w-full
min-w-0
overflow-y-auto
overflow-x-hidden
p-4
sm:p-6
lg:p-8
space-y-6
lg:space-y-8
">
      {/* Mobile Header */}
<div className="flex lg:hidden items-center justify-between mb-6">
  <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
  >
    <Menu className="w-6 h-6 text-white" />
  </button>

  <h1 className="text-lg font-bold">BRIXO</h1>

  <div className="w-10"></div>
</div>
        {/* Profile greetings */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Hello, {session?.name || 'User'}!</h2>
            <p className="text-xs text-slate-400">Create new templates or visual customize your existing website codes.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-center shadow-md w-full sm:w-auto">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Websites Created</span>
            <span className="text-xl font-black text-blue-400">{projects.length}</span>
          </div>
        </div>

        {/* Categories filters & search */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/40 p-4 border border-slate-850 rounded-2xl">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveCategory(c.name)}
                className={`px-3 py-1.5 rounded-xl text-3xs font-bold flex items-center gap-1.5 transition-all ${
                  activeCategory === c.name
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.icon}
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search assets/templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 text-slate-200 transition-colors"
            />
          </div>
        </div>

        {/* Section 1: User's websites list */}

        {filteredProjects.length > 0 && (
          <div className="space-y-4">
            <span className="text-3xs uppercase tracking-wider font-bold text-slate-500">My Website Projects</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h3 className="font-extrabold text-sm text-slate-200 truncate">{proj.name}</h3>
                      <span className="text-[9px] uppercase font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-950 border border-blue-900">{proj.category}</span>
                    </div>
                    <p className="text-4xs text-slate-500 uppercase font-semibold">Template Style: {proj.templateName}</p>
                    <p className="text-[10px] text-slate-400 mt-2">Last Edited: {new Date(proj.updatedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-t border-slate-800/50 pt-4 mt-6">
                    <button
                      onClick={() => {
                        loadProject(proj);
                        navigate(`/builder/${proj.id}`);
                      }}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-3xs font-bold rounded-lg text-white flex items-center justify-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      Visual Edit
                    </button>
                    <button
                      onClick={() => setDevPanelSiteId(proj.id)}
                      title="Open Owner Developer Panel"
                      className="py-1.5 px-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-3xs font-bold rounded-lg text-white flex items-center justify-center gap-1 transition-all shadow cursor-pointer"
                    >
                      <Code2 className="w-3 h-3" />
                      Dev Panel
                    </button>
                    <button
                      onClick={() => duplicateProject(proj.id)}
                      title="Duplicate Project"
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleExport(proj)}
                      title="Download Source Code ZIP"
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
  // Always use the project's stored id (which maps to backend _id)
  const projectId = proj.id;
  console.log("Deleting project ID:", projectId);
  deleteProject(projectId);
}}
                      title="Delete Project"
                      className="p-2 bg-slate-800/50 hover:bg-red-950/30 border border-transparent hover:border-red-900 rounded-lg text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Create a website from templates directory */}
        <div className="space-y-4">
          <span className="text-3xs uppercase tracking-wider font-bold text-slate-500">Pick Starter Template Presets ({filteredTemplates.length})</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredTemplates.map((t, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedTemplate(t);
                  setNewSiteName(`${t.name} Agency Website`);
                  setShowCreateModal(true);
                }}
                className="bg-slate-900/30 border border-slate-850 hover:border-blue-500/50 hover:bg-slate-900/60 rounded-2xl p-4 lg:p-5 flex flex-col justify-between transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-extrabold text-sm text-slate-300 group-hover:text-blue-400 transition-colors">{t.name}</h3>
                    <span className="text-[9px] uppercase font-semibold text-slate-500">{t.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                </div>

                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1 border-t border-slate-800/40 pt-4 mt-6">
                  Select Template
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* WEBSITE NAME PROMPT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl text-slate-100"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block">{(selectedTemplate?.category || 'General').toUpperCase()} PRESET</span>
                <h3 className="font-extrabold text-base text-slate-200">Initialize Visual Website</h3>
                <p className="text-3xs text-slate-400">Give your project a name to generate initial assets and compile the canvas.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Website Name</label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={e => setNewSiteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-3xs uppercase tracking-wider border border-slate-800 hover:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWebsite}
                  className="flex-1 py-2 text-3xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Launch Builder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPARATIVE PLANS & BENEFITS MODAL */}
      <AnimatePresence>
        {showPlansModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-4xl shadow-2xl text-slate-100 relative space-y-6 my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPlansModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-955/60 border border-blue-900 px-3 py-1 rounded-full">
                  Subscription Plans
                </span>
                <h2 className="text-2xl font-black bg-gradient-to-r from-white via-slate-250 to-slate-400 bg-clip-text text-transparent mt-3">
                  Upgrade Your BRIXO Experience
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose the perfect tier that matches your website design and production volume.
                </p>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

                {/* Normal Plan Card */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between relative hover:border-slate-800 transition-colors">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-350">Normal</h3>
                      <p className="text-4xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Starter Tier</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-200">₹0</span>
                      <span className="text-3xs text-slate-500 font-bold uppercase">/ Free</span>
                    </div>
                    <div className="border-t border-slate-850 my-2"></div>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Create up to <strong>1</strong> active website</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Basic visual design canvas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Standard starter templates</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900">
                    <button
                      disabled
                      className="w-full py-2 bg-slate-800/40 text-slate-500 font-extrabold text-3xs uppercase tracking-wider rounded-xl cursor-not-allowed border border-slate-800"
                    >
                      {(!session?.plan || session?.plan === 'normal' || session?.plan === 'free') ? 'Active Plan' : 'Free Tier'}
                    </button>
                  </div>
                </div>

                {/* Pro Plan Card */}
                <div className="bg-slate-950/60 border-2 border-blue-600/85 rounded-2xl p-6 flex flex-col justify-between relative hover:border-blue-500/80 transition-colors shadow-lg shadow-blue-900/10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow">
                    Most Popular
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-sm text-blue-400">Pro</h3>
                        <Crown className="w-4 h-4 text-blue-450" />
                      </div>
                      <p className="text-4xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Creator Tier</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-200">₹499</span>
                      <span className="text-3xs text-slate-500 font-bold uppercase">/ month</span>
                    </div>
                    <div className="border-t border-slate-850 my-2"></div>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>Create up to <strong>5</strong> active websites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>Full Premium presets & assets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span><strong>Download site ZIP</strong> export</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>Priority email support channels</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900">
                    {session?.plan === 'pro' ? (
                      <button
                        disabled
                        className="w-full py-2 bg-blue-950/40 text-blue-400 font-extrabold text-3xs uppercase tracking-wider rounded-xl cursor-not-allowed border border-blue-900"
                      >
                        Active Plan
                      </button>
                    ) : (session?.plan === 'max') ? (
                      <button
                        disabled
                        className="w-full py-2 bg-slate-800/40 text-slate-500 font-extrabold text-3xs uppercase tracking-wider rounded-xl cursor-not-allowed border border-slate-800"
                      >
                        Downgrade Not Allowed
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayment('pro')}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-3xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>

                {/* Max Plan Card */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between relative hover:border-purple-500/50 transition-colors">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-sm text-purple-450">Max</h3>
                        <Zap className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-4xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Enterprise VIP</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-200">₹999</span>
                      <span className="text-3xs text-slate-500 font-bold uppercase">/ month</span>
                    </div>
                    <div className="border-t border-slate-850 my-2"></div>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span><strong>Unlimited</strong> active websites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>Custom domains integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>Advanced layout algorithms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>24/7 dedicated support phone line</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900">
                    {session?.plan === 'max' ? (
                      <button
                        disabled
                        className="w-full py-2 bg-purple-950/40 text-purple-400 font-extrabold text-3xs uppercase tracking-wider rounded-xl cursor-not-allowed border border-purple-900"
                      >
                        Active Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayment('max')}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-3xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                      >
                        Upgrade to Max
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBillingHistory && (
          <PaymentHistoryModal onClose={() => setShowBillingHistory(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShopkeeperOrders && (
          <ShopkeeperOrdersModal onClose={() => setShowShopkeeperOrders(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {devPanelSiteId && (
          <OwnerDeveloperPanelModal siteId={devPanelSiteId} onClose={() => setDevPanelSiteId(null)} />
        )}
      </AnimatePresence>

    </div>
  );
};


