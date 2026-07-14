import React from "react";
import * as Lucide from "lucide-react";
import type { ComponentBlock, DesignTokens } from "../../types/builder";
import { useCartStore } from "../../store/useCartStore";
import { useParams } from "react-router-dom";
export const CleanBlockRenderer = ({
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
      const pyTop = comp.styles?.paddingTop || tokens.paddingTop;
      const pyBottom = comp.styles?.paddingBottom || tokens.paddingBottom;

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
            <ProductsCartBlock
              comp={comp}
              tokens={tokens}
              headingFont={headingFont}
              pyTop={pyTop}
              pyBottom={pyBottom}
              rounded={rounded}
              shadow={shadow}
            />
          );

        case 'Testimonials':
          return (
            <section className={`${pyTop} ${pyBottom} px-8`} style={{ background: tokens.backgroundColor, color: tokens.textColor }}>
              <div className="max-w-5xl mx-auto">
                <h2 className={`text-2xl font-black text-center mb-10 ${headingFont}`} style={{ color: tokens.primaryColor }}>
                  {comp.fields.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

// Products block with real Add to Cart
const ProductsCartBlock = ({
  comp,
  tokens,
  headingFont,
  pyTop,
  pyBottom,
  rounded,
  shadow,
}: {
  comp: ComponentBlock;
  tokens: DesignTokens;
  headingFont: string;
  pyTop: string;
  pyBottom: string;
  rounded: string;
  shadow: string;
}) => {
  const { addToCart, getCartCount } = useCartStore();
  const { siteId } = useParams<{ siteId?: string }>();
  const cartCount = getCartCount();

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
                  onClick={() => addToCart({
                    id: `${p.name}-${idx}`,
                    name: p.name,
                    price: p.price,
                    image: p.img || p.image,
                    siteId: siteId || 'default',
                  })}
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
