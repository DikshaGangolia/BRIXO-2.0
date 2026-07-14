import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface ImageManagerProps {
  currentUrl: string;
  onReplaceImage: (newUrl: string) => void;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ currentUrl, onReplaceImage }) => {
  const [resizePercent, setResizePercent] = useState(100);
  const [activeAspect, setActiveAspect] = useState<'free' | '16-9' | '4-3' | '1-1'>('free');

  const aspectLabel = 
    activeAspect === '16-9' ? 'aspect-video' :
    activeAspect === '4-3' ? 'aspect-[4/3]' :
    activeAspect === '1-1' ? 'aspect-square' : 'aspect-auto';

  const presets = [
    { title: 'Fashion', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80' },
    { title: 'Tech Gadget', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { title: 'Organic Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
    { title: 'Restaurant Dining', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-4 text-slate-100">
      
      {/* Active image and crop indicator */}
      <div className="space-y-1.5">
        <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Media Selector & Crop</label>
        <div className="relative border border-slate-800 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center p-2">
          <div className={`overflow-hidden max-w-[200px] border border-blue-500/20 bg-slate-950 ${aspectLabel}`} style={{ width: `${resizePercent}%` }}>
            <img src={currentUrl} alt="Visual Workspace" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400">
            Scale: {resizePercent}%
          </div>
        </div>
      </div>

      {/* Resize slider controls */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-3xs font-bold text-slate-400 uppercase">
          <span>Resize Percentage</span>
          <span className="text-blue-400">{resizePercent}%</span>
        </div>
        <input 
          type="range" 
          min={50} 
          max={100} 
          value={resizePercent} 
          onChange={e => setResizePercent(Number(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Crop aspect selections */}
      <div className="space-y-1.5">
        <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Crop Aspects Ratio</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'free', label: 'Free' },
            { id: '16-9', label: '16:9' },
            { id: '4-3', label: '4:3' },
            { id: '1-1', label: '1:1' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveAspect(item.id as any);
                alert(`Cropped image layout updated to aspect ${item.label}!`);
              }}
              className={`py-1.5 rounded text-3xs font-bold transition-all border ${
                activeAspect === item.id 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-350'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Library Swap */}
      <div className="space-y-1.5 border-t border-slate-800/80 pt-3.5">
        <span className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Media Swap Library</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onReplaceImage(preset.url)}
              className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 hover:bg-slate-900/40 rounded-lg text-3xs text-left truncate text-slate-400 hover:text-slate-200 transition-all font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3 text-blue-500 shrink-0" />
              {preset.title}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
