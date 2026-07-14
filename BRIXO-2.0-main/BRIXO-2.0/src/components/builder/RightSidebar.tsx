import React, { useState } from 'react';
import {
  Sliders,
  Trash2,
  Plus,
  FileCode,
  AlignLeft
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';

export const RightSidebar: React.FC = () => {
  const {
    activeProject,
    activePageId,
    selectedComponentId,
    updateComponentField,
    updateComponentStyle,
    updateComponentCode
  } = useBuilderStore();

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'code'>('content');

  // Find active component
  const page = activeProject?.config?.pages?.find(
  p => p.id === activePageId
);
  const comp = page?.components.find(c => c.id === selectedComponentId);

  if (!activeProject) return null;

  // Render placeholder if no component is selected
  if (!comp) {
    return (
      <aside className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col items-center justify-center shrink-0 p-6 text-center select-none text-slate-500">
        <Sliders className="w-8 h-8 text-slate-700 mb-4 animate-bounce" />
        <span className="text-xs font-bold uppercase tracking-wider block text-slate-400">Property Editor</span>
        <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
          Select any element block on the live canvas to start customizing text, styling properties, list items, and custom code modules.
        </p>
      </aside>
    );
  }

  // List editing handler helper
  const handleListItemChange = (index: number, key: string, val: any) => {
    const list = [...(comp.fields.items || [])];
    list[index] = {
      ...list[index],
      [key]: val
    };
    updateComponentField(comp.id, 'items', list);
  };

  const handleAddListItem = () => {
    const list = [...(comp.fields.items || [])];

    // Add default row depending on component type
    let newRow: any = { title: 'New Item Title', desc: 'Enter details description.' };
    if (comp.type === 'Navbar' || comp.type === 'Footer') {
      newRow = 'New Link';
    } else if (comp.type === 'Products') {
      newRow = { name: 'New Item Product', price: '$29', desc: 'Detail specs.', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' };
    } else if (comp.type === 'Pricing') {
      newRow = { name: 'Premium Plan', price: '$99', period: 'mo', features: ['Feature 1', 'Feature 2'] };
    } else if (comp.type === 'FAQ') {
      newRow = { q: 'Question Title', a: 'Answer description text.' };
    } else if (comp.type === 'Testimonials') {
      newRow = { quote: 'Awesome experience!', author: 'Mark Spencer', role: 'CTO' };
    }

    list.push(newRow);
    updateComponentField(comp.id, 'items', list);
  };

  const handleDeleteListItem = (index: number) => {
    const list = (comp.fields.items || []).filter((_, idx) => idx !== index);
    updateComponentField(comp.id, 'items', list);
  };

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col h-full text-slate-100 overflow-hidden select-none">

      {/* Sidebar header tabs */}
      <div className="grid grid-cols-3 border-b border-slate-800 text-xs shrink-0 select-none text-slate-400">
        {[
          { id: 'content', label: 'Content', icon: <AlignLeft className="w-3.5 h-3.5" /> },
          { id: 'style', label: 'Style', icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'code', label: 'HTML/JSX', icon: <FileCode className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 flex flex-col items-center gap-1.5 border-b-2 font-bold transition-all ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 bg-slate-950/20'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels Scroll Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Component Header Metadata */}
        <div className="flex justify-between items-center bg-slate-950/40 p-3 border border-slate-850 rounded-xl shrink-0">
          <div>
            <span className="text-3xs uppercase tracking-widest text-slate-500 font-bold">Editing Node</span>
            <span className="text-xs font-black block text-slate-200">{comp.type}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase">{comp.id}</span>
        </div>

        {/* TAB 1: CONTENT EDIT */}
        {activeTab === 'content' && (
          <div className="space-y-4">

            {/* Standard Text properties */}
            {'title' in comp.fields && (
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Heading Title</label>
                <input
                  type="text"
                  value={comp.fields.title || ''}
                  onChange={e => updateComponentField(comp.id, 'title', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {'subtitle' in comp.fields && (
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Subtitle / Details</label>
                <textarea
                  rows={3}
                  value={comp.fields.subtitle || ''}
                  onChange={e => updateComponentField(comp.id, 'subtitle', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>
            )}

            {'ctaText' in comp.fields && (
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Button Call-To-Action</label>
                <input
                  type="text"
                  value={comp.fields.ctaText || ''}
                  onChange={e => updateComponentField(comp.id, 'ctaText', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {'imageUrl' in comp.fields && (
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Image Asset URL</label>
                <input
                  type="text"
                  value={comp.fields.imageUrl || ''}
                  onChange={e => updateComponentField(comp.id, 'imageUrl', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* List Array properties editor */}
            {comp.fields.items && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-3xs uppercase tracking-wider font-bold text-slate-500">List Items Content</span>
                  <button
                    onClick={handleAddListItem}
                    className="p-1 bg-slate-950 hover:bg-slate-850 rounded border border-slate-800 text-xs font-bold text-blue-400 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {comp.fields.items.map((item: any, idx: number) => {
                    const isObject = typeof item === 'object' && item !== null;
                    return (
                      <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2 relative group/item">
                        <button
                          onClick={() => handleDeleteListItem(idx)}
                          className="absolute top-2 right-2 text-slate-650 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* If item is a string, render a simple text input */}
                        {typeof item === 'string' && (
                          <input
                            type="text"
                            value={item}
                            onChange={e => {
                              const list = [...(comp.fields.items || [])];
                              list[idx] = e.target.value;
                              updateComponentField(comp.id, 'items', list);
                            }}
                            placeholder="Link Text"
                            className="w-[90%] bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                          />
                        )}

                        {/* Render fields depending on keys in list items */}
                        {isObject && 'title' in item && (
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={e => handleListItemChange(idx, 'title', e.target.value)}
                            placeholder="Item Title"
                            className="w-[90%] bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
                          />
                        )}
                        {isObject && 'name' in item && (
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={e => handleListItemChange(idx, 'name', e.target.value)}
                            placeholder="Product Name"
                            className="w-[90%] bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
                          />
                        )}
                        {isObject && 'price' in item && (
                          <input
                            type="text"
                            value={item.price || ''}
                            onChange={e => handleListItemChange(idx, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-[30%] bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
                          />
                        )}
                        {isObject && 'desc' in item && (
                          <textarea
                            rows={2}
                            value={item.desc || ''}
                            onChange={e => handleListItemChange(idx, 'desc', e.target.value)}
                            placeholder="Short description"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none resize-none leading-relaxed"
                          />
                        )}
                        {isObject && 'q' in item && (
                          <input
                            type="text"
                            value={item.q || ''}
                            onChange={e => handleListItemChange(idx, 'q', e.target.value)}
                            placeholder="Question Title"
                            className="w-[90%] bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
                          />
                        )}
                        {isObject && 'a' in item && (
                          <textarea
                            rows={2}
                            value={item.a || ''}
                            onChange={e => handleListItemChange(idx, 'a', e.target.value)}
                            placeholder="Answer content"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none resize-none leading-relaxed"
                          />
                        )}
                        {isObject && 'quote' in item && (
                          <textarea
                            rows={2}
                            value={item.quote || ''}
                            onChange={e => handleListItemChange(idx, 'quote', e.target.value)}
                            placeholder="Quote citation text"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none resize-none leading-relaxed"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: STYLE EDIT */}
        {activeTab === 'style' && (
          <div className="space-y-4">

            {/* Margins */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Margin Top</label>
                <select
                  value={comp.styles.marginTop || 'my-0'}
                  onChange={e => updateComponentStyle(comp.id, 'marginTop', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 outline-none"
                >
                  <option value="my-0">No Margin</option>
                  <option value="mt-4">Small (16px)</option>
                  <option value="mt-8">Medium (32px)</option>
                  <option value="mt-16">Large (64px)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Margin Bottom</label>
                <select
                  value={comp.styles.marginBottom || 'my-0'}
                  onChange={e => updateComponentStyle(comp.id, 'marginBottom', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 outline-none"
                >
                  <option value="my-0">No Margin</option>
                  <option value="mb-4">Small (16px)</option>
                  <option value="mb-8">Medium (32px)</option>
                  <option value="mb-16">Large (64px)</option>
                </select>
              </div>
            </div>

            {/* Paddings */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Padding Top</label>
                <select
                  value={comp.styles.paddingTop || 'py-16'}
                  onChange={e => updateComponentStyle(comp.id, 'paddingTop', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 outline-none"
                >
                  <option value="py-8">Small (32px)</option>
                  <option value="py-12">Medium (48px)</option>
                  <option value="py-16">Standard (64px)</option>
                  <option value="py-24">Extra Large (96px)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Padding Bottom</label>
                <select
                  value={comp.styles.paddingBottom || 'py-16'}
                  onChange={e => updateComponentStyle(comp.id, 'paddingBottom', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 outline-none"
                >
                  <option value="py-8">Small (32px)</option>
                  <option value="py-12">Medium (48px)</option>
                  <option value="py-16">Standard (64px)</option>
                  <option value="py-24">Extra Large (96px)</option>
                </select>
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-1.5">
              <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Corner Curves</label>
              <select
                value={comp.styles.borderRadius || activeProject.config.designTokens.borderRadius}
                onChange={e => updateComponentStyle(comp.id, 'borderRadius', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 outline-none"
              >
                <option value="rounded-none">Sharp Square (0px)</option>
                <option value="rounded-md">Curved Medium (6px)</option>
                <option value="rounded-xl">Standard Pillowed (12px)</option>
                <option value="rounded-3xl">Highly Rounded (24px)</option>
                <option value="rounded-full">Fully Round Pill (9999px)</option>
              </select>
            </div>

            {/* Shadows */}
            <div className="space-y-1.5">
              <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Drop Shadows</label>
              <select
                value={comp.styles.boxShadow || activeProject.config.designTokens.boxShadow}
                onChange={e => updateComponentStyle(comp.id, 'boxShadow', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 outline-none"
              >
                <option value="shadow-none">No Shadow</option>
                <option value="shadow-sm">Subtle Soft (sm)</option>
                <option value="shadow-md">Medium Elevation (md)</option>
                <option value="shadow-lg">Elevated Dark (lg)</option>
                <option value="shadow-xl">High Volume (xl)</option>
                <option value="shadow-2xl">Maximum Glow (2xl)</option>
              </select>
            </div>

            {/* Typography */}
            <div className="space-y-1.5">
              <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Typography overrides</label>
              <select
                value={comp.styles.fontFamily || activeProject.config.designTokens.fontFamily}
                onChange={e => updateComponentStyle(comp.id, 'fontFamily', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 outline-none"
              >
                <option value="font-sans">Inter Sans-Serif</option>
                <option value="font-serif">Georgia Serif Classic</option>
                <option value="font-mono">Fira Monospace Coding</option>
              </select>
            </div>

          </div>
        )}

        {/* TAB 3: CODE WORKSPACE */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div>
              <span className="text-3xs font-bold uppercase tracking-wider text-slate-500 block">Visual Code Editor</span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Write custom raw HTML code blocks. The changes compile directly into the preview window.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="block text-4xs font-mono text-slate-500 uppercase font-bold">Custom raw HTML code</span>
                <textarea
                  rows={8}
                  value={comp.customCode?.html || ''}
                  onChange={e => updateComponentCode(comp.id, { html: e.target.value })}
                  placeholder="e.g. <div class='p-8 text-center text-red-500 bg-red-950/20 rounded-xl'>Custom visual section code!</div>"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl p-2.5 font-mono text-[10px] text-emerald-400 leading-relaxed outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-4xs font-mono text-slate-500 uppercase font-bold">Custom visual Tailwind classes</span>
                <input
                  type="text"
                  value={comp.customCode?.tailwindClasses || ''}
                  onChange={e => updateComponentCode(comp.id, { tailwindClasses: e.target.value })}
                  placeholder="e.g. border border-blue-500/20 bg-blue-950/10 shadow-lg font-bold"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl p-2.5 font-mono text-[10px] text-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>
        )}

      </div>

    </aside>
  );
};
