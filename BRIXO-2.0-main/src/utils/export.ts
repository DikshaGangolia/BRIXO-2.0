import JSZip from 'jszip';
import type { WebsiteConfig, ComponentBlock, DesignTokens } from '../types/builder';

// Helper to convert theme design tokens into Tailwind CSS config string
const buildTailwindConfig = (tokens: DesignTokens) => {
  return `module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${tokens.primaryColor}",
        secondary: "${tokens.secondaryColor}",
        accent: "${tokens.accentColor}",
        customBg: "${tokens.backgroundColor}",
        customText: "${tokens.textColor}",
      },
      fontFamily: {
        custom: ["${tokens.fontFamily === 'font-serif' ? 'Georgia, serif' : tokens.fontFamily === 'font-mono' ? 'Courier, monospace' : 'Inter, sans-serif'}"],
      },
      borderRadius: {
        custom: "${tokens.borderRadius === 'rounded-full' ? '9999px' : tokens.borderRadius === 'rounded-3xl' ? '1.5rem' : tokens.borderRadius === 'rounded-xl' ? '0.75rem' : tokens.borderRadius === 'rounded-md' ? '0.375rem' : '0px'}",
      }
    },
  },
  plugins: [],
}`;
};

// Generates raw HTML for a single block
const generateBlockHTML = (comp: ComponentBlock, tokens: DesignTokens) => {
  const rounded = tokens.borderRadius === 'rounded-full' ? 'rounded-full' : tokens.borderRadius === 'rounded-3xl' ? 'rounded-3xl' : tokens.borderRadius === 'rounded-xl' ? 'rounded-xl' : tokens.borderRadius === 'rounded-md' ? 'rounded-md' : 'rounded-none';
  const shadow = tokens.boxShadow;
  
  // Custom custom code override
  if (comp.customCode?.html) {
    return `<section class="py-12 px-6" style="background: ${tokens.backgroundColor}; color: ${tokens.textColor};">
      <div class="max-w-6xl mx-auto">${comp.customCode.html}</div>
    </section>`;
  }

  switch (comp.type) {
    case 'Navbar':
      return `
    <nav class="sticky top-0 z-50 border-b backdrop-blur-md" style="background: ${tokens.backgroundColor}dd; border-color: ${tokens.primaryColor}15; color: ${tokens.textColor};">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 font-bold text-lg">
          <span style="color: ${tokens.primaryColor};">${comp.fields.title || 'Brand'}</span>
        </div>
        <ul class="hidden md:flex items-center gap-6 text-sm font-semibold">
          ${(comp.fields.items || []).map((lnk: string) => `<li><a href="${lnk === 'Home' ? 'index.html' : lnk.toLowerCase().replace(/\s+/g, '-') + '.html'}" class="hover:opacity-80 transition-opacity">${lnk}</a></li>`).join('\n')}
        </ul>
        <button class="px-4 py-1.5 text-xs font-bold border transition-all ${rounded}" style="border-color: ${tokens.primaryColor}; color: ${tokens.primaryColor};">
          Contact Us
        </button>
      </div>
    </nav>`;

    case 'Hero':
      return `
    <section class="py-24 relative overflow-hidden" style="background-image: linear-gradient(135deg, ${tokens.backgroundColor}, ${tokens.primaryColor}0a); color: ${tokens.textColor};">
      <div class="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight" style="color: ${tokens.primaryColor};">
            ${comp.fields.title || ''}
          </h1>
          <p class="text-base opacity-90 mb-8 leading-relaxed">
            ${comp.fields.subtitle || ''}
          </p>
          <a href="#" class="inline-block px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 ${rounded}" style="background: ${tokens.primaryColor};">
            ${comp.fields.ctaText || 'Get Started'}
          </a>
        </div>
        <div class="rounded-xl overflow-hidden shadow-xl aspect-video bg-slate-100">
          <img src="${comp.fields.imageUrl || ''}" alt="Hero Image" class="w-full h-full object-cover" />
        </div>
      </div>
    </section>`;

    case 'Features':
    case 'Services':
      return `
    <section class="py-20 px-6" style="background: ${tokens.backgroundColor}; color: ${tokens.textColor};">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12" style="color: ${tokens.primaryColor};">${comp.fields.title || 'Our Features'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${(comp.fields.items || []).map((item: any) => `
          <div class="p-6 border bg-opacity-40 transition-all hover:shadow-md ${rounded} ${shadow}" style="border-color: ${tokens.primaryColor}15; background: ${tokens.backgroundColor};">
            <h3 class="text-lg font-bold mb-3" style="color: ${tokens.primaryColor};">${item.title}</h3>
            <p class="text-sm opacity-80 leading-relaxed">${item.desc}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;

    case 'Products':
      return `
    <section class="py-20 px-6" style="background: ${tokens.backgroundColor}; color: ${tokens.textColor};">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12" style="color: ${tokens.primaryColor};">${comp.fields.title || 'Catalog'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${(comp.fields.items || []).map((p: any) => `
          <div class="border overflow-hidden transition-all hover:shadow-lg flex flex-col justify-between ${rounded} ${shadow}" style="border-color: ${tokens.primaryColor}15; background: ${tokens.backgroundColor};">
            <div class="aspect-video bg-slate-100 overflow-hidden">
              <img src="${p.img || p.image}" alt="${p.name}" class="w-full h-full object-cover" />
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start gap-2 mb-2">
                  <h4 class="font-bold text-sm" style="color: ${tokens.primaryColor};">${p.name}</h4>
                  <span class="text-sm font-bold" style="color: ${tokens.accentColor};">${p.price}</span>
                </div>
                <p class="text-xs opacity-75 mb-4 leading-relaxed">${p.desc || ''}</p>
              </div>
              <button onclick="this.textContent='Added!'; this.classList.add('bg-blue-600','text-white'); this.classList.remove('text-blue-600');" class="w-full py-2 border text-xs font-semibold hover:bg-slate-50 transition-colors ${rounded}" style="border-color: ${tokens.primaryColor}; color: ${tokens.primaryColor};">
                Add to Cart
              </button>
            </div>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;

    case 'Testimonials':
      return `
    <section class="py-20 px-6" style="background: ${tokens.backgroundColor}; color: ${tokens.textColor};">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12" style="color: ${tokens.primaryColor};">${comp.fields.title || 'Reviews'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${(comp.fields.items || []).map((t: any) => `
          <div class="p-6 border flex flex-col justify-between ${rounded} ${shadow}" style="border-color: ${tokens.primaryColor}15; background: ${tokens.backgroundColor};">
            <p class="text-sm italic mb-6">"${t.quote}"</p>
            <div>
              <h4 class="text-sm font-bold" style="color: ${tokens.primaryColor};">${t.author}</h4>
              <p class="text-xs opacity-60">${t.role}</p>
            </div>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;

    case 'Pricing':
      return `
    <section class="py-20 px-6" style="background: ${tokens.backgroundColor}; color: ${tokens.textColor};">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12" style="color: ${tokens.primaryColor};">${comp.fields.title || 'Pricing'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${(comp.fields.items || []).map((p: any) => `
          <div class="p-8 border flex flex-col justify-between ${rounded} ${shadow}" style="border-color: ${tokens.primaryColor}15; background: ${tokens.backgroundColor};">
            <div>
              <h3 class="text-lg font-bold mb-1" style="color: ${tokens.primaryColor};">${p.name}</h3>
              <div class="flex items-baseline gap-1 mb-6">
                <span class="text-2xl font-black">${p.price}</span>
                <span class="text-xs opacity-60">/${p.period}</span>
              </div>
              <ul class="space-y-2 mb-8 text-xs opacity-80">
                ${(p.features || []).map((f: string) => `<li class="flex items-center gap-1.5">✓ ${f}</li>`).join('')}
              </ul>
            </div>
            <button class="w-full py-2.5 text-xs font-bold text-white ${rounded}" style="background: ${tokens.primaryColor};">
              Choose Plan
            </button>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;

    case 'FAQ':
      return `
    <section class="py-20 px-6" style="background: ${tokens.backgroundColor}; color: ${tokens.textColor};">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12" style="color: ${tokens.primaryColor};">${comp.fields.title || 'FAQ'}</h2>
        <div class="space-y-6">
          ${(comp.fields.items || []).map((f: any) => `
          <div class="p-5 border-b" style="border-color: ${tokens.primaryColor}10;">
            <h4 class="font-bold text-sm mb-2" style="color: ${tokens.primaryColor};">${f.q}</h4>
            <p class="text-xs opacity-80 leading-relaxed">${f.a}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </section>`;

    case 'ContactForm':
      return `
    <section class="py-20 px-6" style="background: ${tokens.backgroundColor}; color: ${tokens.textColor};">
      <div class="max-w-md mx-auto">
        <div class="p-8 border shadow-xl ${rounded}" style="border-color: ${tokens.primaryColor}15; background: ${tokens.backgroundColor};">
          <h2 class="text-2xl font-bold text-center mb-8" style="color: ${tokens.primaryColor};">${comp.fields.title || 'Contact Us'}</h2>
          <form class="space-y-4" onsubmit="event.preventDefault(); alert('Form submitted!');">
            <div>
              <label class="block text-3xs font-semibold uppercase tracking-wider mb-1">Your Name</label>
              <input type="text" class="w-full px-3 py-2 border text-xs focus:outline-none ${rounded}" style="border-color: ${tokens.primaryColor}20; background: ${tokens.backgroundColor};" />
            </div>
            <div>
              <label class="block text-3xs font-semibold uppercase tracking-wider mb-1">Your Email</label>
              <input type="email" class="w-full px-3 py-2 border text-xs focus:outline-none ${rounded}" style="border-color: ${tokens.primaryColor}20; background: ${tokens.backgroundColor};" />
            </div>
            <div>
              <label class="block text-3xs font-semibold uppercase tracking-wider mb-1">Message</label>
              <textarea rows="3" class="w-full px-3 py-2 border text-xs focus:outline-none ${rounded}" style="border-color: ${tokens.primaryColor}20; background: ${tokens.backgroundColor};"></textarea>
            </div>
            <button class="w-full py-3 font-semibold text-white text-xs ${rounded}" style="background: ${tokens.primaryColor};">
              ${comp.fields.ctaText || 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </section>`;

    case 'Footer':
      return `
    <footer class="py-12 px-6 border-t text-center text-xs opacity-90" style="background: ${tokens.backgroundColor}; border-color: ${tokens.primaryColor}15; color: ${tokens.textColor};">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>${comp.fields.title || '© 2026 Brand'}</p>
        <div class="flex gap-4 font-semibold">
          ${(comp.fields.items || []).map((s: string) => `<a href="#" class="hover:opacity-75">${s}</a>`).join('')}
        </div>
      </div>
    </footer>`;

    default:
      return `<section class="py-12 text-center" style="background: ${tokens.backgroundColor}; border-color: ${tokens.primaryColor}15;">
        <h4 style="color: ${tokens.primaryColor};">${comp.title}</h4>
      </section>`;
  }
};

const compileStandaloneHTML = (config: WebsiteConfig, pageId: string) => {
  const page = config.pages.find(p => p.id === pageId) || config.pages[0];
  const tokens = config.designTokens;

  const fontClass = tokens.fontFamily === 'font-serif'
    ? "font-family: Georgia, serif;"
    : tokens.fontFamily === 'font-mono'
    ? "font-family: Courier, monospace;"
    : "font-family: 'Inter', sans-serif;";

  const fontLink = tokens.fontFamily === 'font-serif'
    ? '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">'
    : tokens.fontFamily === 'font-mono'
    ? '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">'
    : '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">';

  let bodyHTML = '';
  page.components.forEach((comp) => {
    bodyHTML += generateBlockHTML(comp, tokens);
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontLink}
  <style>
    body {
      ${fontClass}
      background-color: ${tokens.backgroundColor};
      color: ${tokens.textColor};
    }
  </style>
</head>
<body>
  ${bodyHTML}
</body>
</html>`;
};

// Generates standard single-file React configurations code
const generateReactWorkspaceCode = (config: WebsiteConfig) => {
  return `import React, { useState } from 'react';
// Build command dependencies: npm install lucide-react
import { CheckCircle, Award, Leaf, ShieldCheck, Mail, MapPin, Phone, Github } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  const themeTokens = {
    primaryColor: "${config.designTokens.primaryColor}",
    secondaryColor: "${config.designTokens.secondaryColor}",
    backgroundColor: "${config.designTokens.backgroundColor}",
    textColor: "${config.designTokens.textColor}",
    borderRadius: "${config.designTokens.borderRadius}",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeTokens.backgroundColor, color: themeTokens.textColor, fontFamily: 'sans-serif' }}>
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md" style={{ borderColor: themeTokens.primaryColor + '15' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-extrabold text-lg" style={{ color: themeTokens.primaryColor }}>
            Universal App Layout
          </span>
          <div className="flex gap-4 text-xs font-bold">
            {['Home', 'About', 'Services', 'Contact'].map(lnk => (
              <button 
                key={lnk} 
                onClick={() => setActivePage(lnk.toLowerCase())} 
                className="hover:opacity-75 uppercase tracking-wider"
                style={activePage === lnk.toLowerCase() ? { borderBottom: '2px solid ' + themeTokens.primaryColor, color: themeTokens.primaryColor } : {}}
              >
                {lnk}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="py-20 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6" style={{ color: themeTokens.primaryColor }}>
          Export Package Complete
        </h1>
        <p className="text-base opacity-80 leading-relaxed mb-12">
          Your React 19 source templates have compiled with Tailwind themes configurations and visual blocks definitions.
        </p>
        <div className="inline-block px-6 py-3 font-semibold text-white rounded-lg shadow-lg" style={{ backgroundColor: themeTokens.primaryColor }}>
          React Code Active
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center text-xs opacity-75 border-t border-gray-150">
        <p>© 2026 Website Builder. Exported Package.</p>
      </footer>
    </div>
  );
}
`;
};

export const exportSiteZip = async (project: any): Promise<Blob> => {
  const zip = new JSZip();
  const config = project.config as WebsiteConfig;

  // 1. Compile HTML/CSS standalone folder
  const htmlFolder = zip.folder("html_css_js");
  if (htmlFolder) {
    config.pages.forEach((page) => {
      const pageHTML = compileStandaloneHTML(config, page.id);
      const filename = page.id === 'home' ? 'index.html' : `${page.id}.html`;
      htmlFolder.file(filename, pageHTML);
    });
  }

  // 2. Compile React SPA folder
  const reactFolder = zip.folder("react_spa");
  if (reactFolder) {
    reactFolder.file("App.tsx", generateReactWorkspaceCode(config));
    reactFolder.file("tailwind.config.js", buildTailwindConfig(config.designTokens));
  }

  // 3. Compile full ready-to-run Vite Project structure
  const viteFolder = zip.folder("vite_project");
  if (viteFolder) {
    viteFolder.file("package.json", `{
  "name": "${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}`);
    
    viteFolder.file("tailwind.config.js", buildTailwindConfig(config.designTokens));
    viteFolder.file("postcss.config.js", `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);
    
    // Add dummy folders and main scripts
    const srcFolder = viteFolder.folder("src");
    if (srcFolder) {
      srcFolder.file("main.tsx", `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);
      
      srcFolder.file("index.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
}`);
      
      srcFolder.file("App.tsx", generateReactWorkspaceCode(config));
    }
    
    viteFolder.file("index.html", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
  }

  // Generate README root file
  zip.file("README.md", `# ${project.name} Exported SaaS Code Bundle

Your visual workspace has been exported to multiple formats:

## 🗂️ Directories:
1. \`/html_css_js\` - Static, responsive \`.html\` pages. Directly double-click \`index.html\` to view inside any browser.
2. \`/react_spa\` - Single-file React App layout with corresponding Tailwind configuration mappings.
3. \`/vite_project\` - Full, structured Vite React TypeScript application.
   - Run \`npm install\`
   - Run \`npm run dev\`

Thank you for using Universal Website Builder SaaS!
`);

  return await zip.generateAsync({ type: "blob" });
};
