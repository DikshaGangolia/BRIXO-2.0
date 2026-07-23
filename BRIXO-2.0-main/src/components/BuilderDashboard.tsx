import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Layers,
  Palette,
  FileText,
  Sparkles,
  Download,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  FileCode,
  ShoppingBag
} from 'lucide-react';
import type { Industry, WebsiteConfig, WebsiteComponent, ComponentType, DeployState } from '../types';
import { parseAIPrompt, createInitialConfig, generateComponentData, generateLogoSvg } from '../utils/generatorEngine';
import { ComponentRenderer } from './previewTemplates';
import { exportProjectZip } from '../utils/exportBundle';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { PublishSuccessScreen } from './builder/PublishSuccessScreen';
import { OwnerDeveloperPanelModal } from './dashboard/OwnerDeveloperPanelModal';

export const BuilderDashboard: React.FC = () => {
  const { session, upgradeUserPlanLocally } = useAuthStore();
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);


  // --- STATE MANAGEMENT ---
  const [prompt, setPrompt] = useState('Create a modern grocery store website with organic food delivery and orange colors');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'prompt' | 'layout' | 'design' | 'content' | 'deploy'>('prompt');

  // Active Website Configuration
  const [projectId, setProjectId] = useState<string>('');
  const [config, setConfig] = useState<WebsiteConfig>(() =>
    createInitialConfig('E-commerce', 'CartCraft Groceries', {
      primaryColor: '#ea580c',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      backgroundColor: '#fafaf9',
      textColor: '#1c1917',
      fontFamily: 'font-sans',
      borderRadius: 'rounded-xl',
      glassmorphism: true
    })
  );

  // Active editor states
  const [activePageId, setActivePageId] = useState<string>('home');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Cart Simulation for Preview
  const [previewCart, setPreviewCart] = useState<string[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Deploy simulation state
  const [deployState, setDeployState] = useState<DeployState>({
    isDeploying: false,
    progress: 0,
    logs: [],
    url: null,
    targetPlatform: null
  });

  // Billing Tier
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'agency'>('pro');

  // --- HANDLERS & SIMULATIONS ---

  // AI Prompt Parsing
  const handleAIGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationLogs([]);
    setSelectedComponentId(null);

    const logSteps = [
      '🔍 Analyzing prompt structure...',
      '🧬 Extracting industry classification & business name...',
      '🎨 Synthesizing color system and theme attributes...',
      '✍️ Writing marketing copy & About Us summaries...',
      '📦 Creating Home, About, Services, Products, Blog, and Contact layers...',
      '🚀 Injecting responsive layouts & SVGs logos...',
      '✨ Website successfully compiled!'
    ];

    for (let i = 0; i < logSteps.length; i++) {
      setGenerationLogs(prev => [...prev, logSteps[i]]);
      await new Promise(r => setTimeout(r, 600));
    }

    const { industry, businessName, theme } = parseAIPrompt(prompt);
    const newConfig = createInitialConfig(industry, businessName, theme);

    setConfig(newConfig);
    setIsGenerating(false);
    setActiveTab('layout');
  };

  // Reorder Layout Components
  const moveComponent = (direction: 'up' | 'down', index: number) => {
    const page = config.pages[activePageId];
    if (!page) return;

    const newComponents = [...page.components];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newComponents.length) return;

    // Swap
    const temp = newComponents[index];
    newComponents[index] = newComponents[targetIdx];
    newComponents[targetIdx] = temp;

    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [activePageId]: {
          ...page,
          components: newComponents
        }
      }
    }));
  };

  // Delete Component
  const deleteComponent = (index: number) => {
    const page = config.pages[activePageId];
    if (!page) return;

    const compToDelete = page.components[index];
    if (compToDelete.id === selectedComponentId) {
      setSelectedComponentId(null);
    }

    const newComponents = page.components.filter((_, idx) => idx !== index);
    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [activePageId]: {
          ...page,
          components: newComponents
        }
      }
    }));
  };

  // Add Component Dialog helper
  const addComponent = (type: ComponentType) => {
    const page = config.pages[activePageId];
    if (!page) return;

    const newComp = generateComponentData(type, config.industry, config.businessName, config.theme);

    // Insert before footer if footer exists, else append
    const footerIdx = page.components.findIndex(c => c.type === 'Footer');
    const newComponents = [...page.components];

    if (footerIdx !== -1) {
      newComponents.splice(footerIdx, 0, newComp);
    } else {
      newComponents.push(newComp);
    }

    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [activePageId]: {
          ...page,
          components: newComponents
        }
      }
    }));

    setSelectedComponentId(newComp.id);
  };

  // Update specific field values
  const updateField = (componentId: string, fieldId: string, value: any) => {
    const page = config.pages[activePageId];
    if (!page) return;

    const newComponents = page.components.map(comp => {
      if (comp.id !== componentId) return comp;
      return {
        ...comp,
        fields: {
          ...comp.fields,
          [fieldId]: {
            ...comp.fields[fieldId],
            value
          }
        }
      };
    });

    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [activePageId]: {
          ...page,
          components: newComponents
        }
      }
    }));
  };

  // AI Design Theme Generator (Sub-prompt)
  const handleAIThemeGenerate = (promptText: string) => {
    const { theme } = parseAIPrompt(promptText);
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...theme
      }
    }));
  };

  // AI Content Generator (Simulate text copy)
  const handleAIContentRegen = (comp: WebsiteComponent) => {
    const freshData = generateComponentData(comp.type, config.industry, config.businessName, config.theme);

    // Overwrite the texts
    setConfig(prev => {
      const page = prev.pages[activePageId];
      const newComponents = page.components.map(c => {
        if (c.id !== comp.id) return c;
        // merge fields but keep identifiers
        const mergedFields = { ...c.fields };
        Object.keys(freshData.fields).forEach(fKey => {
          if (c.fields[fKey]) {
            mergedFields[fKey] = {
              ...c.fields[fKey],
              value: freshData.fields[fKey].value
            };
          }
        });
        return {
          ...c,
          fields: mergedFields
        };
      });

      return {
        ...prev,
        pages: {
          ...prev.pages,
          [activePageId]: {
            ...page,
            components: newComponents
          }
        }
      };
    });
  };

  // Edit Business Name & Update Logo SVG
  const handleBusinessNameChange = (name: string) => {
    setConfig(prev => {
      const newLogo = generateLogoSvg(name, prev.industry, prev.theme.primaryColor);
      return {
        ...prev,
        businessName: name,
        logoSvg: newLogo
      };
    });
  };

  // ZIP Exporter Trigger
  const triggerZIPExport = async () => {
    try {
      const blob = await exportProjectZip(config);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.businessName.toLowerCase().replace(/\s+/g, '_')}_website.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("ZIP Export encountered an issue.");
    }
  };

  const handleRazorpayPayment = async (platform: 'Vercel' | 'Netlify' | 'GitHub Pages') => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://brixo-2-0.onrender.com';
      const orderRes = await axios.post(`${API_BASE}/api/payment/create-order`, {
        planType: 'pro'
      });

      if (!orderRes.data || !orderRes.data.success) {
        alert("Failed to create Razorpay order.");
        return;
      }

      const { order, key_id } = orderRes.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "BRIXO Premium Publishing",
        description: "Unlock one-click publishing and host your site live",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post(`${API_BASE}/api/payment/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: session?.email,
              planType: 'pro'
            });

            if (verifyRes.data && verifyRes.data.success) {
              upgradeUserPlanLocally('pro');
              alert("Payment successful! Premium plan activated.");
              triggerDeploy(platform);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: session?.name || "",
          email: session?.email || "",
        },
        theme: {
          color: "#3b82f6"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();

    } catch (err) {
      console.error("Payment setup failed:", err);
      alert("Failed to initialize payment gateway.");
    }
  };

  // One Click Deploy - Real publish via backend API
  const triggerDeploy = async (platform: 'Vercel' | 'Netlify' | 'GitHub Pages') => {
    // Check premium status
    const isPremium = ['pro', 'max', 'premium'].includes(session?.plan || '');
    if (!isPremium) {
      const proceed = window.confirm("Publish Lock: A premium subscription plan is required to publish websites. Upgrade with Razorpay now?");
      if (proceed) {
        handleRazorpayPayment(platform);
      }
      return;
    }

    setDeployState({
      isDeploying: true,
      progress: 0,
      logs: [],
      url: null,
      targetPlatform: platform
    });

    const deploySteps = [
      `🌐 Initiating build connection on ${platform} servers...`,
      `📦 Bundling pages: Home, About, Services, Products, Blog, Contact...`,
      `⚙️ Compiling Tailwind utility directives & styles...`,
      `🩺 Running optimization audit & type checks...`,
      `📡 Synchronizing static file blobs to Edge CDN network...`,
      `🔒 Allocating SSL certificate keypairs...`,
      `🔗 Custom routing nodes generated!`
    ];

    for (let i = 0; i < deploySteps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setDeployState(prev => ({
        ...prev,
        progress: Math.floor(((i + 1) / deploySteps.length) * 100),
        logs: [...prev.logs, deploySteps[i]]
      }));
    }

    try {
      // Call real publish API
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'https://brixo-2-0.onrender.com';
      const pid = projectId || config.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const response = await fetch(`${API_BASE}/api/projects/publish/${pid}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        const publishedUrl = data.publishUrl || `${window.location.origin}/site/${data.slug || pid}`;
        setDeployState(prev => ({
          ...prev,
          isDeploying: false,
          url: publishedUrl,
          slug: data.slug || pid,
          qrCodeDataUrl: data.qrCodeDataUrl,
          qrCodeSvg: data.qrCodeSvg
        }));
        setShowSuccessScreen(true);
      } else {

        // Fallback: show preview URL
        setDeployState(prev => ({
          ...prev,
          isDeploying: false,
          url: `https://brixo-builder.vercel.app/preview/${pid}`
        }));
      }
    } catch (err) {
      console.error('Deploy failed:', err);
      setDeployState(prev => ({
        ...prev,
        isDeploying: false,
        url: `https://brixo-builder.vercel.app/preview/${config.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      }));
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">

      {/* --- DASHBOARD HEADER --- */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">VANGUARD BUILDER</h1>
            <p className="text-3xs text-slate-400">AI-Powered Website Creation System</p>
          </div>
        </div>

        {/* Workspace controls */}
        <div className="flex items-center gap-4">

          {/* Industry Preset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-3xs font-semibold text-slate-400 uppercase">Industry:</span>
            <select
              value={config.industry}
              onChange={(e) => {
                const ind = e.target.value as Industry;
                const baseColors = parseAIPrompt(`Create a website for ${ind}`);
                setConfig(createInitialConfig(ind, config.businessName, baseColors.theme));
              }}
              className="text-xs bg-transparent border-none text-blue-400 focus:ring-0 cursor-pointer font-bold outline-none"
            >
              {Object.keys(parseAIPrompt('')) && [
                'E-commerce', 'Restaurant', 'Healthcare', 'School', 'Gym',
                'Real Estate', 'Portfolio', 'Blog', 'Travel', 'Salon', 'NGO', 'Agency'
              ].map(indName => (
                <option key={indName} value={indName} className="bg-slate-900 text-slate-100">{indName}</option>
              ))}
            </select>
          </div>

          {/* SaaS Plan Tier Widget */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/40 rounded-lg p-0.5 border border-slate-700/50">
            {['free', 'pro', 'agency'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier as any)}
                className={`px-2.5 py-1 rounded text-3xs font-bold uppercase transition-all ${
                  selectedTier === tier
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Quick Action Deploy/Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={triggerZIPExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs rounded-lg font-bold transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export Code
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/10 text-xs rounded-lg font-bold transition-all active:scale-95 text-white"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* --- DASHBOARD GRID --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-69px)]">

        {/* --- LEFT SIDEBAR: CONTROL CENTER (5 cols) --- */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden h-full">

          {/* Dashboard Tab Selector */}
          <div className="grid grid-cols-5 border-b border-slate-800 text-slate-400 text-xs shrink-0 select-none">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 font-bold transition-colors ${
                activeTab === 'prompt' ? 'border-blue-500 text-blue-400 bg-slate-950/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              AI Prompt
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 font-bold transition-colors ${
                activeTab === 'layout' ? 'border-blue-500 text-blue-400 bg-slate-950/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Layout
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 font-bold transition-colors ${
                activeTab === 'design' ? 'border-blue-500 text-blue-400 bg-slate-950/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              Design
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 font-bold transition-colors ${
                activeTab === 'content' ? 'border-blue-500 text-blue-400 bg-slate-950/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 font-bold transition-colors ${
                activeTab === 'deploy' ? 'border-blue-500 text-blue-400 bg-slate-950/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              Deploy
            </button>
          </div>

          {/* Tab Workspaces */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* TABS CONTAINER */}
            <AnimatePresence mode="wait">

              {/* TAB 1: AI PROMPT */}
              {activeTab === 'prompt' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-blue-400" />
                      Describe Your Website
                    </h3>
                    <p className="text-3xs text-slate-400 leading-relaxed">
                      Type your requirements in details. Mention theme colors, page sections, business specialties, and naming constraints.
                    </p>
                  </div>

                  <form onSubmit={handleAIGenerate} className="space-y-3">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      placeholder="e.g. Create a minimal portfolio website for a landscape photographer named StudioAura with dark templates and gold highlights."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none leading-relaxed"
                    />

                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 text-white"
                    >
                      {isGenerating ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {isGenerating ? 'AI Engine Executing...' : 'Generate AI Website'}
                    </button>
                  </form>

                  {/* Log console */}
                  {generationLogs.length > 0 && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10px] text-slate-400 space-y-1.5 max-h-[200px] overflow-y-auto">
                      <div className="text-blue-500 border-b border-slate-900 pb-1 flex justify-between items-center">
                        <span>AI LOGGER CONSOLE</span>
                        <span className="animate-ping w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      {generationLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-1.5 items-start">
                          <span className="text-slate-600 shrink-0">[{idx+1}]</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prompts Preset lists */}
                  <div className="space-y-2">
                    <span className="text-3xs uppercase tracking-wider font-bold text-slate-500">Prompt Presets</span>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { text: 'Grocery website with delivery, green farm colors, name "NatureHarvest"', ind: 'E-commerce' },
                        { text: 'A dark premium fitness gym site called "TitanForce" with pricing lists', ind: 'Gym' },
                        { text: 'Blue professional clinic app named "CareMed" with appointment booking', ind: 'Healthcare' },
                        { text: 'Creative branding agency "Zephyr Digital" using purple aesthetics', ind: 'Agency' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPrompt(item.text);
                            const parsed = parseAIPrompt(item.text);
                            setConfig(createInitialConfig(parsed.industry, parsed.businessName, parsed.theme));
                          }}
                          className="p-2.5 text-left bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 rounded-xl text-3xs text-slate-300 transition-all flex justify-between items-center"
                        >
                          <span className="truncate pr-2">"{item.text}"</span>
                          <span className="text-blue-400 font-semibold text-[9px] uppercase shrink-0 bg-blue-950 border border-blue-900 px-1 rounded">{item.ind}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PAGES & LAYOUT EDITOR */}
              {activeTab === 'layout' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 mb-1">Layout Architect</h3>
                      <p className="text-3xs text-slate-400">Reorder, configure, and customize site components.</p>
                    </div>

                    {/* Active preview page switch */}
                    <select
                      value={activePageId}
                      onChange={(e) => {
                        setActivePageId(e.target.value);
                        setSelectedComponentId(null);
                      }}
                      className="text-xs bg-slate-950 border border-slate-800 text-blue-400 font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
                    >
                      {Object.values(config.pages).map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Components stack editor */}
                  <div className="space-y-2">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Active Page Structure</span>
                    <div className="space-y-2">
                      {config.pages[activePageId]?.components.map((comp, idx) => {
                        const isSelected = selectedComponentId === comp.id;
                        return (
                          <div
                            key={comp.id}
                            onClick={() => setSelectedComponentId(comp.id)}
                            className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-950/20 border-blue-500 shadow'
                                : 'bg-slate-800/40 border-slate-850 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-xs">
                              <div className="p-1 bg-slate-900 border border-slate-800 rounded">
                                <Layers className="w-3.5 h-3.5 text-blue-400" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-200">{comp.type}</span>
                                <p className="text-4xs text-slate-500 uppercase font-semibold">Block #{idx+1}</p>
                              </div>
                            </div>

                            {/* Actions layout reorder/delete */}
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => moveComponent('up', idx)}
                                disabled={idx === 0}
                                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveComponent('down', idx)}
                                disabled={idx === (config.pages[activePageId]?.components.length - 1)}
                                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteComponent(idx)}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add component widgets */}
                  <div className="space-y-2">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Insert Components</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Hero', 'Cards', 'Products', 'Forms', 'Testimonials', 'Pricing'] as ComponentType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => addComponent(type)}
                          className="flex items-center justify-between p-2 bg-slate-950 border border-slate-850 hover:bg-slate-900/60 rounded-xl text-3xs text-left text-slate-300 font-semibold transition-all group"
                        >
                          <span>+ {type}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editing panel drawer */}
                  {selectedComponentId && (
                    <div className="border border-blue-900/60 bg-blue-950/10 rounded-xl p-4 space-y-4">
                      <div className="flex justify-between items-center border-b border-blue-900/40 pb-2">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                          <Wand2 className="w-3.5 h-3.5" />
                          Modify Parameters
                        </span>
                        <button
                          onClick={() => setSelectedComponentId(null)}
                          className="text-4xs uppercase tracking-wider text-slate-500 hover:text-slate-300 font-bold"
                        >
                          Close
                        </button>
                      </div>

                      {/* Component Field inputs */}
                      {(() => {
                        const targetPage = config.pages[activePageId];
                        const comp = targetPage?.components.find(c => c.id === selectedComponentId);
                        if (!comp) return null;

                        return (
                          <div className="space-y-3.5">
                            {Object.values(comp.fields).map((f) => (
                              <div key={f.id} className="space-y-1.5">
                                <label className="block text-3xs uppercase tracking-wider text-slate-400 font-bold">{f.label}</label>
                                {f.type === 'text' && (
                                  <input
                                    type="text"
                                    value={f.value}
                                    onChange={(e) => updateField(comp.id, f.id, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                                  />
                                )}
                                {f.type === 'textarea' && (
                                  <textarea
                                    value={f.value}
                                    rows={3}
                                    onChange={(e) => updateField(comp.id, f.id, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-blue-500 resize-none leading-relaxed"
                                  />
                                )}
                                {f.type === 'image' && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={f.value}
                                      onChange={(e) => updateField(comp.id, f.id, e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                                    />
                                    <div className="grid grid-cols-3 gap-1.5">
                                      {[
                                        { title: 'Store', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
                                        { title: 'Clinic', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80' },
                                        { title: 'Gourmet', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80' }
                                      ].map((imgItem, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => updateField(comp.id, f.id, imgItem.url)}
                                          className="text-[8px] bg-slate-800 hover:bg-slate-700 py-1 rounded truncate border border-slate-750 px-1 font-semibold"
                                        >
                                          {imgItem.title} Image
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {f.type === 'list' && (
                                  <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-4xs uppercase tracking-wider text-slate-500 text-center font-bold">
                                    ✏️ Customize list items in the code view or edit them below.
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* Action content generator */}
                            <button
                              onClick={() => handleAIContentRegen(comp)}
                              className="w-full py-1.5 rounded-lg bg-indigo-900/30 border border-indigo-700 hover:bg-indigo-900/50 text-[10px] font-bold text-indigo-300 flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <Wand2 className="w-3 h-3 text-indigo-400" />
                              Regenerate Section Copy (AI)
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </motion.div>
              )}

              {/* TAB 3: DESIGN & COLORS */}
              {activeTab === 'design' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-blue-400" />
                      AI Design & Style Palette
                    </h3>
                    <p className="text-3xs text-slate-400">
                      Instantly change styling rules. Type descriptive styling words or adjust raw palettes manually.
                    </p>
                  </div>

                  {/* Style Prompt */}
                  <div className="space-y-2">
                    <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">AI Stylist Prompt</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="design-prompt-input"
                        placeholder="e.g. Emerald green luxury theme with serif text style"
                        defaultValue="Teal professional medical theme"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const inp = document.getElementById('design-prompt-input') as HTMLInputElement;
                          if (inp && inp.value) handleAIThemeGenerate(inp.value);
                        }}
                        className="px-3 bg-blue-600 hover:bg-blue-500 text-xs rounded-lg font-bold flex items-center justify-center shrink-0"
                      >
                        Style
                      </button>
                    </div>
                  </div>

                  {/* Manual Palette Adjusters */}
                  <div className="space-y-4 border-t border-slate-800 pt-4">
                    <span className="text-3xs uppercase tracking-wider font-bold text-slate-500">Manual Palette Controls</span>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="block text-4xs uppercase tracking-wider text-slate-400 font-bold">Primary Color</label>
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={config.theme.primaryColor}
                            onChange={(e) => setConfig(p => ({ ...p, theme: { ...p.theme, primaryColor: e.target.value } }))}
                            className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-4xs font-mono">{config.theme.primaryColor}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-4xs uppercase tracking-wider text-slate-400 font-bold">Secondary Color</label>
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={config.theme.secondaryColor}
                            onChange={(e) => setConfig(p => ({ ...p, theme: { ...p.theme, secondaryColor: e.target.value } }))}
                            className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-4xs font-mono">{config.theme.secondaryColor}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-4xs uppercase tracking-wider text-slate-400 font-bold">Accent Highlight</label>
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={config.theme.accentColor}
                            onChange={(e) => setConfig(p => ({ ...p, theme: { ...p.theme, accentColor: e.target.value } }))}
                            className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-4xs font-mono">{config.theme.accentColor}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-4xs uppercase tracking-wider text-slate-400 font-bold">Background</label>
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-lg p-1.5">
                          <input
                            type="color"
                            value={config.theme.backgroundColor}
                            onChange={(e) => setConfig(p => ({ ...p, theme: { ...p.theme, backgroundColor: e.target.value } }))}
                            className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-4xs font-mono">{config.theme.backgroundColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="space-y-2">
                      <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Typography Family</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'font-sans', label: 'Inter (Sans)' },
                          { id: 'font-serif', label: 'Playfair (Serif)' },
                          { id: 'font-mono', label: 'Fira (Mono)' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setConfig(p => ({ ...p, theme: { ...p.theme, fontFamily: item.id } }))}
                            className={`py-2 rounded-lg text-3xs font-bold transition-all border ${
                              config.theme.fontFamily === item.id
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spacing & Borders */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Corner Radius</label>
                        <select
                          value={config.theme.borderRadius}
                          onChange={(e) => setConfig(p => ({ ...p, theme: { ...p.theme, borderRadius: e.target.value } }))}
                          className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg p-2 text-slate-200 outline-none"
                        >
                          <option value="rounded-none">Sharp Corners</option>
                          <option value="rounded-md">Slightly Curved</option>
                          <option value="rounded-xl">Standard Curvature</option>
                          <option value="rounded-2xl">Highly Pillowed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Effects</label>
                        <button
                          onClick={() => setConfig(p => ({ ...p, theme: { ...p.theme, glassmorphism: !p.theme.glassmorphism } }))}
                          className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-all ${
                            config.theme.glassmorphism
                              ? 'bg-gradient-to-tr from-blue-950 to-indigo-950 border-blue-500 text-blue-300 shadow'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {config.theme.glassmorphism ? '✨ Glassmorphism On' : 'Glassmorphism Off'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: CONTENT & LOGO */}
              {activeTab === 'content' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Content & Branding Generator
                    </h3>
                    <p className="text-3xs text-slate-400 leading-relaxed">
                      Rebuild company identity details. Change business name, generate custom SVGs logo shapes and marketing content copy parameters.
                    </p>
                  </div>

                  {/* Business Name edit */}
                  <div className="space-y-2">
                    <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Business Name</label>
                    <input
                      type="text"
                      value={config.businessName}
                      onChange={(e) => handleBusinessNameChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Logo Preview */}
                  <div className="space-y-2">
                    <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Generated AI Brand Logo</label>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-center gap-4">
                      <div
                        dangerouslySetInnerHTML={{ __html: config.logoSvg }}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-300 block">{config.businessName} Logo</span>
                        <span className="text-[10px] text-emerald-500 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          SVG RENDER COMPLETED
                        </span>
                        <button
                          onClick={() => {
                            const newSvg = generateLogoSvg(config.businessName, config.industry, config.theme.primaryColor);
                            setConfig(p => ({ ...p, logoSvg: newSvg }));
                          }}
                          className="text-4xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider mt-2 block"
                        >
                          Regenerate Logo Shape
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Content Presets triggers */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <span className="text-3xs uppercase tracking-wider font-bold text-slate-500">Bulk Content Actions</span>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          alert("All services and card titles synchronized with the active industry content presets!");
                        }}
                        className="w-full p-3 text-left bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs flex justify-between items-center transition-all"
                      >
                        <div>
                          <span className="font-bold text-slate-300 block">Autogenerate FAQ & About Pages Copy</span>
                          <span className="text-4xs text-slate-500">Injects custom textual paragraphs aligned to business parameters.</span>
                        </div>
                        <Wand2 className="w-4 h-4 text-blue-500" />
                      </button>

                      <button
                        onClick={() => {
                          alert("All visual layout assets synchronized with creative unsplash collection keys!");
                        }}
                        className="w-full p-3 text-left bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs flex justify-between items-center transition-all"
                      >
                        <div>
                          <span className="font-bold text-slate-300 block">Synchronize Marketing Hero Images</span>
                          <span className="text-4xs text-slate-500">Selects matching graphical visual placeholders for the active industry.</span>
                        </div>
                        <Wand2 className="w-4 h-4 text-blue-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: DEPLOY CENTER */}
              {activeTab === 'deploy' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-400" />
                      One Click Deploy & Export
                    </h3>
                    <p className="text-3xs text-slate-400">
                      Publish your website instantly to Vercel, Netlify or GitHub Pages, or download standard source code archives.
                    </p>
                  </div>

                  {/* Deploy Action options */}
                  <div className="space-y-2.5">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Host Platforms</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Vercel', color: 'hover:border-black hover:bg-black/10' },
                        { name: 'Netlify', color: 'hover:border-cyan-600 hover:bg-cyan-950/20' },
                        { name: 'GitHub Pages', color: 'hover:border-slate-400 hover:bg-slate-800/40' }
                      ].map((item) => (
                        <button
                          key={item.name}
                          onClick={() => triggerDeploy(item.name as any)}
                          disabled={deployState.isDeploying}
                          className={`p-3 bg-slate-950 border border-slate-850 rounded-xl text-3xs text-slate-300 font-bold transition-all flex flex-col items-center justify-center gap-1.5 disabled:opacity-40 select-none ${item.color}`}
                        >
                          <Globe className="w-4 h-4 text-blue-500" />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deploy status logger panel */}
                  {deployState.isDeploying && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-[10px]">
                      <div className="flex justify-between items-center text-blue-400">
                        <span>Deploying to {deployState.targetPlatform}...</span>
                        <span>{deployState.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full transition-all duration-300"
                          style={{ width: `${deployState.progress}%` }}
                        ></div>
                      </div>
                      <div className="space-y-1 text-slate-500 text-4xs max-h-[120px] overflow-y-auto pt-2 border-t border-slate-900">
                        {deployState.logs.map((log, idx) => (
                          <div key={idx} className="flex gap-1">
                            <span className="text-slate-700">&gt;&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deployed Result Link Dialog */}
                  {deployState.url && (
                    <div className="bg-gradient-to-tr from-emerald-950/30 to-slate-950 border border-emerald-500/30 p-4.5 rounded-xl space-y-3.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-400 block">Deploy Success!</span>
                          <span className="text-4xs text-slate-400">Your live production container is running at:</span>
                        </div>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg flex items-center justify-between text-2xs">
                        <span className="font-mono text-blue-400 truncate pr-2">{deployState.url}</span>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Simulating Standalone Launch of: ${deployState.url}`);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-bold shrink-0 flex items-center gap-0.5"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Export Options */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-800">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Source Exports</span>
                    <button
                      onClick={triggerZIPExport}
                      className="w-full p-4 bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-750 rounded-xl text-left flex justify-between items-center transition-all active:scale-99"
                    >
                      <div className="flex gap-2.5 items-center">
                        <div className="p-2 bg-blue-950 text-blue-400 rounded-lg">
                          <FileCode className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-300 block">Export Source ZIP Bundle</span>
                          <span className="text-4xs text-slate-500">Contains ready React templates, HTML, Tailwind structure configs.</span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: LIVE INTERACTIVE PREVIEW (8 cols) --- */}
        <div className="lg:col-span-8 bg-slate-950 flex flex-col overflow-hidden h-full">

          {/* Preview Navigation control strip */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/40 backdrop-blur flex justify-between items-center select-none shrink-0">

            {/* Viewport size toggles */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'desktop', label: <><Monitor className="w-3.5 h-3.5" /> Desktop</> },
                { id: 'tablet', label: <><Tablet className="w-3.5 h-3.5" /> Tablet</> },
                { id: 'mobile', label: <><Smartphone className="w-3.5 h-3.5" /> Mobile</> }
              ].map((vp) => (
                <button
                  key={vp.id}
                  onClick={() => setViewportMode(vp.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-3xs font-bold flex items-center gap-1.5 transition-all ${
                    viewportMode === vp.id
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {vp.label}
                </button>
              ))}
            </div>

            {/* Active Preview Page Indicator */}
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400">Live Preview:</span>
              <span className="text-2xs font-extrabold text-blue-400 capitalize">{config.pages[activePageId]?.name}</span>
            </div>

            {/* Simulated Shopping Basket Preview badge */}
            {previewCart.length > 0 && (
              <button
                onClick={() => setShowCartModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950 border border-emerald-900 text-emerald-400 rounded-lg text-3xs font-bold hover:bg-emerald-900/50 transition-all"
              >
                <ShoppingBag className="w-3 h-3 animate-bounce" />
                Basket ({previewCart.length})
              </button>
            )}
          </div>

          {/* Screen area container */}
          <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto">

            {/* Viewport device wrapper */}
            <div
              className={`bg-white text-slate-900 transition-all duration-300 shadow-2xl relative select-none ${
                viewportMode === 'desktop' ? 'w-full h-full border border-slate-800' :
                viewportMode === 'tablet' ? 'w-[768px] h-[90%] border-4 border-slate-800 rounded-2xl' :
                'w-[375px] h-[85%] border-8 border-slate-800 rounded-3xl'
              } overflow-y-auto`}
              style={{ backgroundColor: config.theme.backgroundColor }}
            >

              {/* Dynamic Pages render stack */}
              {(() => {
                const activePage = config.pages[activePageId];
                if (!activePage) return <div className="p-8 text-center text-slate-400 text-xs">Blank page. Select or add layouts.</div>;

                return (
                  <div className="flex flex-col min-h-full">
                    {activePage.components.map((comp) => (
                      <ComponentRenderer
                        key={comp.id}
                        component={comp}
                        theme={config.theme}
                        activePageId={activePageId}
                        onNavigate={(pId) => {
                          const targetPage = config.pages[pId];
                          if (targetPage) {
                            setActivePageId(pId);
                          }
                        }}
                        onAddToCart={(pName) => {
                          setPreviewCart(prev => [...prev, pName]);
                        }}
                        isSelected={selectedComponentId === comp.id}
                        onClick={() => setSelectedComponentId(comp.id)}
                      />
                    ))}
                  </div>
                );
              })()}

            </div>

          </div>

        </div>

      </div>

      {/* --- CART SIMULATOR MODAL --- */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-200">🛒 Simulated Shopping Cart</span>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-xs text-slate-500 hover:text-slate-350 uppercase tracking-wider font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {previewCart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-850 text-xs">
                  <span className="font-medium text-slate-300">{item}</span>
                  <span className="text-[10px] text-slate-500">Qty: 1</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center font-bold text-xs text-slate-200">
              <span>Total Simulated items:</span>
              <span className="text-blue-400">{previewCart.length}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPreviewCart([])}
                className="flex-1 py-2 text-3xs uppercase tracking-wider border border-slate-800 hover:bg-slate-800 font-bold rounded-lg"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  alert("Order checkout simulated successfully!");
                  setPreviewCart([]);
                  setShowCartModal(false);
                }}
                className="flex-1 py-2 text-3xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessScreen && deployState.url && (

        <PublishSuccessScreen
          url={deployState.url}
          projectName={config.businessName}
          slug={deployState.slug || 'site'}
          qrCodeDataUrl={deployState.qrCodeDataUrl}
          qrCodeSvg={deployState.qrCodeSvg}
          projectId={projectId}
          onOpenDeveloperPanel={() => {
            setShowSuccessScreen(false);
            setShowDevPanel(true);
          }}
          onClose={() => setShowSuccessScreen(false)}
          onRepublish={() => triggerDeploy(deployState.targetPlatform || 'Vercel')}
          onUnpublish={async () => {
            if (projectId) {
              try {
                await useAuthStore.getState().unpublishProject(projectId);
                setShowSuccessScreen(false);
                alert("Website has been unpublished and taken offline.");
              } catch (e: any) {
                alert("Failed to unpublish site: " + (e.message || "Error"));
              }
            }
          }}
        />
      )}

      {showDevPanel && projectId && (
        <OwnerDeveloperPanelModal siteId={projectId} onClose={() => setShowDevPanel(false)} />
      )}

    </div>

  );
};
