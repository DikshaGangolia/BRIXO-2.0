import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Download, 
  Globe, 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone,
  CheckCircle,
  ShoppingBag
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';

interface TopBarProps {
  onOpenPreview: () => void;
  onOpenPublish: () => void;
  onOpenExport: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenPreview, onOpenPublish, onOpenExport, cartCount = 0, onOpenCart }) => {
  const { 
    activeProject, 
    viewportMode, 
    setViewportMode, 
    undo, 
    redo, 
    undoStack, 
    redoStack,
    saveActiveProject 
  } = useBuilderStore();
  const navigate = useNavigate();
  const [saveIndicator, setSaveIndicator] = useState(false);

  const handleSave = () => {
    saveActiveProject();
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 text-slate-100 select-none">
      
      {/* Name and back actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="border-l border-slate-800 pl-4">
          <span className="font-extrabold text-xs text-slate-200 block truncate max-w-[150px] md:max-w-[240px]">
            {activeProject?.name || 'Untitled Website'}
          </span>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
            {activeProject?.templateName || 'Visual Layout'} Preset
          </p>
        </div>
      </div>

      {/* History and viewport mode switches */}
      <div className="flex items-center gap-6">
        
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-slate-800 pr-4">
          <button 
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-all active:scale-95"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-all active:scale-95"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport size buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 border border-slate-800 rounded-xl">
          {[
            { id: 'desktop', icon: <Monitor className="w-3.5 h-3.5" />, title: 'Desktop View' },
            { id: 'tablet', icon: <Tablet className="w-3.5 h-3.5" />, title: 'Tablet View' },
            { id: 'mobile', icon: <Smartphone className="w-3.5 h-3.5" />, title: 'Mobile View' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setViewportMode(item.id as any)}
              className={`p-1.5 rounded-lg transition-all ${
                viewportMode === item.id 
                  ? 'bg-slate-800 text-blue-400' 
                  : 'text-slate-500 hover:text-slate-350'
              }`}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Save, Cart, Preview, Export, Publish triggers */}
      <div className="flex items-center gap-2">
        
        {/* Cart */}
        {onOpenCart && (
          <button 
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-3xs font-bold uppercase rounded-lg transition-all active:scale-95 border border-slate-800"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        )}

        {/* Save */}
        <button 
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-3xs font-bold uppercase rounded-lg transition-all active:scale-95 border border-slate-800"
        >
          {saveIndicator ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
          {saveIndicator ? 'Saved' : 'Save'}
        </button>

        {/* Preview */}
        <button 
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-3xs font-bold uppercase rounded-lg transition-all active:scale-95 border border-slate-800"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>

        {/* Export */}
        <button 
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-3xs font-bold uppercase rounded-lg transition-all active:scale-95 border border-slate-800"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>

        {/* Publish */}
        <button 
          onClick={onOpenPublish}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-3xs font-bold uppercase rounded-lg text-white shadow shadow-blue-500/10 transition-all active:scale-95"
        >
          <Globe className="w-3.5 h-3.5" />
          Publish
        </button>
      </div>

    </header>
  );
};
