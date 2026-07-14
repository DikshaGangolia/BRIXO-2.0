import JSZip from 'jszip';
import type { WebsiteConfig, ThemeConfig } from '../types';

// Helper to translate HSL / Hex theme to Tailwind configuration details
const buildTailwindConfig = (theme: ThemeConfig) => {
  return `module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${theme.primaryColor}",
        secondary: "${theme.secondaryColor}",
        accent: "${theme.accentColor}",
        customBg: "${theme.backgroundColor}",
        customText: "${theme.textColor}",
      },
      fontFamily: {
        custom: ["${theme.fontFamily === 'font-serif' ? 'Georgia, serif' : theme.fontFamily === 'font-mono' ? 'Courier, monospace' : 'Inter, sans-serif'}"],
      },
      borderRadius: {
        custom: "${theme.borderRadius === 'rounded-full' ? '9999px' : theme.borderRadius === 'rounded-2xl' ? '1rem' : theme.borderRadius === 'rounded-lg' ? '0.5rem' : theme.borderRadius === 'rounded-md' ? '0.375rem' : '0px'}",
      }
    },
  },
  plugins: [],
}`;
};

// Generates an interactive static HTML representing the website
const generateHTMLFile = (config: WebsiteConfig, pageId: string = 'home') => {
  const page = config.pages[pageId] || config.pages['home'];
  const theme = config.theme;

  // Build style variables
  const fontLink = theme.fontFamily === 'font-serif' 
    ? '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">'
    : theme.fontFamily === 'font-mono'
    ? '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">'
    : '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">';

  const fontClass = theme.fontFamily === 'font-serif'
    ? "font-family: 'Playfair Display', Georgia, serif;"
    : theme.fontFamily === 'font-mono'
    ? "font-family: 'Fira Code', monospace;"
    : "font-family: 'Inter', sans-serif;";

  // Build individual components
  let sectionsHTML = '';

  page.components.forEach((comp) => {
    switch (comp.type) {
      case 'Navbar': {
        const logo = comp.fields.logoText.value;
        const links: string[] = comp.fields.links.value;
        const linksHTML = links
          .map(
            (lnk) =>
              `<li><a href="#" class="hover:opacity-80 transition-opacity font-medium">${lnk}</a></li>`
          )
          .join('\n');

        sectionsHTML += `
    <nav class="sticky top-0 z-50 backdrop-blur-md border-b" style="background: ${theme.backgroundColor}dd; border-color: ${theme.primaryColor}15;">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          ${config.logoSvg}
          <span class="font-bold text-xl" style="color: ${theme.primaryColor};">${logo}</span>
        </div>
        <ul class="hidden md:flex items-center gap-8 text-sm" style="color: ${theme.textColor};">
          ${linksHTML}
        </ul>
        <div class="md:hidden">
          <button class="p-2 rounded-md" style="color: ${theme.primaryColor};" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <div id="mobile-menu" class="hidden md:hidden absolute left-0 right-0 py-4 shadow-xl border-b flex flex-col items-center gap-4 text-sm" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}15; color: ${theme.textColor};">
        <ul class="flex flex-col items-center gap-4">
          ${links.map((lnk) => `<li><a href="#" onclick="document.getElementById('mobile-menu').classList.add('hidden')" class="hover:opacity-80 font-medium">${lnk}</a></li>`).join('')}
        </ul>
      </div>
    </nav>\n`;
        break;
      }

      case 'Hero': {
        const title = comp.fields.headline.value;
        const sub = comp.fields.subheadline.value;
        const btn = comp.fields.ctaText.value;
        const bgImg = comp.fields.backgroundImage.value;

        sectionsHTML += `
    <section class="relative min-h-[85vh] flex items-center py-20 bg-cover bg-center" style="background-image: linear-gradient(to right, ${theme.backgroundColor}ff, ${theme.backgroundColor}aa), url('${bgImg}');">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <div>
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6" style="color: ${theme.primaryColor};">
            ${title}
          </h1>
          <p class="text-lg opacity-90 mb-8 leading-relaxed" style="color: ${theme.textColor};">
            ${sub}
          </p>
          <a href="#contact" class="inline-block px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${theme.borderRadius}" style="background: ${theme.primaryColor}; color: #ffffff;">
            ${btn}
          </a>
        </div>
      </div>
    </section>\n`;
        break;
      }

      case 'Cards': {
        const title = comp.fields.sectionTitle.value;
        const cards: any[] = comp.fields.cardItems.value;
        const cardsHTML = cards
          .map(
            (c) => `
        <div class="p-8 border bg-opacity-40 backdrop-blur-sm transition-all hover:shadow-lg ${theme.borderRadius}" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}20;">
          <div class="w-12 h-12 flex items-center justify-center mb-6 rounded-lg" style="background: ${theme.primaryColor}15; color: ${theme.primaryColor};">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3" style="color: ${theme.primaryColor};">${c.title}</h3>
          <p class="text-sm leading-relaxed opacity-85" style="color: ${theme.textColor};">${c.desc}</p>
        </div>`
          )
          .join('\n');

        sectionsHTML += `
    <section class="py-24" style="background: ${theme.backgroundColor}50;">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-3xl font-extrabold text-center mb-16" style="color: ${theme.primaryColor};">${title}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${cardsHTML}
        </div>
      </div>
    </section>\n`;
        break;
      }

      case 'Products': {
        const title = comp.fields.sectionTitle.value;
        const products: any[] = comp.fields.productItems.value;
        const productsHTML = products
          .map(
            (p) => `
        <div class="border overflow-hidden transition-all hover:shadow-xl flex flex-col justify-between ${theme.borderRadius}" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}15;">
          <div class="relative aspect-video bg-gray-100 overflow-hidden">
            <img src="${p.img || p.image}" alt="${p.name}" class="w-full h-full object-cover" />
          </div>
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start gap-2 mb-3">
                <h3 class="text-lg font-bold" style="color: ${theme.primaryColor};">${p.name}</h3>
                <span class="text-lg font-bold" style="color: ${theme.accentColor};">${p.price}</span>
              </div>
              <p class="text-xs opacity-75 leading-relaxed mb-6" style="color: ${theme.textColor};">${p.desc || p.description || ''}</p>
            </div>
            <button class="w-full py-2.5 font-medium border text-center transition-colors ${theme.borderRadius}" style="border-color: ${theme.primaryColor}; color: ${theme.primaryColor}; background: transparent;" onclick="alert('Order Simulation: Add ${p.name} to cart')">
              Add to Basket
            </button>
          </div>
        </div>`
          )
          .join('\n');

        sectionsHTML += `
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-3xl font-extrabold text-center mb-16" style="color: ${theme.primaryColor};">${title}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${productsHTML}
        </div>
      </div>
    </section>\n`;
        break;
      }

      case 'Forms': {
        const title = comp.fields.sectionTitle.value;
        const fields: any[] = comp.fields.formFields.value;
        const btn = comp.fields.submitText.value;

        const inputsHTML = fields
          .map((f) => {
            if (f.type === 'textarea') {
              return `
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: ${theme.primaryColor};">${f.label}</label>
            <textarea placeholder="${f.placeholder}" rows="4" class="w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.borderRadius}" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}20; color: ${theme.textColor};"></textarea>
          </div>`;
            }
            return `
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: ${theme.primaryColor};">${f.label}</label>
            <input type="${f.type}" placeholder="${f.placeholder}" class="w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.borderRadius}" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}20; color: ${theme.textColor};" />
          </div>`;
          })
          .join('\n');

        sectionsHTML += `
    <section id="contact" class="py-24" style="background: ${theme.backgroundColor}30;">
      <div class="max-w-xl mx-auto px-6">
        <div class="p-8 border shadow-xl backdrop-blur-md ${theme.borderRadius}" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}15;">
          <h2 class="text-2xl font-bold text-center mb-8" style="color: ${theme.primaryColor};">${title}</h2>
          <form class="space-y-6" onsubmit="event.preventDefault(); alert('Form submitted successfully!');">
            ${inputsHTML}
            <button class="w-full py-4 font-semibold shadow-md transition-all hover:opacity-90 ${theme.borderRadius}" style="background: ${theme.primaryColor}; color: #ffffff;">
              ${btn}
            </button>
          </form>
        </div>
      </div>
    </section>\n`;
        break;
      }

      case 'Testimonials': {
        const title = comp.fields.sectionTitle.value;
        const testList: any[] = comp.fields.testimonialsList.value;
        const testHTML = testList
          .map(
            (t) => `
        <div class="p-8 border flex flex-col justify-between h-full relative ${theme.borderRadius}" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}15;">
          <p class="text-sm italic mb-6 leading-relaxed opacity-90" style="color: ${theme.textColor};">"${t.quote}"</p>
          <div class="flex items-center gap-4">
            <img src="${t.avatar}" class="w-10 h-10 rounded-full object-cover" alt="${t.author}" />
            <div>
              <h4 class="text-sm font-bold" style="color: ${theme.primaryColor};">${t.author}</h4>
              <p class="text-xs opacity-60" style="color: ${theme.textColor};">${t.role}</p>
            </div>
          </div>
        </div>`
          )
          .join('\n');

        sectionsHTML += `
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-3xl font-extrabold text-center mb-16" style="color: ${theme.primaryColor};">${title}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${testHTML}
        </div>
      </div>
    </section>\n`;
        break;
      }

      case 'Pricing': {
        const title = comp.fields.sectionTitle.value;
        const plans: any[] = comp.fields.plansList.value;
        const plansHTML = plans
          .map(
            (p) => `
        <div class="p-8 border flex flex-col justify-between relative shadow-sm transition-all hover:scale-[1.02] ${theme.borderRadius}" style="background: ${theme.backgroundColor}; border-color: ${p.popular ? theme.primaryColor : theme.primaryColor + '15'}; ${p.popular ? 'box-shadow: 0 10px 30px -10px ' + theme.primaryColor + '30' : ''}">
          ${p.popular ? `<span class="absolute top-0 right-6 transform -translate-y-1/2 px-3 py-1 text-2xs uppercase tracking-wider font-bold rounded-full text-white" style="background: ${theme.accentColor};">Popular</span>` : ''}
          <div>
            <h3 class="text-lg font-bold mb-2" style="color: ${theme.primaryColor};">${p.name}</h3>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-3xl font-extrabold" style="color: ${theme.textColor};">${p.price}</span>
              <span class="text-xs opacity-60">/${p.period}</span>
            </div>
            <ul class="space-y-3 mb-8 text-sm opacity-80" style="color: ${theme.textColor};">
              ${p.features.map((f: string) => `<li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> ${f}</li>`).join('')}
            </ul>
          </div>
          <button class="w-full py-3 font-semibold text-center transition-all ${theme.borderRadius}" style="background: ${p.popular ? theme.primaryColor : 'transparent'}; border: 2px solid ${theme.primaryColor}; color: ${p.popular ? '#ffffff' : theme.primaryColor};" onclick="alert('Pricing simulation: Select ${p.name}')">
            ${p.btnText || 'Choose Plan'}
          </button>
        </div>`
          )
          .join('\n');

        sectionsHTML += `
    <section class="py-24" style="background: ${theme.backgroundColor}40;">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-3xl font-extrabold text-center mb-16" style="color: ${theme.primaryColor};">${title}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${plansHTML}
        </div>
      </div>
    </section>\n`;
        break;
      }

      case 'Footer': {
        const copy = comp.fields.copyright.value;
        const socials: string[] = comp.fields.socials.value;

        sectionsHTML += `
    <footer class="py-12 border-t text-center text-sm" style="background: ${theme.backgroundColor}; border-color: ${theme.primaryColor}15; color: ${theme.textColor}; opacity: 0.9;">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>${copy}</div>
        <div class="flex items-center gap-6">
          ${socials.map((s) => `<a href="#" class="hover:opacity-80 transition-opacity font-medium">${s}</a>`).join('')}
        </div>
      </div>
    </footer>\n`;
        break;
      }
    }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.businessName} - ${page.name}</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontLink}
  <style>
    body {
      ${fontClass}
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between">
  <div>
    ${sectionsHTML}
  </div>
</body>
</html>`;
};

// Generates code representing a single-page React app structure
const generateReactFile = (config: WebsiteConfig) => {
  return `import React, { useState } from 'react';
// Run npm install lucide-react to use these icons
import { Award, Clock, ShieldCheck, Stethoscope, Activity, HeartPulse, BookOpen, FlaskConical, Trophy, Leaf, Utensils, Zap, DollarSign, MapPin, Sparkles, Layers, TrendingUp, Code, User, Palette, Terminal, Phone, Menu, X, ArrowRight } from 'lucide-react';

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');

  // Active theme configuration
  const theme = {
    primaryColor: "${config.theme.primaryColor}",
    secondaryColor: "${config.theme.secondaryColor}",
    accentColor: "${config.theme.accentColor}",
    backgroundColor: "${config.theme.backgroundColor}",
    textColor: "${config.theme.textColor}",
    borderRadius: "${config.theme.borderRadius}",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, fontFamily: 'sans-serif' }}>
      
      {/* Navbar component */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: theme.backgroundColor + 'dd', borderColor: theme.primaryColor + '15' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl" style={{ color: theme.primaryColor }}>${config.businessName}</span>
          </div>
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            <li><button onClick={() => setActivePage('home')} className="hover:opacity-80 transition-opacity">Home</button></li>
            <li><button onClick={() => setActivePage('about')} className="hover:opacity-80 transition-opacity">About</button></li>
            <li><button onClick={() => setActivePage('services')} className="hover:opacity-80 transition-opacity">Services</button></li>
            <li><button onClick={() => setActivePage('products')} className="hover:opacity-80 transition-opacity">Products</button></li>
            <li><button onClick={() => setActivePage('contact')} className="hover:opacity-80 transition-opacity">Contact</button></li>
          </ul>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => alert('Shopping Cart')}>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              🛒
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-4 flex flex-col gap-4 border-b" style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor + '15' }}>
            <button onClick={() => { setActivePage('home'); setMobileMenuOpen(false); }} className="text-left font-medium">Home</button>
            <button onClick={() => { setActivePage('about'); setMobileMenuOpen(false); }} className="text-left font-medium">About</button>
            <button onClick={() => { setActivePage('services'); setMobileMenuOpen(false); }} className="text-left font-medium">Services</button>
            <button onClick={() => { setActivePage('products'); setMobileMenuOpen(false); }} className="text-left font-medium">Products</button>
            <button onClick={() => { setActivePage('contact'); setMobileMenuOpen(false); }} className="text-left font-medium">Contact</button>
          </div>
        )}
      </nav>

      {/* Main Page Content */}
      <main>
        {activePage === 'home' && (
          <>
            {/* Hero Section */}
            <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, ' + theme.backgroundColor + ', ' + theme.primaryColor + '08)' }}>
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6" style={{ color: theme.primaryColor }}>
                    Welcome to ${config.businessName}
                  </h1>
                  <p className="text-lg opacity-80 mb-8 leading-relaxed">
                    Experience modern services and goods built to optimize quality, efficiency, and wellness.
                  </p>
                  <button onClick={() => setActivePage('products')} className="px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 rounded-lg text-white" style={{ backgroundColor: theme.primaryColor }}>
                    Explore Store
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Fallback to show simple layout for export demo */}
        {activePage !== 'home' && (
          <div className="py-24 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.primaryColor }}>{activePage.toUpperCase()} PAGE</h2>
            <p className="opacity-80">This page was fully generated. Click other tabs above to navigate.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-sm" style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor + '15' }}>
        <p>© 2026 ${config.businessName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
`;
};

// Generates NextJS Page code layout
const generateNextJSFile = (config: WebsiteConfig) => {
  return `"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[${config.theme.backgroundColor}] text-[${config.theme.textColor}]">
      <header className="border-b py-4 px-6 flex justify-between items-center" style={{ borderColor: '${config.theme.primaryColor}15' }}>
        <div className="font-bold text-xl" style={{ color: '${config.theme.primaryColor}' }}>${config.businessName}</div>
        <nav className="space-x-6 text-sm">
          <Link href="#" className="hover:opacity-75">Home</Link>
          <Link href="#" className="hover:opacity-75">About</Link>
          <Link href="#" className="hover:opacity-75">Products</Link>
          <Link href="#" className="hover:opacity-75">Contact</Link>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto py-20 px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-6" style={{ color: '${config.theme.primaryColor}' }}>
          ${config.businessName} Next.js App
        </h1>
        <p className="text-lg opacity-85 mb-8">
          This client package represents a generated static structure compatible with Next.js App Router rules.
        </p>
        <div className="inline-block px-6 py-3 rounded text-white font-medium" style={{ backgroundColor: '${config.theme.primaryColor}' }}>
          Next.js Export Active
        </div>
      </main>
    </div>
  );
}
`;
};

export const exportProjectZip = async (config: WebsiteConfig): Promise<Blob> => {
  const zip = new JSZip();

  // 1. Create HTML Exports for all pages
  const htmlFolder = zip.folder("html_css");
  if (htmlFolder) {
    Object.keys(config.pages).forEach((pageId) => {
      const pageHTML = generateHTMLFile(config, pageId);
      htmlFolder.file(`${pageId}.html`, pageHTML);
    });
  }

  // 2. Create React Exports
  const reactFolder = zip.folder("react_app");
  if (reactFolder) {
    reactFolder.file("App.tsx", generateReactFile(config));
    reactFolder.file("tailwind.config.js", buildTailwindConfig(config.theme));
  }

  // 3. Create Next.js Exports
  const nextFolder = zip.folder("nextjs_app");
  if (nextFolder) {
    nextFolder.file("page.tsx", generateNextJSFile(config));
  }

  // 4. Global configurations
  zip.file("tailwind.config.js", buildTailwindConfig(config.theme));
  zip.file("README.md", `# Generated SaaS Website: ${config.businessName}

Your AI-generated website files are ready!

## Structure
- \`/html_css\` - Contains raw static \`.html\` pages for all created pages. Double-click \`home.html\` or run a local HTTP server to preview in real-time.
- \`/react_app\` - Clean single-file React dashboard component matching the builder layout, with full CSS/Tailwind configs.
- \`/nextjs_app\` - Client Page structure tailored for Next.js App Router.

Enjoy! Generated by Antigravity AI Site Builder.
`);

  // Generate the blob
  return await zip.generateAsync({ type: "blob" });
};
