import type { WebsiteProject, WebPage, ComponentBlock, DesignTokens } from '../types/builder';

// Escape helper for text going into HTML
const esc = (s: any): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Escape for values placed inside single-quoted JS/HTML attributes
const jsEsc = (s: any): string =>
  String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');

const radiusToPx = (r: string): string => {
  switch (r) {
    case 'rounded-none': return '0px';
    case 'rounded-sm': return '2px';
    case 'rounded-md': return '6px';
    case 'rounded-lg': return '8px';
    case 'rounded-xl': return '12px';
    case 'rounded-2xl': return '16px';
    case 'rounded-3xl': return '24px';
    case 'rounded-full': return '9999px';
    default: return '8px';
  }
};

const shadowToCss = (s: string): string => {
  switch (s) {
    case 'shadow-none': return 'none';
    case 'shadow-sm': return '0 1px 2px rgba(0,0,0,0.05)';
    case 'shadow-md': return '0 4px 6px -1px rgba(0,0,0,0.1)';
    case 'shadow-lg': return '0 10px 15px -3px rgba(0,0,0,0.1)';
    case 'shadow-xl': return '0 20px 25px -5px rgba(0,0,0,0.1)';
    case 'shadow-2xl': return '0 25px 50px -12px rgba(0,0,0,0.25)';
    default: return '0 4px 6px -1px rgba(0,0,0,0.1)';
  }
};

const fontFace = (f: string): string => {
  if (f === 'font-serif') return "'Playfair Display', Georgia, serif";
  if (f === 'font-mono') return "'Fira Code', ui-monospace, monospace";
  return "'Inter', system-ui, -apple-system, sans-serif";
};

const fontLink = (f: string): string => {
  if (f === 'font-serif') return '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet">';
  if (f === 'font-mono') return '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&display=swap" rel="stylesheet">';
  return '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">';
};

// Very small subset of Tailwind spacing → px used by the builder
const spacingMap: Record<string, string> = {
  'py-0': '0px', 'py-4': '16px', 'py-6': '24px', 'py-8': '32px',
  'py-12': '48px', 'py-16': '64px', 'py-20': '80px', 'py-24': '96px',
  'pt-0': '0px', 'pt-4': '16px', 'pt-6': '24px', 'pt-8': '32px',
  'pt-12': '48px', 'pt-16': '64px', 'pt-20': '80px', 'pt-24': '96px',
  'pb-0': '0px', 'pb-4': '16px', 'pb-6': '24px', 'pb-8': '32px',
  'pb-12': '48px', 'pb-16': '64px', 'pb-20': '80px', 'pb-24': '96px',
};
const sp = (cls: string, fallback = '48px'): string => spacingMap[cls] || fallback;

const renderComponent = (comp: ComponentBlock, tokens: DesignTokens): string => {
  const radius = radiusToPx(tokens.borderRadius);
  const shadow = shadowToCss(tokens.boxShadow);
  const pt = sp(comp.styles?.paddingTop || tokens.paddingTop, '64px');
  const pb = sp(comp.styles?.paddingBottom || tokens.paddingBottom, '64px');
  const primary = tokens.primaryColor;
  const bg = tokens.backgroundColor;
  const text = tokens.textColor;
  const accent = tokens.accentColor;

  // Support custom HTML blocks
  if (comp.customCode?.html) {
    return `<section style="padding:${pt} 24px ${pb} 24px;">${comp.customCode.html}</section>`;
  }

  const f = comp.fields || {};

  switch (comp.type) {
    case 'Navbar': {
      const title = esc(f.title || 'Brand');
      const items: any[] = (f.items as any[]) || [];
      const links = items.map((it) => {
        const label = typeof it === 'string' ? it : (it?.title || it?.name || 'Link');
        return `<li><a href="#" class="hover:opacity-80 text-sm font-semibold" style="color:${text}">${esc(label)}</a></li>`;
      }).join('');
      return `
<nav class="sticky top-0 z-40 border-b backdrop-blur" style="background:${bg}dd;border-color:${primary}20;">
  <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-2 font-extrabold" style="color:${primary}">
      <span>${title}</span>
    </div>
    <ul class="hidden md:flex items-center gap-6">${links}</ul>
    <button class="relative p-2 rounded-full hover:bg-black/5" onclick="window.__brixoOpenCart()" style="color:${primary}" aria-label="Open cart">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 10a4 4 0 0 1-8 0"/></svg>
      <span id="brixo-cart-badge" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style="background:${accent};display:none">0</span>
    </button>
  </div>
</nav>`;
    }

    case 'Hero': {
      const title = esc(f.title || 'Welcome');
      const subtitle = esc(f.subtitle || '');
      const cta = esc(f.ctaText || 'Get Started');
      const img = esc(f.imageUrl || 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=1200&q=80');
      return `
<section style="padding:${pt} 24px ${pb} 24px;background:linear-gradient(135deg, ${bg}, ${primary}10);color:${text}">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
    <div>
      <h1 class="text-4xl md:text-5xl font-black leading-tight mb-4" style="color:${primary}">${title}</h1>
      <p class="text-base md:text-lg opacity-90 mb-6 leading-relaxed">${subtitle}</p>
      <a href="#contact" class="inline-block px-6 py-3 font-bold text-white shadow-lg" style="background:${primary};border-radius:${radius}">${cta}</a>
    </div>
    <div class="w-full aspect-video overflow-hidden shadow-xl" style="border-radius:${radius};box-shadow:${shadow}">
      <img src="${img}" alt="Hero" class="w-full h-full object-cover"/>
    </div>
  </div>
</section>`;
    }

    case 'Features':
    case 'Services': {
      const title = esc(f.title || 'Our Services');
      const items = ((f.items as any[]) || []).map((it) => `
        <div class="p-6 border" style="border-color:${primary}20;background:${bg};border-radius:${radius};box-shadow:${shadow}">
          <div class="w-10 h-10 flex items-center justify-center mb-4" style="background:${primary}15;color:${primary};border-radius:${radius}">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg>
          </div>
          <h4 class="font-bold text-base mb-2" style="color:${primary}">${esc(it.title)}</h4>
          <p class="text-sm opacity-80 leading-relaxed">${esc(it.desc || it.description || '')}</p>
        </div>`).join('');
      return `
<section style="padding:${pt} 24px ${pb} 24px;background:${bg};color:${text}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-black text-center mb-10" style="color:${primary}">${title}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${items}</div>
  </div>
</section>`;
    }

    case 'Products': {
      const title = esc(f.title || 'Our Products');
      const items = ((f.items as any[]) || []).map((p, idx) => {
        const name = jsEsc(p.name);
        const price = jsEsc(p.price);
        const img = esc(p.img || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
        return `
        <div class="border overflow-hidden flex flex-col" style="border-color:${primary}15;background:${bg};border-radius:${radius};box-shadow:${shadow}">
          <div class="aspect-video overflow-hidden bg-gray-100">
            <img src="${img}" alt="${esc(p.name)}" class="w-full h-full object-cover"/>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start gap-2 mb-2">
                <h5 class="font-bold text-base" style="color:${primary}">${esc(p.name)}</h5>
                <span class="font-bold text-base" style="color:${accent}">${esc(p.price)}</span>
              </div>
              <p class="text-xs opacity-75 leading-relaxed mb-4">${esc(p.desc || p.description || '')}</p>
            </div>
            <button type="button"
              class="w-full py-2.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              style="border:1px solid ${primary};color:${primary};background:transparent;border-radius:${radius}"
              onmouseover="this.style.background='${primary}';this.style.color='#fff'"
              onmouseout="this.style.background='transparent';this.style.color='${primary}'"
              onclick="window.__brixoAddToCart({id:'p-${idx}-${jsEsc(p.name)}',name:'${name}',price:'${price}',image:'${jsEsc(img)}'})">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 10a4 4 0 0 1-8 0"/></svg>
              Add to Cart
            </button>
          </div>
        </div>`;
      }).join('');
      return `
<section style="padding:${pt} 24px ${pb} 24px;background:${bg};color:${text}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-black text-center mb-10" style="color:${primary}">${title}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${items}</div>
  </div>
</section>`;
    }

    case 'Testimonials': {
      const title = esc(f.title || 'What Our Clients Say');
      const items = ((f.items as any[]) || []).map((t) => `
        <div class="p-6 border" style="border-color:${primary}15;background:${bg};border-radius:${radius};box-shadow:${shadow}">
          <p class="italic opacity-90 leading-relaxed mb-4">"${esc(t.quote)}"</p>
          <div>
            <h5 class="font-bold text-sm" style="color:${primary}">${esc(t.author)}</h5>
            <span class="text-xs opacity-60">${esc(t.role || '')}</span>
          </div>
        </div>`).join('');
      return `
<section style="padding:${pt} 24px ${pb} 24px;background:${bg};color:${text}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-black text-center mb-10" style="color:${primary}">${title}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${items}</div>
  </div>
</section>`;
    }

    case 'Pricing': {
      const title = esc(f.title || 'Pricing');
      const items = ((f.items as any[]) || []).map((p, idx) => {
        const feats = ((p.features as string[]) || []).map((ft) =>
          `<li class="flex items-center gap-2 text-sm"><span style="color:#10b981">✓</span> ${esc(ft)}</li>`).join('');
        return `
        <div class="p-6 border flex flex-col justify-between" style="border-color:${primary}20;background:${bg};border-radius:${radius};box-shadow:${shadow}">
          <div>
            <h4 class="font-bold text-lg mb-2" style="color:${primary}">${esc(p.name)}</h4>
            <div class="flex items-baseline gap-1 mb-4"><span class="text-3xl font-black">${esc(p.price)}</span><span class="text-xs opacity-60">/${esc(p.period || 'mo')}</span></div>
            <ul class="space-y-2 mb-6">${feats}</ul>
          </div>
          <button type="button" class="w-full py-3 font-bold text-white cursor-pointer" style="background:${primary};border-radius:${radius}"
            onclick="window.__brixoAddToCart({id:'plan-${idx}-${jsEsc(p.name)}',name:'${jsEsc(p.name)} Plan',price:'${jsEsc(p.price)}',image:''})">
            Choose Plan
          </button>
        </div>`;
      }).join('');
      return `
<section style="padding:${pt} 24px ${pb} 24px;background:${bg};color:${text}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-black text-center mb-10" style="color:${primary}">${title}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${items}</div>
  </div>
</section>`;
    }

    case 'ContactForm': {
      const title = esc(f.title || 'Contact Us');
      const cta = esc(f.ctaText || 'Send Message');
      return `
<section id="contact" style="padding:${pt} 24px ${pb} 24px;background:${bg};color:${text}">
  <div class="max-w-lg mx-auto p-6 border" style="border-color:${primary}20;border-radius:${radius};box-shadow:${shadow}">
    <h2 class="text-2xl font-bold text-center mb-6" style="color:${primary}">${title}</h2>
    <form onsubmit="event.preventDefault(); window.__brixoNotify('Message sent successfully! We will get back to you soon.'); this.reset();" class="space-y-4">
      <input required type="text" placeholder="Full Name" class="w-full px-4 py-3 border outline-none" style="border-color:${primary}30;background:${bg};color:${text};border-radius:${radius}"/>
      <input required type="email" placeholder="Email" class="w-full px-4 py-3 border outline-none" style="border-color:${primary}30;background:${bg};color:${text};border-radius:${radius}"/>
      <textarea required placeholder="Message" rows="4" class="w-full px-4 py-3 border outline-none" style="border-color:${primary}30;background:${bg};color:${text};border-radius:${radius}"></textarea>
      <button type="submit" class="w-full py-3 font-bold text-white" style="background:${primary};border-radius:${radius}">${cta}</button>
    </form>
  </div>
</section>`;
    }

    case 'Footer': {
      const items = ((f.items as any[]) || []).map((s) => {
        const label = typeof s === 'string' ? s : (s?.title || s?.name || 'Link');
        return `<a href="#" class="hover:opacity-80 text-sm">${esc(label)}</a>`;
      }).join('');
      return `
<footer class="border-t py-10 px-6 text-center" style="border-color:${primary}15;background:${bg};color:${text}">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="text-sm opacity-80">${esc(f.title || '© 2026 All rights reserved.')}</div>
    <div class="flex gap-5 opacity-80">${items}</div>
  </div>
</footer>`;
    }

    default:
      return `<section style="padding:${pt} 24px ${pb} 24px;color:${text}"><div class="max-w-6xl mx-auto opacity-70 text-sm">[${esc(comp.type)}]</div></section>`;
  }
};

const renderPage = (page: WebPage, tokens: DesignTokens): string => {
  return (page.components || []).map((c) => renderComponent(c, tokens)).join('\n');
};

export const generatePublishedHTML = (project: WebsiteProject): string => {
  const tokens = project.config.designTokens;
  const pages = project.config.pages || [];
  const primary = tokens.primaryColor;
  const accent = tokens.accentColor;
  const bg = tokens.backgroundColor;
  const text = tokens.textColor;
  const radius = radiusToPx(tokens.borderRadius);

  // Multi-page: single doc with tabs at top switching visible page
  const pageNav = pages.length > 1
    ? `<div class="w-full border-b" style="border-color:${primary}15;background:${bg}"><div class="max-w-6xl mx-auto px-6 h-10 flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
        ${pages.map((p, i) => `<button data-page-idx="${i}" class="brixo-page-tab opacity-50 hover:opacity-100" style="color:${text}">${esc(p.name)}</button>`).join('')}
      </div></div>`
    : '';

  const pagesHTML = pages.map((page, i) => `
    <div class="brixo-page" data-page-idx="${i}" style="display:${i === 0 ? 'block' : 'none'}">
      ${renderPage(page, tokens)}
    </div>`).join('');

  const title = esc(project.name || 'My Website');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLink(tokens.fontFamily)}
<style>
  html,body{margin:0;padding:0;background:${bg};color:${text};font-family:${fontFace(tokens.fontFamily)}}
  *{box-sizing:border-box}
  button{font-family:inherit}
  .brixo-drawer{transition:transform .3s ease}
  .brixo-drawer.closed{transform:translateX(100%)}
  .brixo-backdrop{transition:opacity .3s ease}
  .brixo-backdrop.hidden{opacity:0;pointer-events:none}
  .brixo-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);opacity:0;background:#111827;color:#fff;padding:12px 20px;border-radius:${radius};font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.3);z-index:200;transition:all .3s ease;pointer-events:none}
  .brixo-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
${pageNav}
<main>${pagesHTML}</main>

<!-- CART DRAWER -->
<div id="brixo-backdrop" class="brixo-backdrop hidden" style="position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);z-index:100" onclick="window.__brixoCloseCart()"></div>
<aside id="brixo-drawer" class="brixo-drawer closed" style="position:fixed;top:0;right:0;height:100%;width:100%;max-width:420px;background:#0f172a;color:#e2e8f0;box-shadow:-10px 0 40px rgba(0,0,0,.4);z-index:101;display:flex;flex-direction:column">
  <header style="padding:20px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between">
    <div>
      <div style="font-weight:800;font-size:16px">Your Cart</div>
      <div id="brixo-cart-count" style="font-size:11px;opacity:.6">0 items</div>
    </div>
    <button onclick="window.__brixoCloseCart()" aria-label="Close" style="background:transparent;border:0;color:#94a3b8;cursor:pointer;font-size:22px;line-height:1">×</button>
  </header>
  <div id="brixo-cart-items" style="flex:1;overflow-y:auto;padding:20px"></div>
  <footer id="brixo-cart-footer" style="padding:20px;border-top:1px solid #1e293b;display:none">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;opacity:.7">Subtotal</span>
      <span id="brixo-cart-subtotal" style="font-size:22px;font-weight:900">$0.00</span>
    </div>
    <button onclick="window.__brixoCheckout()" style="width:100%;padding:14px;background:${primary};color:#fff;border:0;border-radius:${radius};font-weight:800;font-size:14px;cursor:pointer">
      Proceed to Checkout
    </button>
  </footer>
</aside>

<div id="brixo-toast" class="brixo-toast">Added to cart</div>

<!-- CHECKOUT MODAL -->
<div id="brixo-checkout-backdrop" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);z-index:200;align-items:center;justify-content:center;padding:20px" onclick="if(event.target===this)window.__brixoCloseCheckout()">
  <div style="background:#0f172a;color:#e2e8f0;border-radius:${radius};max-width:520px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,.6)">
    <header style="padding:20px 24px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-weight:800;font-size:18px">Checkout</div>
        <div id="brixo-checkout-total" style="font-size:12px;opacity:.7;margin-top:2px">Total $0.00</div>
      </div>
      <button onclick="window.__brixoCloseCheckout()" aria-label="Close" style="background:transparent;border:0;color:#94a3b8;cursor:pointer;font-size:24px;line-height:1">×</button>
    </header>
    <div style="padding:24px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.6;margin-bottom:10px">Contact</div>
      <input id="brixo-co-email" type="email" placeholder="Email address" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid #334155;color:#fff;border-radius:${radius};margin-bottom:14px;font-size:14px;box-sizing:border-box" />
      <input id="brixo-co-name" type="text" placeholder="Full name" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid #334155;color:#fff;border-radius:${radius};margin-bottom:14px;font-size:14px;box-sizing:border-box" />
      <input id="brixo-co-address" type="text" placeholder="Shipping address" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid #334155;color:#fff;border-radius:${radius};margin-bottom:20px;font-size:14px;box-sizing:border-box" />

      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.6;margin-bottom:10px">Payment Method</div>
      <div id="brixo-pay-methods" style="display:grid;gap:10px;margin-bottom:18px">
        <label class="brixo-pay-opt" data-method="card" style="display:flex;align-items:center;gap:12px;padding:14px;background:#1e293b;border:2px solid ${primary};border-radius:${radius};cursor:pointer">
          <input type="radio" name="brixo-pay" value="card" checked style="accent-color:${primary}" />
          <span style="font-size:20px">💳</span>
          <span style="font-weight:700;font-size:14px">Credit / Debit Card</span>
        </label>
        <label class="brixo-pay-opt" data-method="paypal" style="display:flex;align-items:center;gap:12px;padding:14px;background:#1e293b;border:2px solid #334155;border-radius:${radius};cursor:pointer">
          <input type="radio" name="brixo-pay" value="paypal" style="accent-color:${primary}" />
          <span style="font-size:20px">🅿️</span>
          <span style="font-weight:700;font-size:14px">PayPal</span>
        </label>
        <label class="brixo-pay-opt" data-method="apple" style="display:flex;align-items:center;gap:12px;padding:14px;background:#1e293b;border:2px solid #334155;border-radius:${radius};cursor:pointer">
          <input type="radio" name="brixo-pay" value="apple" style="accent-color:${primary}" />
          <span style="font-size:20px"></span>
          <span style="font-weight:700;font-size:14px">Apple Pay</span>
        </label>
        <label class="brixo-pay-opt" data-method="cod" style="display:flex;align-items:center;gap:12px;padding:14px;background:#1e293b;border:2px solid #334155;border-radius:${radius};cursor:pointer">
          <input type="radio" name="brixo-pay" value="cod" style="accent-color:${primary}" />
          <span style="font-size:20px">💵</span>
          <span style="font-weight:700;font-size:14px">Cash on Delivery</span>
        </label>
      </div>

      <div id="brixo-card-fields">
        <input id="brixo-cc-num" type="text" inputmode="numeric" placeholder="Card number  •  1234 5678 9012 3456" maxlength="19" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid #334155;color:#fff;border-radius:${radius};margin-bottom:12px;font-size:14px;box-sizing:border-box;letter-spacing:2px" />
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">
          <input id="brixo-cc-exp" type="text" placeholder="MM / YY" maxlength="7" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid #334155;color:#fff;border-radius:${radius};font-size:14px;box-sizing:border-box" />
          <input id="brixo-cc-cvc" type="text" inputmode="numeric" placeholder="CVC" maxlength="4" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid #334155;color:#fff;border-radius:${radius};font-size:14px;box-sizing:border-box" />
        </div>
      </div>

      <button id="brixo-pay-btn" onclick="window.__brixoPay()" style="width:100%;padding:14px;background:${primary};color:#fff;border:0;border-radius:${radius};font-weight:800;font-size:14px;cursor:pointer">
        Pay Now
      </button>
      <p style="text-align:center;font-size:11px;opacity:.5;margin:12px 0 0">🔒 checkout — payment is processed</p>
    </div>
  </div>
</div>

<script>
(function(){
  var STORAGE_KEY = 'brixo_cart_${jsEsc(project.id)}';
  var state = { items: [] };
  try { state.items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') || []; } catch(e) {}

  function save(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch(e) {} }

  function parsePrice(p){
    if (typeof p === 'number') return p;
    var m = String(p||'').replace(/,/g,'').match(/-?\\d+(?:\\.\\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  }

  function count(){ return state.items.reduce(function(a,b){ return a + b.qty; }, 0); }
  function total(){ return state.items.reduce(function(a,b){ return a + parsePrice(b.price) * b.qty; }, 0); }

  function renderBadge(){
    var el = document.getElementById('brixo-cart-badge');
    if (!el) return;
    var n = count();
    el.textContent = n > 99 ? '99+' : String(n);
    el.style.display = n > 0 ? 'flex' : 'none';
  }

  function renderItems(){
    var wrap = document.getElementById('brixo-cart-items');
    var footer = document.getElementById('brixo-cart-footer');
    var countEl = document.getElementById('brixo-cart-count');
    var subEl = document.getElementById('brixo-cart-subtotal');
    if (!wrap) return;
    if (state.items.length === 0){
      wrap.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;opacity:.5;text-align:center;padding:40px 20px"><div style="font-size:48px;margin-bottom:12px">🛒</div><div style="font-weight:700">Your cart is empty</div><div style="font-size:12px;opacity:.7;margin-top:4px">Add products to get started</div></div>';
      footer.style.display = 'none';
    } else {
      wrap.innerHTML = state.items.map(function(it, idx){
        var img = it.image ? '<img src="'+it.image+'" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0"/>' : '<div style="width:64px;height:64px;background:#1e293b;border-radius:8px;flex-shrink:0"></div>';
        return '<div style="display:flex;gap:12px;padding:12px;background:#020617;border:1px solid #1e293b;border-radius:12px;margin-bottom:10px">'+img+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHTML(it.name)+'</div>'+
            '<div style="color:'+'${accent}'+';font-weight:800;font-size:13px;margin-top:2px">'+escapeHTML(it.price)+'</div>'+
            '<div style="display:flex;gap:6px;align-items:center;margin-top:8px">'+
              '<button data-act="dec" data-i="'+idx+'" style="width:26px;height:26px;background:#1e293b;color:#cbd5e1;border:0;border-radius:6px;cursor:pointer;font-weight:700">−</button>'+
              '<span style="min-width:24px;text-align:center;font-weight:700;font-size:13px">'+it.qty+'</span>'+
              '<button data-act="inc" data-i="'+idx+'" style="width:26px;height:26px;background:#1e293b;color:#cbd5e1;border:0;border-radius:6px;cursor:pointer;font-weight:700">+</button>'+
              '<button data-act="del" data-i="'+idx+'" style="margin-left:auto;background:transparent;color:#94a3b8;border:0;cursor:pointer;font-size:12px">Remove</button>'+
            '</div>'+
          '</div>'+
        '</div>';
      }).join('');
      footer.style.display = 'block';
    }
    countEl.textContent = count() + ' item' + (count() === 1 ? '' : 's');
    subEl.textContent = '$' + total().toFixed(2);
    renderBadge();
  }

  function escapeHTML(s){
    return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; });
  }

  function toast(msg){
    var t = document.getElementById('brixo-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window.__brixoToastT);
    window.__brixoToastT = setTimeout(function(){ t.classList.remove('show'); }, 1800);
  }

  window.__brixoAddToCart = function(item){
    var existing = state.items.find(function(x){ return x.id === item.id; });
    if (existing) { existing.qty += 1; }
    else { state.items.push({ id: item.id, name: item.name, price: item.price, image: item.image || '', qty: 1 }); }
    save();
    renderItems();
    toast(item.name + ' added to cart');
    window.__brixoOpenCart();
  };

  window.__brixoOpenCart = function(){
    document.getElementById('brixo-drawer').classList.remove('closed');
    document.getElementById('brixo-backdrop').classList.remove('hidden');
    renderItems();
  };
  window.__brixoCloseCart = function(){
    document.getElementById('brixo-drawer').classList.add('closed');
    document.getElementById('brixo-backdrop').classList.add('hidden');
  };

  window.__brixoCheckout = function(){
    if (state.items.length === 0) return;
    window.__brixoCloseCart();
    var modal = document.getElementById('brixo-checkout-backdrop');
    document.getElementById('brixo-checkout-total').textContent = 'Total $' + total().toFixed(2) + ' • ' + count() + ' item' + (count()===1?'':'s');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.__brixoCloseCheckout = function(){
    document.getElementById('brixo-checkout-backdrop').style.display = 'none';
    document.body.style.overflow = '';
  };

  // Payment method switching
  document.addEventListener('change', function(e){
    if (e.target && e.target.name === 'brixo-pay') {
      var method = e.target.value;
      document.querySelectorAll('.brixo-pay-opt').forEach(function(opt){
        opt.style.borderColor = opt.getAttribute('data-method') === method ? '${primary}' : '#334155';
      });
      document.getElementById('brixo-card-fields').style.display = method === 'card' ? 'block' : 'none';
      var labels = { card:'Pay Now', paypal:'Continue with PayPal', apple:'Pay with Apple Pay', cod:'Place Order' };
      document.getElementById('brixo-pay-btn').textContent = labels[method] || 'Pay Now';
    }
  });

  // Card number formatting
  document.addEventListener('input', function(e){
    if (e.target && e.target.id === 'brixo-cc-num') {
      var v = e.target.value.replace(/\\D/g,'').slice(0,16);
      e.target.value = v.replace(/(.{4})/g,'$1 ').trim();
    }
    if (e.target && e.target.id === 'brixo-cc-exp') {
      var v = e.target.value.replace(/\\D/g,'').slice(0,4);
      e.target.value = v.length > 2 ? v.slice(0,2) + ' / ' + v.slice(2) : v;
    }
  });

  window.__brixoPay = function(){
    var email = (document.getElementById('brixo-co-email')||{}).value || '';
    var name = (document.getElementById('brixo-co-name')||{}).value || '';
    var addr = (document.getElementById('brixo-co-address')||{}).value || '';
    var method = (document.querySelector('input[name=brixo-pay]:checked')||{}).value || 'card';
    if (!email || !name || !addr) { toast('Please fill in your contact & shipping details'); return; }
    if (method === 'card') {
      var num = (document.getElementById('brixo-cc-num')||{}).value.replace(/\\s/g,'');
      var exp = (document.getElementById('brixo-cc-exp')||{}).value;
      var cvc = (document.getElementById('brixo-cc-cvc')||{}).value;
      if (num.length < 13 || !exp || !cvc) { toast('Please enter valid card details'); return; }
    }
    var btn = document.getElementById('brixo-pay-btn');
    var orig = btn.textContent;
    btn.textContent = 'Processing…'; btn.disabled = true;
    setTimeout(function(){
      var t = total().toFixed(2);
      var n = count();
      var orderId = 'ORD-' + Math.random().toString(36).slice(2,8).toUpperCase();
      fetch("https://brixo-2-0.onrender.com/api/email/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: email,
    productName: n + " items"
  })
})
.then(res => res.json())
.then(data => console.log("Email status:", data))
.catch(err => console.error("Email error:", err));
      window.__brixoCloseCheckout();
      toast('✅ Payment successful! Order ' + orderId + ' — $' + t);
      setTimeout(function(){ alert('Order confirmed!\\n\\nOrder #' + orderId + '\\nItems: ' + n + '\\nTotal: $' + t + '\\nPayment: ' + method.toUpperCase() + '\\n\\nA confirmation has been sent to ' + email + '.'); }, 400);
      state.items = [];
      save();
      renderItems();
      btn.textContent = orig; btn.disabled = false;
    }, 1400);
  };

  window.__brixoNotify = function(msg){ toast(msg); };

  // Cart item click delegation
  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var i = parseInt(btn.getAttribute('data-i'), 10);
    var act = btn.getAttribute('data-act');
    if (isNaN(i) || !state.items[i]) return;
    if (act === 'inc') state.items[i].qty += 1;
    else if (act === 'dec') { state.items[i].qty -= 1; if (state.items[i].qty <= 0) state.items.splice(i,1); }
    else if (act === 'del') state.items.splice(i,1);
    save();
    renderItems();
  });

  // Page tabs
  document.querySelectorAll('.brixo-page-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      var idx = tab.getAttribute('data-page-idx');
      document.querySelectorAll('.brixo-page').forEach(function(p){
        p.style.display = p.getAttribute('data-page-idx') === idx ? 'block' : 'none';
      });
      document.querySelectorAll('.brixo-page-tab').forEach(function(t){ t.style.opacity = '0.5'; });
      tab.style.opacity = '1';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  var firstTab = document.querySelector('.brixo-page-tab');
  if (firstTab) firstTab.style.opacity = '1';

  renderBadge();
})();
</script>
</body>
</html>`;
};

export const openPublishedInNewTab = (project: WebsiteProject): string => {
  const html = generatePublishedHTML(project);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  return url;
};
