import React from 'react';
import * as Lucide from 'lucide-react';
import type { WebsiteComponent, ThemeConfig } from '../types';

// Dynamic icon resolver helper
const IconRenderer = ({ name, className = 'w-6 h-6', color }: { name: string; className?: string; color?: string }) => {
  const IconComponent = (Lucide as any)[name] || Lucide.Sparkles;
  return <IconComponent className={className} style={color ? { color } : {}} />;
};

interface ComponentRendererProps {
  component: WebsiteComponent;
  theme: ThemeConfig;
  activePageId: string;
  onNavigate?: (pageId: string) => void;
  onAddToCart?: (productName: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  theme,
  activePageId,
  onNavigate,
  onAddToCart,
  isSelected,
  onClick
}) => {
  const getStyles = () => {
    const fontClass = 
      theme.fontFamily === 'font-serif' ? 'font-serif' :
      theme.fontFamily === 'font-mono' ? 'font-mono' : 'font-sans';
    
    return {
      fontClass,
      borderRadiusClass: theme.borderRadius,
      glassmorphismStyle: theme.glassmorphism
        ? 'backdrop-blur-md bg-opacity-60 shadow-lg border border-white/10 border-t-white/20'
        : ''
    };
  };

  const { fontClass, borderRadiusClass, glassmorphismStyle } = getStyles();

  // Handle section wrapper border click (to select for edit/drag)
  const borderSelectClass = isSelected
    ? 'ring-4 ring-blue-500 ring-offset-2 scale-[0.99] transition-all relative group'
    : 'hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 transition-all relative group cursor-pointer';

  const wrapSection = (content: React.ReactNode) => {
    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        className={`${borderSelectClass} ${fontClass}`}
      >
        {/* Label badge */}
        <div className="absolute top-2 left-2 z-30 opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-3xs font-semibold px-2 py-0.5 rounded shadow transition-opacity flex items-center gap-1 cursor-move">
          <Lucide.GripVertical className="w-3 h-3" />
          {component.type} Section
        </div>
        {content}
      </div>
    );
  };

  switch (component.type) {
    case 'Navbar': {
      const logoText = component.fields.logoText?.value || 'Logo';
      const links = component.fields.links?.value || ['Home', 'About', 'Services', 'Products', 'Blog', 'Contact'];

      return wrapSection(
        <nav 
          className={`sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b transition-colors duration-200 ${glassmorphismStyle}`}
          style={{ 
            backgroundColor: theme.backgroundColor + (theme.glassmorphism ? 'ab' : 'ff'),
            borderColor: theme.primaryColor + '15',
            color: theme.textColor
          }}
        >
          <div className="flex items-center gap-2 font-extrabold text-lg select-none">
            <Lucide.Sparkles className="w-5 h-5 animate-pulse" style={{ color: theme.primaryColor }} />
            <span style={{ color: theme.primaryColor }}>{logoText}</span>
          </div>
          <ul className="hidden md:flex gap-6 text-sm font-semibold select-none">
            {links.map((link: string, idx: number) => {
              const targetPageId = link.toLowerCase().replace(/\s+/g, '');
              const isActive = activePageId === targetPageId || (activePageId === 'home' && link === 'Home');
              return (
                <li key={idx}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigate) {
                        onNavigate(targetPageId);
                      }
                    }}
                    className="hover:opacity-85 transition-opacity px-2 py-1 rounded"
                    style={isActive ? { borderBottom: `2px solid ${theme.primaryColor}`, color: theme.primaryColor } : {}}
                  >
                    {link}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-4 items-center">
            <button 
              className={`px-4 py-1.5 text-xs font-bold border transition-all hover:scale-105 ${borderRadiusClass}`}
              style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
              onClick={(e) => {
                e.stopPropagation();
                alert("Online order simulation!");
              }}
            >
              Order Online
            </button>
          </div>
        </nav>
      );
    }

    case 'Hero': {
      const headline = component.fields.headline?.value || 'SaaS Solution';
      const subheadline = component.fields.subheadline?.value || 'Tailored metrics booster.';
      const ctaText = component.fields.ctaText?.value || 'Explore Plans';
      const bgImage = component.fields.backgroundImage?.value || '';

      return wrapSection(
        <section 
          className="relative min-h-[500px] flex items-center py-20 bg-cover bg-center overflow-hidden transition-all duration-300"
          style={{ 
            backgroundImage: bgImage 
              ? `linear-gradient(to right, ${theme.backgroundColor}f5, ${theme.backgroundColor}80), url('${bgImage}')` 
              : `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.primaryColor}10)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-8 relative z-10 w-full">
            <h1 
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6 animate-fade-in"
              style={{ color: theme.primaryColor }}
            >
              {headline}
            </h1>
            <p 
              className="text-base md:text-lg mb-8 leading-relaxed max-w-2xl opacity-90"
              style={{ color: theme.textColor }}
            >
              {subheadline}
            </p>
            <button 
              className={`px-8 py-3.5 font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-white ${borderRadiusClass}`}
              style={{ backgroundColor: theme.primaryColor }}
              onClick={(e) => {
                e.stopPropagation();
                const nextTab = activePageId === 'home' ? 'products' : 'contact';
                if (onNavigate) onNavigate(nextTab);
              }}
            >
              {ctaText}
            </button>
          </div>
        </section>
      );
    }

    case 'Cards': {
      const sectionTitle = component.fields.sectionTitle?.value || 'Features';
      const cards = component.fields.cardItems?.value || [];

      return wrapSection(
        <section className="py-20 px-8 transition-colors duration-200" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-12" style={{ color: theme.primaryColor }}>
              {sectionTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((c: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-6 border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${borderRadiusClass} ${glassmorphismStyle}`}
                  style={{ 
                    backgroundColor: theme.backgroundColor + '30',
                    borderColor: theme.primaryColor + '15',
                    color: theme.textColor
                  }}
                >
                  <div>
                    <div className="w-12 h-12 flex items-center justify-center mb-5 rounded-xl" style={{ backgroundColor: theme.primaryColor + '10' }}>
                      <IconRenderer name={c.icon} className="w-6 h-6" color={theme.primaryColor} />
                    </div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: theme.primaryColor }}>{c.title}</h3>
                    <p className="text-sm opacity-80 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Products': {
      const sectionTitle = component.fields.sectionTitle?.value || 'Featured Products';
      const products = component.fields.productItems?.value || [];

      return wrapSection(
        <section className="py-20 px-8 transition-colors duration-200" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-12" style={{ color: theme.primaryColor }}>
              {sectionTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`border overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-between ${borderRadiusClass} ${glassmorphismStyle}`}
                  style={{ 
                    backgroundColor: theme.backgroundColor,
                    borderColor: theme.primaryColor + '15',
                    color: theme.textColor
                  }}
                >
                  <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                    {p.img || p.image ? (
                      <img src={p.img || p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs text-gray-500">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-2">
                        <h4 className="font-bold text-sm" style={{ color: theme.primaryColor }}>{p.name}</h4>
                        <span className="text-sm font-bold shrink-0" style={{ color: theme.accentColor }}>{p.price}</span>
                      </div>
                      <p className="text-2xs opacity-75 leading-relaxed mb-4">{p.desc || p.description}</p>
                    </div>
                    <button 
                      className={`w-full py-2 text-xs font-semibold border transition-all duration-200 hover:text-white ${borderRadiusClass}`}
                      style={{ 
                        borderColor: theme.primaryColor, 
                        color: theme.primaryColor,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.primaryColor;
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme.primaryColor;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddToCart) onAddToCart(p.name);
                      }}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Forms': {
      const sectionTitle = component.fields.sectionTitle?.value || 'Contact Form';
      const fields = component.fields.formFields?.value || [];
      const submitText = component.fields.submitText?.value || 'Send';

      return wrapSection(
        <section className="py-20 px-8 transition-colors duration-200" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="max-w-md mx-auto">
            <div className={`p-8 border shadow-lg ${borderRadiusClass} ${glassmorphismStyle}`} style={{ backgroundColor: theme.backgroundColor + '60', borderColor: theme.primaryColor + '15' }}>
              <h2 className="text-2xl font-bold text-center mb-8" style={{ color: theme.primaryColor }}>{sectionTitle}</h2>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Form submitted successfully!"); }}>
                {fields.map((f: any, idx: number) => (
                  <div key={idx}>
                    <label className="block text-2xs font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.primaryColor }}>{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea 
                        rows={3} 
                        placeholder={f.placeholder} 
                        className={`w-full px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-opacity-50 ${borderRadiusClass}`}
                        style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor + '20', color: theme.textColor }}
                      />
                    ) : (
                      <input 
                        type={f.type} 
                        placeholder={f.placeholder} 
                        className={`w-full px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-opacity-50 ${borderRadiusClass}`}
                        style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor + '20', color: theme.textColor }}
                      />
                    )}
                  </div>
                ))}
                <button 
                  type="submit" 
                  className={`w-full py-3 text-sm font-bold shadow transition-all hover:opacity-90 text-white ${borderRadiusClass}`}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {submitText}
                </button>
              </form>
            </div>
          </div>
        </section>
      );
    }

    case 'Testimonials': {
      const sectionTitle = component.fields.sectionTitle?.value || 'Testimonials';
      const testimonials = component.fields.testimonialsList?.value || [];

      return wrapSection(
        <section className="py-20 px-8 transition-colors duration-200" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-12" style={{ color: theme.primaryColor }}>
              {sectionTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-6 border flex flex-col justify-between ${borderRadiusClass} ${glassmorphismStyle}`}
                  style={{ 
                    backgroundColor: theme.backgroundColor + '20',
                    borderColor: theme.primaryColor + '15',
                    color: theme.textColor
                  }}
                >
                  <p className="text-sm italic mb-6 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar && (
                      <img src={t.avatar} className="w-10 h-10 rounded-full object-cover" alt={t.author} />
                    )}
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: theme.primaryColor }}>{t.author}</h4>
                      <p className="text-xs opacity-60">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Pricing': {
      const sectionTitle = component.fields.sectionTitle?.value || 'Pricing Plans';
      const plans = component.fields.plansList?.value || [];

      return wrapSection(
        <section className="py-20 px-8 transition-colors duration-200" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-12" style={{ color: theme.primaryColor }}>
              {sectionTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((p: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-8 border flex flex-col justify-between relative shadow-sm hover:scale-[1.01] transition-transform duration-200 ${borderRadiusClass} ${glassmorphismStyle}`}
                  style={{ 
                    backgroundColor: theme.backgroundColor,
                    borderColor: p.popular ? theme.primaryColor : theme.primaryColor + '15',
                    color: theme.textColor
                  }}
                >
                  {p.popular && (
                    <span 
                      className="absolute top-0 right-6 transform -translate-y-1/2 px-2.5 py-0.5 text-3xs font-black uppercase tracking-wider rounded-full text-white"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: theme.primaryColor }}>{p.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black">{p.price}</span>
                      <span className="text-xs opacity-60">/{p.period}</span>
                    </div>
                    <ul className="space-y-2.5 mb-8 text-xs">
                      {p.features.map((f: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <Lucide.Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="opacity-80">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    className={`w-full py-2.5 text-xs font-bold transition-all ${borderRadiusClass}`}
                    style={{ 
                      backgroundColor: p.popular ? theme.primaryColor : 'transparent',
                      color: p.popular ? '#ffffff' : theme.primaryColor,
                      border: `2px solid ${theme.primaryColor}`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Billing simulator: Selected plan ${p.name}`);
                    }}
                  >
                    {p.btnText || 'Choose Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Footer': {
      const copyright = component.fields.copyright?.value || 'Copyright';
      const socials = component.fields.socials?.value || [];

      return wrapSection(
        <footer 
          className="py-10 px-8 border-t text-center text-xs opacity-90 transition-colors duration-200"
          style={{ 
            backgroundColor: theme.backgroundColor, 
            borderColor: theme.primaryColor + '15',
            color: theme.textColor
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 select-none">
            <p>{copyright}</p>
            <div className="flex items-center gap-4 font-semibold">
              {socials.map((s: string, idx: number) => (
                <a key={idx} href="#" className="hover:opacity-75 transition-opacity">{s}</a>
              ))}
            </div>
          </div>
        </footer>
      );
    }

    default:
      return null;
  }
};
