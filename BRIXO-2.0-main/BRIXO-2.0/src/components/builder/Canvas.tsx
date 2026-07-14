import React from 'react';
import * as Lucide from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import type { ComponentBlock, DesignTokens } from '../../types/builder';

export const Canvas: React.FC = () => {
  const {
    activeProject,
    activePageId,
    selectedComponentId,
    setSelectedComponentId,
    viewportMode,
    addComponent,
    removeComponent,
    reorderComponent,
    duplicateComponent,
    updateComponentField
  } = useBuilderStore();
  const page = activeProject?.config?.pages?.find(
  p => p.id === activePageId
);

const tokens = activeProject?.config?.designTokens;
  if (!activeProject || !page || !tokens) {
    return (
      <div className="flex-1 min-h-0 h-full overflow-auto">
        No active visual workspace page loaded.
      </div>
    );
  }
  console.log("ACTIVE PAGE:", page);
  console.log("TOTAL COMPONENTS:", page.components.length);
  console.log(page.components);
  // Width modifiers based on viewport configuration
  const viewportWidthClass =
  viewportMode === 'mobile'
    ? 'w-[375px] min-h-screen border-4 border-slate-800 rounded-3xl'
    : viewportMode === 'tablet'
    ? 'w-[650px] min-h-screen border-4 border-slate-800 rounded-2xl'
    : 'w-full min-h-screen border border-slate-800 rounded-xl';   // HTML5 Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
};

  const handleDrop = (e: React.DragEvent, _index?: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    // Check if dragging an image URL
    if (data.startsWith('image:')) {
      const imageUrl = data.replace('image:', '');
      // Find what component is active or what component index was hovered and replace its image
      if (selectedComponentId) {
        updateComponentField(selectedComponentId, 'imageUrl', imageUrl);
      }
    } else {
      // Adding a layout block type
      addComponent(data as ComponentBlock['type']);
    }
  };
  console.log("CANVAS COMPONENTS:", page.components.length, page.components);
  return (
  <div
  className="h-full overflow-y-auto bg-slate-950 flex justify-center items-start p-6"
  onDragOver={handleDragOver}
  onDrop={(e) => handleDrop(e)}
>
    <div
      className={`w-full bg-white text-slate-900 shadow-2xl transition-all duration-300 relative overflow-hidden ${viewportWidthClass}`}
      style={{ backgroundColor: tokens.backgroundColor, color: tokens.textColor }}
    >
        {page.components.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-300 m-6 rounded-xl">
            Canvas is empty. Drag or click pre-built components from the left sidebar to start.
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {page.components.map((comp, idx) => {
              const isSelected = selectedComponentId === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComponentId(comp.id);
                  }}
                  className={`relative group transition-all ${
                    isSelected
                      ? 'ring-4 ring-blue-500 ring-offset-2 scale-[0.99] z-20 shadow'
                      : 'hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 cursor-pointer'
                  }`}
                >

                  {/* Visual components toolbars overlay */}
                  <div className="absolute top-2 left-2 z-30 opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow transition-opacity flex items-center gap-1.5 cursor-move">
                    <Lucide.GripVertical className="w-3 h-3" />
                    {comp.type} Section
                  </div>

                  <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); reorderComponent('up', idx); }}
                      disabled={idx === 0}
                      className="p-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded disabled:opacity-30"
                      title="Move Up"
                    >
                      <Lucide.ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); reorderComponent('down', idx); }}
                      disabled={idx === (page.components.length - 1)}
                      className="p-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded disabled:opacity-30"
                      title="Move Down"
                    >
                      <Lucide.ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateComponent(comp.id); }}
                      className="p-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded"
                      title="Duplicate Section"
                    >
                      <Lucide.Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }}
                      className="p-1 bg-red-950 border border-red-900 text-red-400 hover:text-red-300 rounded"
                      title="Remove Section"
                    >
                      <Lucide.Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Component layout display */}
                  <div className={`${tokens.fontFamily} ${tokens.boxShadow}`}>
                    <RenderComponentBlock comp={comp} tokens={tokens} onUpdateText={(key, val) => updateComponentField(comp.id, key, val)} />
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Canvas sub-components renderer supporting inline direct text writes

const RenderComponentBlock = ({
  comp,
  tokens,
  onUpdateText
}: {
  comp: ComponentBlock;
  tokens: DesignTokens;
  onUpdateText: (key: string, val: string) => void;
}) => {
  const safeTokens = tokens ?? {
  primaryColor: "#2563eb",
  secondaryColor: "#0f172a",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  fontFamily: "font-sans",
  borderRadius: "rounded-xl",
  boxShadow: "shadow-md",
  glassmorphism: false,
  paddingTop: "pt-16",
  paddingBottom: "pb-16",
  marginTop: "mt-0",
  marginBottom: "mb-0",
};

const rounded = safeTokens.borderRadius;
const shadow = safeTokens.boxShadow;
const pyTop = comp.styles?.paddingTop || safeTokens.paddingTop;
const pyBottom = comp.styles?.paddingBottom || safeTokens.paddingBottom;
const mtTop = comp.styles?.marginTop || safeTokens.marginTop;
const mbBottom = comp.styles?.marginBottom || safeTokens.marginBottom;

  // Custom visual HTML override
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
          className="px-6 py-4 flex justify-between items-center border-b select-none transition-colors"
          style={{ borderColor: tokens.primaryColor + '15', background: tokens.backgroundColor }}
        >
          <div className="flex items-center gap-2 font-extrabold text-sm select-none">
            <Lucide.Sparkles className="w-4 h-4" style={{ color: tokens.primaryColor }} />
            <input
              type="text"
              value={comp.fields.title || ''}
              onChange={e => onUpdateText('title', e.target.value)}
              className="bg-transparent border-0 font-bold w-40 outline-none"
              style={{ color: tokens.primaryColor }}
            />
          </div>
          <ul className="hidden md:flex gap-5 text-xs font-semibold select-none opacity-80">
            {(comp.fields.items || []).map((item: any, idx: number) => (
              <li key={idx}>{typeof item === 'string' ? item : (item?.title || item?.name || 'Link')}</li>
            ))}
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
          className={`${pyTop} ${pyBottom} ${mtTop} ${mbBottom} px-8 relative overflow-hidden flex items-center min-h-[400px]`}
          style={{ backgroundImage: `linear-gradient(135deg, ${tokens.backgroundColor}, ${tokens.primaryColor}08)` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-3xl mx-auto w-full">
            <div className="text-left">
              <input
                type="text"
                value={comp.fields.title || ''}
                onChange={e => onUpdateText('title', e.target.value)}
                className={`bg-transparent text-3xl md:text-4xl font-black w-full border-0 outline-none mb-4 ${headingFont}`}
                style={{ color: tokens.primaryColor }}
              />
              <textarea
                rows={3}
                value={comp.fields.subtitle || ''}
                onChange={e => onUpdateText('subtitle', e.target.value)}
                className="bg-transparent text-sm w-full border-0 outline-none opacity-90 leading-relaxed mb-6 resize-none"
              />
              <input
                type="text"
                value={comp.fields.ctaText || ''}
                onChange={e => onUpdateText('ctaText', e.target.value)}
                className={`bg-transparent px-5 py-2.5 text-xs font-bold text-center text-white border-0 outline-none shadow-lg cursor-pointer ${rounded}`}
                style={{ backgroundColor: tokens.primaryColor }}
              />
            </div>
            <div className={`aspect-video max-h-[300px] w-full overflow-hidden shadow-lg border border-slate-100 ${rounded}`}>
              <img src={comp.fields.imageUrl} alt="Hero Media" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      );

    case 'Features':
    case 'Services':
      return (
        <section className={`${pyTop} ${pyBottom} ${mtTop} ${mbBottom} px-8`} style={{ background: tokens.backgroundColor }}>
          <div className="max-w-3xl mx-auto">
            <input
              type="text"
              value={comp.fields.title || ''}
              onChange={e => onUpdateText('title', e.target.value)}
              className={`bg-transparent text-2xl font-black text-center w-full border-0 outline-none mb-10 ${headingFont}`}
              style={{ color: tokens.primaryColor }}
            />
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
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor }}>
          <div className="max-w-4xl mx-auto">
            <input
              type="text"
              value={comp.fields.title || ''}
              onChange={e => onUpdateText('title', e.target.value)}
              className={`bg-transparent text-2xl font-black text-center w-full border-0 outline-none mb-10 ${headingFont}`}
              style={{ color: tokens.primaryColor }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(comp.fields.items || []).map((p: any, idx: number) => (
                <div
                  key={idx}
                  className={`border overflow-hidden flex flex-col justify-between ${rounded} ${shadow}`}
                  style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}
                >
                  <div className="aspect-video bg-gray-150 relative">
                    <img src={p.img || p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex flex-col justify-between">
                    <div className="w-full p-6">
                      <div className="flex justify-between items-start gap-1 mb-2">
                        <h5 className="font-bold text-xs" style={{ color: tokens.primaryColor }}>{p.name}</h5>
                        <span className="text-xs font-bold shrink-0" style={{ color: tokens.accentColor }}>{p.price}</span>
                      </div>
                      <p className="text-[10px] opacity-70 leading-relaxed mb-4">{p.desc}</p>
                    </div>
                    <button className={`w-full py-1.5 border text-[11px] font-semibold ${rounded}`} style={{ borderColor: tokens.primaryColor, color: tokens.primaryColor }}>
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'Testimonials':
      return (
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor }}>
          <div className="max-w-4xl mx-auto">
            <input
              type="text"
              value={comp.fields.title || ''}
              onChange={e => onUpdateText('title', e.target.value)}
              className={`bg-transparent text-2xl font-black text-center w-full border-0 outline-none mb-10 ${headingFont}`}
              style={{ color: tokens.primaryColor }}
            />
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
                    <span className="text-[10px] opacity-50 block">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'Pricing':
      return (
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor }}>
          <div className="max-w-4xl mx-auto">
            <input
              type="text"
              value={comp.fields.title || ''}
              onChange={e => onUpdateText('title', e.target.value)}
              className={`bg-transparent text-2xl font-black text-center w-full border-0 outline-none mb-10 ${headingFont}`}
              style={{ color: tokens.primaryColor }}
            />
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
                      <span className="text-[10px] opacity-60">/{p.period}</span>
                    </div>
                    <ul className="space-y-1.5 mb-6 text-[10px] text-left">
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
        <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor }}>
          <div className="max-w-md mx-auto">
            <div className={`p-6 border ${rounded} ${shadow}`} style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}>
              <input
                type="text"
                value={comp.fields.title || ''}
                onChange={e => onUpdateText('title', e.target.value)}
                className={`bg-transparent text-xl font-bold text-center w-full border-0 outline-none mb-6 ${headingFont}`}
                style={{ color: tokens.primaryColor }}
              />
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <input type="text" placeholder="Full Name" className={`w-full px-3 py-2 text-xs border ${rounded}`} style={{ borderColor: tokens.primaryColor + '10' }} />
                <input type="email" placeholder="Email Address" className={`w-full px-3 py-2 text-xs border ${rounded}`} style={{ borderColor: tokens.primaryColor + '10' }} />
                <textarea placeholder="Message Content" rows={3} className={`w-full px-3 py-2 text-xs border ${rounded}`} style={{ borderColor: tokens.primaryColor + '10' }} />
                <input
                  type="text"
                  value={comp.fields.ctaText || ''}
                  onChange={e => onUpdateText('ctaText', e.target.value)}
                  className={`bg-transparent w-full py-2.5 text-xs font-semibold text-center text-white border-0 outline-none shadow-md ${rounded}`}
                  style={{ backgroundColor: tokens.primaryColor }}
                />
              </form>
            </div>
          </div>
        </section>
      );

    case 'Footer':
      return (
        <footer
          className="py-10 px-8 border-t text-center text-xs opacity-90 transition-colors"
          style={{ borderColor: tokens.primaryColor + '10', background: tokens.backgroundColor }}
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <input
              type="text"
              value={comp.fields.title || ''}
              onChange={e => onUpdateText('title', e.target.value)}
              className="bg-transparent border-0 text-slate-500 font-semibold w-64 outline-none"
            />
            <div className="flex gap-4 font-bold select-none text-slate-500">
              {(comp.fields.items || []).map((s: any, sIdx: number) => (
                <span key={sIdx}>{typeof s === 'string' ? s : (s?.title || s?.name || 'Link')}</span>
              ))}
            </div>
          </div>
        </footer>
      );

    default:
      return (
        <div className="py-12 border-b text-center text-slate-400 font-semibold text-xs bg-slate-50">
          Visual Rendering for {comp.type} Block
        </div>
      );
  }
};
