import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  initialClasses?: string;
  onCodeChange: (code: { html?: string; tailwindClasses?: string }) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode, 
  initialClasses = '', 
  onCodeChange 
}) => {
  const [htmlCode, setHtmlCode] = useState(initialCode);
  const [tailwindClasses, setTailwindClasses] = useState(initialClasses);
  const [activeTab, setActiveTab] = useState<'html' | 'tailwind'>('html');

  const handleApply = () => {
    onCodeChange({
      html: htmlCode,
      tailwindClasses
    });
    alert('Code Editor: Changes compiled and hot reloaded on live canvas!');
  };

  return (
    <div className="border border-slate-800 bg-slate-950/60 rounded-xl overflow-hidden shadow-lg font-mono">
      {/* Code Editor Header */}
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 border-b border-slate-800 text-[10px] text-slate-400">
        <div className="flex gap-2 font-bold">
          <button 
            onClick={() => setActiveTab('html')}
            className={`pb-1 ${activeTab === 'html' ? 'border-b border-blue-500 text-blue-400' : 'hover:text-slate-200'}`}
          >
            section.html
          </button>
          <button 
            onClick={() => setActiveTab('tailwind')}
            className={`pb-1 ${activeTab === 'tailwind' ? 'border-b border-blue-500 text-blue-400' : 'hover:text-slate-200'}`}
          >
            classes.tailwind
          </button>
        </div>
        <button 
          onClick={handleApply}
          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-sans text-3xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
        >
          <Play className="w-2.5 h-2.5" /> Compile
        </button>
      </div>

      {/* Editor Body */}
      <div className="p-3">
        {activeTab === 'html' ? (
          <div className="flex gap-2">
            {/* Mock Line numbers */}
            <div className="text-[10px] text-slate-650 text-right select-none pr-2 border-r border-slate-900 font-semibold space-y-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <div key={n}>{n}</div>)}
            </div>
            <textarea
              rows={6}
              value={htmlCode}
              onChange={e => setHtmlCode(e.target.value)}
              placeholder="<!-- Write raw HTML here -->"
              className="flex-1 bg-transparent border-none text-[10px] text-emerald-400 focus:ring-0 outline-none leading-relaxed resize-none w-full"
            />
          </div>
        ) : (
          <input
            type="text"
            value={tailwindClasses}
            onChange={e => setTailwindClasses(e.target.value)}
            placeholder="e.g., border border-blue-500/25 bg-blue-950/10 px-4 py-2"
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-emerald-400 outline-none focus:border-blue-500"
          />
        )}
      </div>

      {/* Editor Footer Status */}
      <div className="bg-slate-900/60 px-4 py-1.5 border-t border-slate-850 text-[8px] text-slate-500 flex justify-between items-center">
        <span className="flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5 text-blue-500 animate-pulse" /> Live update preview active
        </span>
        <span>UTF-8</span>
      </div>
    </div>
  );
};
