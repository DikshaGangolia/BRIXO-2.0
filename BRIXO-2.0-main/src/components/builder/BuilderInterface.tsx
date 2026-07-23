import axios from "axios";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  CheckCircle,
  Globe,
  Download,
  FileCode,
} from 'lucide-react';
import * as Lucide from 'lucide-react';
import type { ComponentBlock, DesignTokens } from '../../types/builder';
import { useAuthStore } from '../../store/useAuthStore';
import { useBuilderStore } from '../../store/useBuilderStore';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Canvas } from './Canvas';
import { exportSiteZip } from '../../utils/export';
import { CartSidebar } from './CartSidebar';
import { useCartStore } from '../../store/useCartStore';
import { generatePublishedHTML } from '../../utils/publishHtml';

// Backend base URL (used by other flows). Kept for future extensibility.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _API_BASE_URL = 'https://brixo-2-0.onrender.com';
void _API_BASE_URL;

// Helper: Products block with real Add to Cart for CleanBlockRenderer
const ProductsWithCart = ({ comp, tokens, onNavigate, pages, cartCount }: {
  comp: ComponentBlock;
  tokens: DesignTokens;
  onNavigate: (id: string) => void;
  pages: any[];
  cartCount: number;
}) => {
  const { addToCart } = useCartStore();
  const rounded = tokens.borderRadius;
  const shadow = tokens.boxShadow;
  const pyTop = comp.styles?.paddingTop || tokens.paddingTop;
  const pyBottom = comp.styles?.paddingBottom || tokens.paddingBottom;
  const headingFont = tokens.fontFamily === 'font-serif' ? 'font-serif' : tokens.fontFamily === 'font-mono' ? 'font-mono' : 'font-sans';
  const { siteId } = useParams<{ siteId?: string }>();

  return (
    <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor, color: tokens.textColor }}>
      <div className="max-w-5xl mx-auto">
        <h2 className={`text-2xl font-black text-center mb-10 ${headingFont}`} style={{ color: tokens.primaryColor }}>
          {comp.fields.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(comp.fields.items || []).map((p: any, idx: number) => (
            <div
              key={idx}
              className={`border overflow-hidden flex flex-col justify-between ${rounded} ${shadow}`}
              style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}
            >
              <div className="aspect-video bg-gray-155 relative">
                <img src={p.img || p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1 mb-2">
                    <h5 className="font-bold text-xs" style={{ color: tokens.primaryColor }}>{p.name}</h5>
                    <span className="text-xs font-bold shrink-0" style={{ color: tokens.accentColor }}>{p.price}</span>
                  </div>
                  <p className="text-4xs opacity-70 leading-relaxed mb-4">{p.desc}</p>
                </div>
                <button
                  onClick={async () => {
  addToCart({
    id: `${p.name}-${idx}`,
    name: p.name,
    price: p.price,
    image: p.img || p.image,
    siteId: siteId || 'default',
  });

  try {
    await axios.post("http://localhost:5000/api/twilio/send-sms", {
      phone: "+919528620651",
      productName: p.name,
    });
    console.log("SMS sent");
  } catch (error) {
    console.error("SMS failed", error);
  }
}}
                  className={`w-full py-1.5 border text-3xs font-semibold ${rounded} flex items-center justify-center gap-1.5 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors`}
                  style={{ borderColor: tokens.primaryColor, color: tokens.primaryColor }}
                >
                  <Lucide.ShoppingBag className="w-3 h-3" />
                  Add to cart {cartCount > 0 ? `(${cartCount})` : ''}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BuilderInterface: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { projects, loadProjects } = useAuthStore();
  const { activeProject, activePageId, setActivePageId, loadProject } = useBuilderStore();
  const { toggleCart, getCartCount } = useCartStore();

  // Dialog Overlays states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Deploy pipeline states
  const [deployPlatform, setDeployPlatform] = useState<'Vercel' | 'Netlify' | 'GitHub Pages'>('Vercel');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    const initializeBuilder = async () => {
      setIsInitializing(true);
      setLoadError(null);

      // 1. If activeProject is already set in builder store and matches siteId, we are ready
      const currentActive = useBuilderStore.getState().activeProject;
      if (currentActive && currentActive.id === siteId) {
        if (isSubscribed) setIsInitializing(false);
        return;
      }

      // 2. Fetch projects from auth store if empty
      let currentProjects = useAuthStore.getState().projects;
      if (currentProjects.length === 0) {
        await loadProjects();
        currentProjects = useAuthStore.getState().projects;
      }

      // 3. Find matching project in store
      const match = currentProjects.find(p => p.id === siteId);
      if (match) {
        loadProject(match);
        if (isSubscribed) setIsInitializing(false);
      } else {
        // Re-check active project state one more time
        const recheckActive = useBuilderStore.getState().activeProject;
        if (recheckActive && recheckActive.id === siteId) {
          if (isSubscribed) setIsInitializing(false);
        } else {
          if (isSubscribed) {
            setLoadError(`Project with ID "${siteId}" could not be found.`);
            setIsInitializing(false);
          }
        }
      }
    };

    if (siteId) {
      initializeBuilder();
    }

    return () => {
      isSubscribed = false;
    };
  }, [siteId, loadProjects, loadProject]);

  if (isInitializing && !activeProject) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading BRIXO workspace...</span>
      </div>
    );
  }

  if (loadError && !activeProject) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 space-y-4 text-center">
        <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-2xl text-red-400 text-sm max-w-md">
          <p className="font-bold text-base">Workspace Initialization Failure</p>
          <p className="text-xs text-slate-400 mt-1">{loadError}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Real deployment publisher pipeline
  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress(0);
    setDeployLogs([]);
    setDeployUrl(null);

    const logs = [
      ` Authenticating keys on ${deployPlatform} edge nodes...`,
      ` Packaging source config (${activeProject.config.pages.length} pages)...`,
      ` Compiling Tailwind directives and HSL custom colors...`,
      ` Running typescript optimization and lint reviews...`,
      ` Offloading visual block assets to static edge CDN...`,
      ` Binding custom SSL certificate...`,
      ` CDN Propagation completed successfully!`
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setDeployProgress(Math.floor(((i + 1) / logs.length) * 100));
      setDeployLogs(prev => [...prev, logs[i]]);
    }

    try {
      // Build a fully interactive standalone HTML preview of the site
      // (working cart, checkout simulation, multi-page tabs) and open it
      // in a new tab via a Blob URL. This works offline and does not
      // depend on any backend preview endpoint.
      const html = generatePublishedHTML(activeProject);
      const blob = new Blob([html], { type: 'text/html' });
      const previewUrl = URL.createObjectURL(blob);
      setDeployUrl(previewUrl);
      // Auto-open in a new tab so the user immediately sees the working site
      window.open(previewUrl, '_blank', 'noopener');

      // Fire-and-forget: also mark the project as published on the backend
      // if the user is authenticated. Ignored on failure — preview still works.
      try {
        await useAuthStore.getState().publishProject(activeProject.id);
      } catch (_e) { /* backend optional */ }
    } catch (error) {
      console.error('Publish failed:', error);
      setDeployUrl(null);
    }

    setIsDeploying(false);
  };

  // ZIP export handler
  const handleZipDownload = async () => {
    try {
      const blob = await exportSiteZip(activeProject);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '_')}_source_code.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsExportOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to generate zip export folder.');
    }
  };

  const cartCount = getCartCount();

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col">

      {/* 1. Header controls */}
      <TopBar
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenPublish={() => { setIsPublishOpen(true); setDeployUrl(null); }}
        onOpenExport={() => setIsExportOpen(true)}
        cartCount={cartCount}
        onOpenCart={toggleCart}
      />

      {/* 2. Main Builder split grid */}
      <div className="flex-1 min-h-0 flex overflow-hidden bg-slate-950">

  {/* LEFT SIDEBAR */}
<aside className="block w-[320px] shrink-0 border-r border-slate-800 overflow-hidden">
  <LeftSidebar />
</aside>


{/* CENTER CANVAS */}
<main className="flex-1 min-w-0 min-h-0 overflow-auto">
  <Canvas />
</main>


{/* RIGHT SIDEBAR */}
<aside className="block w-[320px] shrink-0 border-l border-slate-800 overflow-hidden">
  <RightSidebar />
</aside>

</div>

      {/* --- PREVIEW DIALOG MODAL --- */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">

            {/* Modal close top menu */}
            <div className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex justify-between items-center select-none shrink-0 text-slate-300">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-100">Live Workspace Preview: {activeProject.name}</span>

                {/* Visual links router preview */}
                <div className="flex gap-2 text-2xs font-bold bg-slate-950 p-1 rounded-xl">
                  {activeProject.config.pages.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActivePageId(p.id)}
                      className={`px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        activePageId === p.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-3xs font-bold uppercase rounded-lg flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Close Preview
              </button>
            </div>

            {/* Simulated Live preview frame */}
            <div className="flex-1 bg-white overflow-y-auto select-none" style={{ backgroundColor: activeProject.config.designTokens.backgroundColor }}>
              {(() => {
                const previewPage = activeProject.config.pages.find(p => p.id === activePageId);
                if (!previewPage) return null;

                // Renders clean templates blocks without outline overlays
                return (
                  <div className="flex flex-col min-h-full">
                    {previewPage.components.map((comp) => (
                      <div key={comp.id} className={`${activeProject.config.designTokens.fontFamily} ${activeProject.config.designTokens.boxShadow}`}>
                        {/* Simulates simple text render outputs */}
                        <CleanBlockRenderer comp={comp} tokens={activeProject.config.designTokens} onNavigate={setActivePageId} pages={activeProject.config.pages} />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* --- PUBLISH DIALOG MODAL --- */}
      <AnimatePresence>
        {isPublishOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-5 shadow-2xl text-slate-100"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-200">Simulate Publish Website</h3>
                  <p className="text-3xs text-slate-400">Deploy layout parameters to edge servers.</p>
                </div>
                <button onClick={() => setIsPublishOpen(false)} className="text-slate-500 hover:text-slate-350"><X className="w-4 h-4" /></button>
              </div>

              {!isDeploying && !deployUrl && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Target Host Cloud</label>
                    <select
                      value={deployPlatform}
                      onChange={e => setDeployPlatform(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs outline-none cursor-pointer"
                    >
                      <option value="Vercel">Vercel Edge Cloud</option>
                      <option value="Netlify">Netlify Hosting</option>
                      <option value="GitHub Pages">GitHub Pages static</option>
                    </select>
                  </div>

                  <button
                    onClick={handleDeploy}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Globe className="w-4 h-4 text-white" />
                    Publish Live
                  </button>
                </div>
              )}

              {/* Progress logger logs */}
              {isDeploying && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-blue-400">
                    <span className="font-bold font-mono">Deploying to {deployPlatform}...</span>
                    <span className="font-bold">{deployProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${deployProgress}%` }}></div>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl font-mono text-[9px] text-slate-400 space-y-1 max-h-[140px] overflow-y-auto">
                    {deployLogs.map((l, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <span className="text-slate-700">&gt;&gt;</span>
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Result Domain Link */}
              {deployUrl && (
                <div className="bg-gradient-to-tr from-emerald-950/20 to-slate-950 border border-emerald-500/20 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block">Deploy Successful!</span>
                      <span className="text-3xs text-slate-400">Simulated deployment completed. Preview URL:</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-2xs">
                    <span className="font-mono text-blue-400 truncate pr-2">{deployUrl}</span>
                    <a
  href={deployUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="text-emerald-400 hover:text-emerald-300 font-bold shrink-0 flex items-center gap-0.5"
>
  Open <ExternalLink className="w-3.5 h-3.5" />
</a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EXPORT CODE MODAL --- */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-5 shadow-2xl text-slate-100"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-200">Export Source Code</h3>
                  <p className="text-3xs text-slate-400">Download visual configurations as clean packages.</p>
                </div>
                <button onClick={() => setIsExportOpen(false)} className="text-slate-500 hover:text-slate-350"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-4 bg-slate-950/60 border border-slate-850 rounded-2xl hover:border-slate-700 transition-colors">
                  <div className="p-2 bg-blue-950 text-blue-400 rounded-xl">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Clean Project ZIP Bundle</span>
                    <span className="text-3xs text-slate-500">Includes React 19 source, Vite setup config and static HTML assets folder.</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setIsExportOpen(false)}
                  className="flex-1 py-2 text-3xs uppercase tracking-wider border border-slate-800 hover:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleZipDownload}
                  className="flex-1 py-2 text-3xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-lg"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  Download ZIP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};
// Clean preview renderer mapping standard block texts
const CleanBlockRenderer = ({
  comp,
  tokens,
  onNavigate,
  pages
}: {
  comp: ComponentBlock;
  tokens: DesignTokens;
  onNavigate: (id: string) => void;
  pages: any[];
}) => {
  const rounded = tokens.borderRadius;
  const shadow = tokens.boxShadow;
  const pyTop = comp.styles.paddingTop || tokens.paddingTop;
  const pyBottom = comp.styles.paddingBottom || tokens.paddingBottom;

  if (comp.customCode?.html) {
    return (
      <div
        className={`${pyTop} ${pyBottom} px-6`}
        style={{ borderTop: `1px solid ${tokens.primaryColor}15` }}
        dangerouslySetInnerHTML={{ __html: comp.customCode.html }}
      />
    );
  }

  const headingFont = tokens.fontFamily === 'font-serif' ? 'font-serif' : tokens.fontFamily === 'font-mono' ? 'font-mono' : 'font-sans';

  switch (comp.type) {
    case 'Navbar':
      return (
        <nav
          className="px-6 py-4 flex justify-between items-center border-b transition-colors"
          style={{ borderColor: tokens.primaryColor + '15', background: tokens.backgroundColor, color: tokens.textColor }}
        >
          <div className="flex items-center gap-2 font-bold text-sm select-none">
            <Lucide.Sparkles className="w-4 h-4" style={{ color: tokens.primaryColor }} />
            <span style={{ color: tokens.primaryColor }}>{comp.fields.title}</span>
          </div>
          <ul className="hidden md:flex gap-5 text-xs font-semibold select-none opacity-80">
            {(comp.fields.items || []).map((item: any, idx: number) => {
              const itemStr = typeof item === 'string' ? item : (item?.title || item?.name || 'Link');
              const id = itemStr.toLowerCase().replace(/\s+/g, '-');
              const exists = pages.some(p => p.id === id);
              return (
                <li key={idx}>
                  <button
                    onClick={() => { if (exists) onNavigate(id); }}
                    className="hover:opacity-75 transition-opacity"
                  >
                    {itemStr}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            className={`px-4 py-1.5 text-xs font-bold border ${rounded}`}
            style={{ borderColor: tokens.primaryColor, color: tokens.primaryColor }}
          >
            Order Now
          </button>
        </nav>
      );

    case 'Hero':
      return (
        <section
          className={`${pyTop} ${pyBottom} px-8 relative overflow-hidden flex items-center min-h-[400px]`}
          style={{ backgroundImage: `linear-gradient(135deg, ${tokens.backgroundColor}, ${tokens.primaryColor}08)`, color: tokens.textColor }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto w-full">
            <div className="text-left">
              <h1 className={`text-3xl md:text-4xl font-black mb-4 ${headingFont}`} style={{ color: tokens.primaryColor }}>
                {comp.fields.title}
              </h1>
              <p className="text-sm opacity-90 leading-relaxed mb-6">
                {comp.fields.subtitle}
              </p>
              <button
                className={`px-5 py-2.5 text-xs font-bold text-white shadow-lg ${rounded}`}
                style={{ backgroundColor: tokens.primaryColor }}
              >
                {comp.fields.ctaText}
              </button>
            </div>
            <div className={`aspect-video w-full overflow-hidden shadow-lg border border-slate-100 ${rounded}`}>
              <img src={comp.fields.imageUrl} alt="Hero Media" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      );

    case 'Features':
    case 'Services':
      return (
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor, color: tokens.textColor }}>
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-2xl font-black text-center mb-10 ${headingFont}`} style={{ color: tokens.primaryColor }}>
              {comp.fields.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(comp.fields.items || []).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-5 border bg-opacity-40 hover:shadow-md transition-all ${rounded} ${shadow}`}
                  style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: tokens.primaryColor + '10' }}>
                    <Lucide.CheckCircle className="w-5 h-5" style={{ color: tokens.primaryColor }} />
                  </div>
                  <h4 className="font-bold text-sm mb-2" style={{ color: tokens.primaryColor }}>{item.title}</h4>
                  <p className="text-xs opacity-75 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'Products':
      return (
        <ProductsWithCart
          comp={comp}
          tokens={tokens}
          onNavigate={onNavigate}
          pages={pages}
          cartCount={0}
        />
      );

    case 'Testimonials':
      return (
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor, color: tokens.textColor }}>
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-2xl font-black text-center mb-10 ${headingFont}`} style={{ color: tokens.primaryColor }}>
              {comp.fields.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(comp.fields.items || []).map((t: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-6 border flex flex-col justify-between ${rounded} ${shadow}`}
                  style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}
                >
                  <p className="text-xs italic opacity-85 leading-relaxed mb-4">"{t.quote}"</p>
                  <div>
                    <h5 className="font-bold text-xs" style={{ color: tokens.primaryColor }}>{t.author}</h5>
                    <span className="text-4xs opacity-50 block">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'Pricing':
      return (
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor, color: tokens.textColor }}>
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-2xl font-black text-center mb-10 ${headingFont}`} style={{ color: tokens.primaryColor }}>
              {comp.fields.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(comp.fields.items || []).map((p: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-6 border flex flex-col justify-between ${rounded} ${shadow}`}
                  style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}
                >
                  <div>
                    <h4 className="font-bold text-sm mb-2" style={{ color: tokens.primaryColor }}>{p.name}</h4>
                    <div className="flex items-baseline gap-0.5 mb-4">
                      <span className="text-2xl font-black">{p.price}</span>
                      <span className="text-4xs opacity-60">/{p.period}</span>
                    </div>
                    <ul className="space-y-1.5 mb-6 text-4xs text-left">
                      {(p.features || []).map((f: string, fIdx: number) => (
                        <li key={fIdx}>✓ {f}</li>
                      ))}
                    </ul>
                  </div>
                  <button className={`w-full py-2 text-xs font-semibold text-white ${rounded}`} style={{ backgroundColor: tokens.primaryColor }}>
                    Get plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'ContactForm':
      return (
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor, color: tokens.textColor }}>
          <div className="max-w-md mx-auto">
            <div className={`p-6 border ${rounded} ${shadow}`} style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}>
              <h2 className={`text-xl font-bold text-center mb-6 ${headingFont}`} style={{ color: tokens.primaryColor }}>
                {comp.fields.title}
              </h2>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Inquiry details sent successfully!'); }}>
                <input type="text" placeholder="Full Name" className={`w-full px-3 py-2 text-xs border ${rounded}`} style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }} />
                <input type="email" placeholder="Email Address" className={`w-full px-3 py-2 text-xs border ${rounded}`} style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }} />
                <textarea placeholder="Message Content" rows={3} className={`w-full px-3 py-2 text-xs border ${rounded}`} style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }} />
                <button type="submit" className={`w-full py-2.5 text-xs font-semibold text-white shadow-md ${rounded}`} style={{ backgroundColor: tokens.primaryColor }}>
                  {comp.fields.ctaText || 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </section>
      );

    case 'Footer':
      return (
        <footer
          className="py-10 px-8 border-t text-center text-xs opacity-90 transition-colors"
          style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor, color: tokens.textColor }}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span>{comp.fields.title}</span>
            <div className="flex gap-4 font-semibold text-slate-500">
              {(comp.fields.items || []).map((s: any, sIdx: number) => {
                const sStr = typeof s === 'string' ? s : (s?.title || s?.name || 'Link');
                return (
                  <span key={sIdx}>{sStr}</span>
                );
              })}
            </div>
          </div>
        </footer>
      );

    default:
      return null;
  }
};
