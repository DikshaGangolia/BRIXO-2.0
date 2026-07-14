import React, { useState } from 'react';
import {
  Layers,
  Files,
  Palette,
  Image as ImageIcon,
  Plus,
  Trash2,
  Wand2,
  Upload,
  Settings,
  FolderPlus,
  Play
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import type { ComponentType, ThemeType } from '../../types/builder';

export const LeftSidebar: React.FC = () => {
  const {
    activeProject,
    activePageId,
    setActivePageId,
    addComponent,
    addPage,
    deletePage,
    updateGlobalTheme,
    updateDesignTokens
  } = useBuilderStore();

  const [activeTab, setActiveTab] = useState<'components' | 'pages' | 'theme' | 'assets'>('components');

  // Custom states
  const [newPageName, setNewPageName] = useState('');
  const [aiStylePrompt, setAiStylePrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80'
  ]);

  if (!activeProject) return null;

  // Visual layout blocks array matching 18 component types
  const visualBlocks: { type: ComponentType; label: string; description: string }[] = [
    { type: 'Navbar', label: 'Navbar Navigation', description: 'Responsive links with logo.' },
    { type: 'Hero', label: 'Hero Banner', description: 'Wide branding statement and image.' },
    { type: 'Features', label: 'Features Grid', description: 'Card grids highlighting values.' },
    { type: 'Services', label: 'Services List', description: 'Horizontal specialty displays.' },
    { type: 'Products', label: 'Products Showcase', description: 'Add-to-cart layout items.' },
    { type: 'Gallery', label: 'Visual Gallery', description: 'Image grids with lightboxes.' },
    { type: 'Testimonials', label: 'Testimonials Slider', description: 'Customer quotes and avatars.' },
    { type: 'Pricing', label: 'Pricing Tables', description: 'Subscription plan card structures.' },
    { type: 'FAQ', label: 'Accordion FAQs', description: 'Collapse toggle answers.' },
    { type: 'Blog', label: 'Latest Blogs', description: 'Article cards with preview read.' },
    { type: 'ContactForm', label: 'Contact Inquiry', description: 'Input fields with actions.' },
    { type: 'Map', label: 'Interactive Map', description: 'Google maps embed wrapper.' },
    { type: 'Footer', label: 'Footer Links', description: 'Links and copyrights row.' },
    { type: 'Banner', label: 'Alert Banner', description: 'Sale alert top strip.' },
    { type: 'Stats', label: 'SaaS Metric Stats', description: 'Horizontal milestones counters.' },
    { type: 'Team', label: 'Team Leaders', description: 'Profiles and social handles.' },
    { type: 'VideoSection', label: 'Video Display', description: 'YouTube/Vimeo embed window.' },
    { type: 'Newsletter', label: 'Subscription Call', description: 'Newsletter sign up inputs.' }
  ];

  // Theme presets definitions
  const themesList: ThemeType[] = [
    'Modern', 'Minimal', 'Luxury', 'Corporate', 'Dark', 'Creative', 'Neon', 'Glassmorphism'
  ];

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;
    addPage(newPageName.trim());
    setNewPageName('');
  };

  // AI assistant parser that maps design prompt words to styling rules
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiStylePrompt.trim()) return;

    setIsAiLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate LLM processing latency

    const p = aiStylePrompt.toLowerCase();

    // Default tokens mapping
    let primary = activeProject.config.designTokens.primaryColor;
    let secondary = activeProject.config.designTokens.secondaryColor;
    let bg = activeProject.config.designTokens.backgroundColor;
    let text = activeProject.config.designTokens.textColor;
    let font = activeProject.config.designTokens.fontFamily;
    let rounded = activeProject.config.designTokens.borderRadius;
    let shadow = activeProject.config.designTokens.boxShadow;
    let glass = activeProject.config.designTokens.glassmorphism;

    // AI prompt keyword mapping triggers
    if (p.includes('modern') && p.includes('dark')) {
      primary = '#3b82f6';
      secondary = '#60a5fa';
      bg = '#020617';
      text = '#f8fafc';
      rounded = 'rounded-xl';
    }
    else if (p.includes('black') && p.includes('gold')) {
      primary = '#d97706';
      secondary = '#f59e0b';
      bg = '#09090b';
      text = '#f4f4f5';
      font = 'font-serif';
      rounded = 'rounded-md';
      shadow = 'shadow-xl';
    }
    else if (p.includes('luxury') || p.includes('fashion')) {
      primary = '#9a3412'; // Rust red/gold
      secondary = '#ea580c';
      bg = '#fffaf8';
      text = '#27272a';
      font = 'font-serif';
      rounded = 'rounded-none';
    }
    else if (p.includes('minimal') || p.includes('clean')) {
      primary = '#18181b';
      secondary = '#71717a';
      bg = '#ffffff';
      text = '#18181b';
      font = 'font-sans';
      rounded = 'rounded-none';
      shadow = 'shadow-none';
    }

    updateDesignTokens({
      primaryColor: primary,
      secondaryColor: secondary,
      backgroundColor: bg,
      textColor: text,
      fontFamily: font,
      borderRadius: rounded,
      boxShadow: shadow,
      glassmorphism: glass
    });

    setIsAiLoading(false);
    setAiStylePrompt('');
    alert('AI Assistant: Site design tokens updated successfully! Content structure remains preserved.');
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mockUrl = URL.createObjectURL(file);
      setUploadedAssets(prev => [mockUrl, ...prev]);
    }
  };

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900 flex shrink-0 h-full text-slate-100 select-none overflow-hidden">

      {/* 1. Tab switches (Left vertical column) */}
      <div className="w-16 border-r border-slate-800 flex flex-col items-center py-4 gap-4 shrink-0 bg-slate-950/40">
        {[
          { id: 'components', icon: <Layers className="w-5 h-5" />, title: 'Components' },
          { id: 'pages', icon: <Files className="w-5 h-5" />, title: 'Page Setup' },
          { id: 'theme', icon: <Palette className="w-5 h-5" />, title: 'Design Themes' },
          { id: 'assets', icon: <ImageIcon className="w-5 h-5" />, title: 'Upload Assets' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
            }`}
            title={tab.title}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* 2. Workspace container (sliding drawer content) */}
      <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
      
        {/* Workspace Title */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 capitalize">
            {activeTab} Menu
          </span>
          <Settings className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Workspace Scroll details */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* TAB 1: COMPONENTS */}
          {activeTab === 'components' && (
            <div className="space-y-4">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-500 block">Pre-built Web Blocks</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Drag layouts onto canvas or click to insert before page footers.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
  {visualBlocks.map((block) => (
    <div
      key={block.type}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', block.type);
      }}
      onClick={() => addComponent(block.type)}
      className="p-3 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-xl cursor-grab active:cursor-grabbing text-left transition-all group hover:bg-slate-900/40 flex justify-between items-center"
    >
      <div>
        <span className="text-xs font-bold text-slate-300 block">
          {block.label}
        </span>
        <span className="text-[10px] text-slate-500 block mt-0.5">
          {block.description}
        </span>
      </div>

      <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
    </div>
  ))}
</div>
            </div>
          )}

          {/* TAB 2: PAGE SETUP */}
          {activeTab === 'pages' && (
            <div className="space-y-6">

              {/* List of active pages */}
              <div className="space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Active Pages Directory</span>
                <div className="space-y-2">
                  {activeProject.config.pages.map((p) => {
                    const isActive = activePageId === p.id;
                    console.log("visualBlocks length:", visualBlocks.length);
                    console.log(visualBlocks);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setActivePageId(p.id)}
                        className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-950/20 border-blue-500 shadow'
                            : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <Files className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-bold text-slate-300">{p.name}</span>
                          <span className="text-4xs font-mono text-slate-500">{p.path}</span>
                        </div>

                        {/* Can delete page if it is not Home */}
                        {p.id !== 'home' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePage(p.id);
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Page Form */}
              <form onSubmit={handleAddPage} className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-500 block">Create New Custom Page</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newPageName}
                    onChange={e => setNewPageName(e.target.value)}
                    placeholder="e.g. Services"
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none text-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl flex items-center justify-center shrink-0"
                  >
                    <FolderPlus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: DESIGN THEMES */}
          {activeTab === 'theme' && (
            <div className="space-y-6">

              {/* AI Design Assistant */}
              <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-blue-900/40 p-4 rounded-2xl space-y-3 shadow">
                <div className="flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">AI Design Assistant</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">AI modifies layout spacing, typography, and styling parameters. It never deletes page contents.</p>

                <form onSubmit={handleAISubmit} className="space-y-2.5">
                  <textarea
                    rows={3}
                    required
                    value={aiStylePrompt}
                    onChange={e => setAiStylePrompt(e.target.value)}
                    placeholder="e.g. Use premium black and gold theme with classic serif text details"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 resize-none leading-relaxed text-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white rounded-lg flex items-center justify-center gap-1 disabled:opacity-60 transition-all active:scale-95"
                  >
                    {isAiLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Play className="w-3 h-3 text-white" />
                    )}
                    {isAiLoading ? 'Updating design style...' : 'Apply Style Prompt'}
                  </button>
                </form>
              </div>

              {/* Hardcoded presets list */}
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Theme Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  {themesList.map((t) => {
                    const isActive = activeProject.config.theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => updateGlobalTheme(t)}
                        className={`py-2 rounded-xl text-3xs font-bold transition-all border ${
                          isActive
                            ? 'bg-blue-600 border-blue-500 text-white shadow shadow-blue-500/10'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Uploaded Assets</span>
              <p className="text-[10px] text-slate-400 leading-normal">Upload local visual files or drag media slots directly into components image selectors.</p>

              {/* Asset Uploader */}
              <div className="relative border border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-slate-600 transition-colors cursor-pointer bg-slate-950/20">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAssetUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">Drag file or Browse</span>
              </div>

              {/* Assets list grid */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/80">
                {uploadedAssets.map((url, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', `image:${url}`);
                    }}
                    className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950 cursor-grab hover:border-slate-600 transition-all shadow group"
                  >
                    <img src={url} alt="asset file" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-4xs uppercase font-bold text-white transition-opacity select-none">
                      Drag to Place
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
