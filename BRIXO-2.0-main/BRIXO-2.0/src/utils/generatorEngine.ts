import type { Industry, WebsiteConfig, WebPage, WebsiteComponent, ThemeConfig, ComponentType } from '../types';

// Helper to generate unique IDs
const genId = () => Math.random().toString(36).substring(2, 9);

// Default SVG Logos based on industry
export const generateLogoSvg = (name: string, industry: Industry, color: string = '#3b82f6'): string => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();

  let iconPath = '';
  switch (industry) {
    case 'Healthcare':
      iconPath = '<path d="M19 10.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9.5a4 4 0 0 1 8-1.5 4 4 0 0 1 6 1.5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v6M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      break;
    case 'Restaurant':
      iconPath = '<path d="M12 2v20M5 5h14M5 10h14M7 15h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      break;
    case 'School':
      iconPath = '<path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      break;
    case 'Gym':
      iconPath = '<path d="M6.5 6.5h11M18 4v5M6 4v5M3 6.5h3M18 6.5h3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>';
      break;
    case 'Real Estate':
      iconPath = '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2"/>';
      break;
    case 'Portfolio':
      iconPath = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>';
      break;
    case 'Blog':
      iconPath = '<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      break;
    case 'Travel':
      iconPath = '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10M2 12h20" stroke="currentColor" stroke-width="2"/>';
      break;
    case 'Salon':
      iconPath = '<path d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v10M9 10h6" stroke="currentColor" stroke-width="2"/>';
      break;
    case 'NGO':
      iconPath = '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>';
      break;
    case 'Agency':
      iconPath = '<path d="M3 3h18v18H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 12H3M12 3v18" stroke="currentColor" stroke-width="2"/>';
      break;
    default: // E-commerce
      iconPath = '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" class="inline-block" style="color: ${color};">
    ${iconPath}
    <text x="27" y="18" font-family="sans-serif" font-size="12" font-weight="bold" fill="currentColor">${initials}</text>
  </svg>`;
};

// Design system defaults for each industry
export const INDUSTRY_DEFAULTS: Record<Industry, {
  businessName: string;
  colors: { primary: string; secondary: string; accent: string; bg: string; text: string };
  font: string;
  radius: string;
  keywords: string[];
}> = {
  'Healthcare': {
    businessName: 'HealthCare Plus',
    colors: { primary: '#0f766e', secondary: '#14b8a6', accent: '#f59e0b', bg: '#f8fafc', text: '#0f172a' }, // Teal
    font: 'font-sans',
    radius: 'rounded-lg',
    keywords: ['medical', 'health', 'doctor', 'clinic', 'hospital', 'dentist', 'physio', 'care', 'medicine']
  },
  'Restaurant': {
    businessName: 'Gourmet Haven',
    colors: { primary: '#c2410c', secondary: '#ea580c', accent: '#fbbf24', bg: '#fffaf8', text: '#1e1b18' }, // Orange-red
    font: 'font-serif',
    radius: 'rounded-2xl',
    keywords: ['food', 'restaurant', 'cafe', 'bistro', 'pizza', 'burger', 'delicious', 'menu', 'dinner', 'lunch', 'eat']
  },
  'School': {
    businessName: 'Beacon Academy',
    colors: { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#eab308', bg: '#f8fafc', text: '#0f172a' }, // Blue
    font: 'font-sans',
    radius: 'rounded-md',
    keywords: ['school', 'education', 'academy', 'university', 'learn', 'college', 'student', 'class', 'course']
  },
  'Gym': {
    businessName: 'Apex Fitness',
    colors: { primary: '#dc2626', secondary: '#171717', accent: '#facc15', bg: '#0a0a0a', text: '#f5f5f5' }, // Energetic Dark/Red
    font: 'font-sans',
    radius: 'rounded-none',
    keywords: ['gym', 'fitness', 'workout', 'trainer', 'exercise', 'crossfit', 'athletics', 'bodybuilding', 'lift']
  },
  'Real Estate': {
    businessName: 'Apex Dwellings',
    colors: { primary: '#1e293b', secondary: '#475569', accent: '#b45309', bg: '#fafaf9', text: '#1c1917' }, // Slate & Gold
    font: 'font-sans',
    radius: 'rounded-md',
    keywords: ['real estate', 'house', 'home', 'property', 'apartment', 'realtor', 'dwellings', 'estate', 'rent']
  },
  'Portfolio': {
    businessName: 'Alex Rivera',
    colors: { primary: '#6d28d9', secondary: '#8b5cf6', accent: '#10b981', bg: '#0f172a', text: '#f8fafc' }, // Violet & Dark
    font: 'font-sans',
    radius: 'rounded-full',
    keywords: ['portfolio', 'resume', 'personal', 'freelancer', 'cv', 'developer', 'designer', 'engineer', 'creatives']
  },
  'Blog': {
    businessName: 'Daily Scribble',
    colors: { primary: '#18181b', secondary: '#3f3f46', accent: '#f43f5e', bg: '#fafafa', text: '#18181b' }, // Minimalist
    font: 'font-serif',
    radius: 'rounded-sm',
    keywords: ['blog', 'write', 'news', 'opinion', 'journal', 'daily', 'article', 'reads', 'newsletter']
  },
  'Travel': {
    businessName: 'Wanderlust Co.',
    colors: { primary: '#0369a1', secondary: '#0ea5e9', accent: '#f59e0b', bg: '#f0f9ff', text: '#0f172a' }, // Tropical Sky Blue
    font: 'font-sans',
    radius: 'rounded-xl',
    keywords: ['travel', 'trip', 'tour', 'explore', 'adventure', 'vacation', 'wanderlust', 'flight', 'beach', 'resort']
  },
  'Salon': {
    businessName: 'Glow Salon & Spa',
    colors: { primary: '#be185d', secondary: '#db2777', accent: '#fbcfe8', bg: '#fff1f2', text: '#27272a' }, // Rose/Pink
    font: 'font-sans',
    radius: 'rounded-xl',
    keywords: ['salon', 'hair', 'beauty', 'spa', 'barber', 'makeup', 'nails', 'stylist', 'glow', 'massage']
  },
  'NGO': {
    businessName: 'Hope Foundation',
    colors: { primary: '#047857', secondary: '#10b981', accent: '#f59e0b', bg: '#f4fbf7', text: '#064e3b' }, // Emerald
    font: 'font-sans',
    radius: 'rounded-2xl',
    keywords: ['ngo', 'charity', 'donate', 'help', 'cause', 'foundation', 'volunteer', 'save', 'hope', 'nonprofit']
  },
  'Agency': {
    businessName: 'Vanguard Studios',
    colors: { primary: '#4338ca', secondary: '#6366f1', accent: '#06b6d4', bg: '#faf5ff', text: '#1e1b4b' }, // Indigo & Cyan
    font: 'font-sans',
    radius: 'rounded-xl',
    keywords: ['agency', 'marketing', 'consulting', 'vanguard', 'digital', 'studios', 'design', 'development', 'branding']
  },
  'E-commerce': {
    businessName: 'CartCraft Store',
    colors: { primary: '#0891b2', secondary: '#06b6d4', accent: '#fb923c', bg: '#f9fafb', text: '#111827' }, // Cyan
    font: 'font-sans',
    radius: 'rounded-lg',
    keywords: ['shop', 'store', 'buy', 'sell', 'product', 'ecommerce', 'cart', 'items', 'grocery', 'organic', 'groceries']
  }
};

// Main semantic AI parser
export const parseAIPrompt = (prompt: string): {
  industry: Industry;
  businessName: string;
  theme: ThemeConfig;
} => {
  const p = prompt.toLowerCase();
  
  // 1. Detect Industry
  let detectedIndustry: Industry = 'E-commerce';
  let matchedKeyword = '';
  
  for (const [ind, data] of Object.entries(INDUSTRY_DEFAULTS)) {
    for (const keyword of data.keywords) {
      if (p.includes(keyword)) {
        detectedIndustry = ind as Industry;
        matchedKeyword = keyword;
        break;
      }
    }
    if (matchedKeyword) break;
  }

  // Special logic: "grocery store" has keyword "grocery" which points to E-commerce, which is correct
  
  // 2. Extract Business Name
  let businessName = INDUSTRY_DEFAULTS[detectedIndustry].businessName;
  const nameMatches = prompt.match(/(?:named|called|for|name is) "([^"]+)"/i) || 
                       prompt.match(/(?:named|called|for|name is) ([A-Za-z0-9\s+&]+?)(?:\.|\s+website|\s+SaaS|\s+app|,\s*|$)/i);
  if (nameMatches && nameMatches[1]) {
    businessName = nameMatches[1].trim();
  } else {
    // Generate a contextual name if prompt has words that look like a business name
    // e.g. "Create a grocery store named FreshBaskets" -> FreshBaskets
    const words = prompt.split(' ');
    const namedIndex = words.findIndex(w => w.toLowerCase() === 'named' || w.toLowerCase() === 'called');
    if (namedIndex !== -1 && words[namedIndex + 1]) {
      businessName = words[namedIndex + 1].replace(/["'.,]/g, '').trim();
    }
  }

  // 3. Detect Theme Colors & Style
  const baseDefaults = INDUSTRY_DEFAULTS[detectedIndustry];
  const theme: ThemeConfig = {
    primaryColor: baseDefaults.colors.primary,
    secondaryColor: baseDefaults.colors.secondary,
    accentColor: baseDefaults.colors.accent,
    backgroundColor: baseDefaults.colors.bg,
    textColor: baseDefaults.colors.text,
    fontFamily: baseDefaults.font,
    borderRadius: baseDefaults.radius,
    glassmorphism: p.includes('glass') || p.includes('glassmorphism') || p.includes('modern')
  };

  // Color keywords
  if (p.includes('blue')) {
    theme.primaryColor = '#1d4ed8';
    theme.secondaryColor = '#3b82f6';
  } else if (p.includes('green') || p.includes('organic')) {
    theme.primaryColor = '#15803d';
    theme.secondaryColor = '#22c55e';
  } else if (p.includes('red')) {
    theme.primaryColor = '#b91c1c';
    theme.secondaryColor = '#ef4444';
  } else if (p.includes('purple') || p.includes('violet')) {
    theme.primaryColor = '#6d28d9';
    theme.secondaryColor = '#8b5cf6';
  } else if (p.includes('dark')) {
    theme.backgroundColor = '#0b0f19';
    theme.textColor = '#f3f4f6';
    theme.primaryColor = theme.primaryColor === '#1e1b18' || theme.primaryColor === '#18181b' ? '#3b82f6' : theme.primaryColor;
  } else if (p.includes('orange') || p.includes('yellow')) {
    theme.primaryColor = '#ea580c';
    theme.secondaryColor = '#f97316';
  }

  // Typography keywords
  if (p.includes('serif') || p.includes('classic') || p.includes('luxury') || p.includes('elegant')) {
    theme.fontFamily = 'font-serif';
  } else if (p.includes('monospace') || p.includes('code') || p.includes('tech')) {
    theme.fontFamily = 'font-mono';
  } else if (p.includes('clean') || p.includes('minimal') || p.includes('professional') || p.includes('modern')) {
    theme.fontFamily = 'font-sans';
  }

  return {
    industry: detectedIndustry,
    businessName,
    theme
  };
};

// Generates component objects populated with rich custom copy
export const generateComponentData = (
  type: ComponentType,
  industry: Industry,
  businessName: string,
  _theme?: ThemeConfig
): WebsiteComponent => {
  const id = `${type.toLowerCase()}-${genId()}`;
  const comp: WebsiteComponent = {
    id,
    type,
    title: `${type} Section`,
    fields: {}
  };

  // Prepopulate editable fields based on component type and industry
  switch (type) {
    case 'Navbar':
      comp.fields = {
        logoText: { id: 'logoText', label: 'Logo Text', type: 'text', value: businessName },
        links: { id: 'links', label: 'Navigation Links', type: 'list', value: ['Home', 'About', 'Services', 'Products', 'Blog', 'Contact'] }
      };
      break;

    case 'Hero': {
      let headline = `Welcome to ${businessName}`;
      let subheadline = `We provide premium solutions tailored to your unique requirements. Enjoy convenience and state-of-the-art experiences today.`;
      let ctaText = `Get Started`;
      let bgImg = `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80`;

      if (industry === 'E-commerce') {
        headline = `Fresh Groceries & Essentials Delivered Fast`;
        subheadline = `Shop organic fruits, fresh farm vegetables, daily dairy products, and household essentials. Delivered straight to your doorstep in 15 minutes.`;
        ctaText = `Order Now`;
        bgImg = `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80`;
      } else if (industry === 'Healthcare') {
        headline = `Professional Medical Care You Can Trust`;
        subheadline = `Our clinics bring together world-class medical experts, modern diagnostics tools, and a comforting environment for you and your family.`;
        ctaText = `Book Appointment`;
        bgImg = `https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80`;
      } else if (industry === 'Restaurant') {
        headline = `Delicious Dining & Online Ordering`;
        subheadline = `Indulge in authentic recipes crafted by our award-winning master chefs. Order hot, tasty dishes online or reserve your cozy table.`;
        ctaText = `Explore Menu`;
        bgImg = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80`;
      } else if (industry === 'Gym') {
        headline = `Unleash Your Ultimate Potential`;
        subheadline = `Get access to elite trainers, premium workout equipment, custom diet plans, and a community dedicated to achieving absolute greatness.`;
        ctaText = `Join Apex Today`;
        bgImg = `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80`;
      } else if (industry === 'Real Estate') {
        headline = `Find Your Dream Home & Property`;
        subheadline = `Explore exclusive premium listings in your favorite locations. From luxury urban apartments to spacious suburban houses, we make buying easy.`;
        ctaText = `Browse Listings`;
        bgImg = `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80`;
      } else if (industry === 'Portfolio') {
        headline = `Hi, I am ${businessName} — Creative Tech Maker`;
        subheadline = `I build full-stack web applications, custom microservices, and interactive UI systems that delight users. Let's build something remarkable.`;
        ctaText = `View My Work`;
        bgImg = `https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80`;
      } else if (industry === 'Agency') {
        headline = `Scale Your Business to the Next Level`;
        subheadline = `We design custom brand guidelines, optimize conversion pipelines, and deliver measurable growth strategies. Let us take care of the tech.`;
        ctaText = `Free Strategy Call`;
        bgImg = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80`;
      }

      comp.fields = {
        headline: { id: 'headline', label: 'Headline', type: 'text', value: headline },
        subheadline: { id: 'subheadline', label: 'Subheadline', type: 'textarea', value: subheadline },
        ctaText: { id: 'ctaText', label: 'Button Text', type: 'text', value: ctaText },
        backgroundImage: { id: 'backgroundImage', label: 'Background Image URL', type: 'image', value: bgImg }
      };
      break;
    }

    case 'Cards': {
      let sectionTitle = `Our Core Values & Strengths`;
      let cards = [
        { title: 'Top Rated Quality', desc: 'We maintain strict standards to ensure only premium services and products reach you.', icon: 'Award' },
        { title: 'Always Available', desc: 'Our customer support and automated systems run 24/7 to resolve queries.', icon: 'Clock' },
        { title: 'Secure Operations', desc: 'All transactions, interactions, and details are encrypted securely.', icon: 'ShieldCheck' }
      ];

      if (industry === 'Healthcare') {
        sectionTitle = `Our Dedicated Services`;
        cards = [
          { title: 'General Checkup', desc: 'Comprehensive physiological monitoring and diagnosis.', icon: 'Stethoscope' },
          { title: '24/7 Emergency Care', desc: 'Ready doctors and ambulances for absolute emergencies.', icon: 'Activity' },
          { title: 'Dental Surgery', desc: 'Expert dentists providing orthodontics and cosmetic operations.', icon: 'HeartPulse' }
        ];
      } else if (industry === 'School') {
        sectionTitle = `Academic Programs`;
        cards = [
          { title: 'Primary Classes', desc: 'Nurturing curiosity, logical science, and elementary maths.', icon: 'BookOpen' },
          { title: 'Advanced Science Lab', desc: 'Hands-on training in physics, coding, chemistry, and biology.', icon: 'FlaskConical' },
          { title: 'Creative Sports Club', desc: 'Fostering teamwork, soccer, athletics, and spatial reflexes.', icon: 'Trophy' }
        ];
      } else if (industry === 'Restaurant') {
        sectionTitle = `Why Customers Love Us`;
        cards = [
          { title: 'Fresh Ingredients', desc: 'Directly sourced from trusted local organic farms daily.', icon: 'Leaf' },
          { title: 'Master Chef Recipes', desc: 'Specialized seasoning and cooking secrets by chef gourmet.', icon: 'Utensils' },
          { title: 'Super Fast Delivery', desc: 'Eco-friendly insulated packs keeping the food smoking hot.', icon: 'Zap' }
        ];
      } else if (industry === 'Real Estate') {
        sectionTitle = `Why Choose Our Agents`;
        cards = [
          { title: 'Direct Brokerage', desc: 'Zero hidden fees or surprise costs in final closing terms.', icon: 'DollarSign' },
          { title: 'Premium Neighborhoods', desc: 'We filter for highly secure zones with excellent schools.', icon: 'MapPin' },
          { title: 'Virtual Tours', desc: 'Explore layouts inside high-definition interactive 3D guides.', icon: 'Sparkles' }
        ];
      } else if (industry === 'Agency') {
        sectionTitle = `Our Core Specializations`;
        cards = [
          { title: 'UI/UX Design', desc: 'Crafting visually stunning, user-centered software experiences.', icon: 'Layers' },
          { title: 'Growth Marketing', desc: 'Running smart ROI-focused ads and automated sales funnels.', icon: 'TrendingUp' },
          { title: 'Custom Development', desc: 'Scalable NextJS, databases, and microservices engines.', icon: 'Code' }
        ];
      }

      comp.fields = {
        sectionTitle: { id: 'sectionTitle', label: 'Section Title', type: 'text', value: sectionTitle },
        cardItems: { id: 'cardItems', label: 'Cards List', type: 'list', value: cards }
      };
      break;
    }

    case 'Products': {
      let sectionTitle = `Our Featured Listings`;
      let products = [
        { name: 'Standard Solution Pack', price: '$49.00', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', desc: 'Complete access to basic tools and services.' },
        { name: 'Enterprise Bundle Kit', price: '$129.00', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', desc: 'Professional scale with absolute automation.' }
      ];

      if (industry === 'E-commerce') {
        sectionTitle = `Trending Groceries`;
        products = [
          { name: 'Organic Fresh Avocados (4-pack)', price: '$5.99', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80', desc: 'Creamy and ripe avocados sourced directly from local organic growers.' },
          { name: 'Fresh Farm Strawberries (500g)', price: '$3.49', img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80', desc: 'Sweet, juicy red strawberries handpicked at the peak of ripeness.' },
          { name: 'Premium Almond Milk (1L)', price: '$4.25', img: 'https://images.unsplash.com/photo-1568651343853-241f89410d99?auto=format&fit=crop&w=400&q=80', desc: 'Unsweetened plant-based milk enriched with essential calcium and vitamins.' },
          { name: 'Multigrain Sourdough Bread', price: '$4.99', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', desc: 'Freshly baked artisanal bread with rich seeds, fibers, and crispy crust.' }
        ];
      } else if (industry === 'Restaurant') {
        sectionTitle = `Chef's Special Dishes`;
        products = [
          { name: 'Truffle Mushroom Fettuccine', price: '$22.50', img: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=400&q=80', desc: 'Homemade pasta tossed in light parmesan butter, wild herbs, and white truffle glaze.' },
          { name: 'Seared Rosemary Salmon', price: '$28.00', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80', desc: 'Crispy skin salmon filet accompanied by garlic asparagus and buttery citrus cream.' },
          { name: 'Apex Cheeseburger & Crisp Fries', price: '$17.00', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', desc: 'Prime double beef patty, smoked cheddar, house pickle sauce on soft toasted brioche.' }
        ];
      } else if (industry === 'Real Estate') {
        sectionTitle = `Available Premium Properties`;
        products = [
          { name: 'The Meridian Heights Penthouse', price: '$1,250,000', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80', desc: '3 bed, 3 bath luxury penthouse in downtown with stunning floor-to-ceiling city views.' },
          { name: 'Spacious Whispering Pines Villa', price: '$780,000', img: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=400&q=80', desc: 'Beautiful family home, 4 bed, 2.5 bath featuring high ceilings, wide yard, and pool.' }
        ];
      } else if (industry === 'Portfolio') {
        sectionTitle = `Recent Projects Built`;
        products = [
          { name: 'SaaS Builder Interface', price: 'GitHub Code', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80', desc: 'A drag & drop React app allowing visual templates assembly and export code downloads.' },
          { name: 'Analytics Telemetry Pipeline', price: 'Live Demo', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', desc: 'Real-time telemetry aggregator handling 100k events/sec using custom stream queue.' }
        ];
      }

      comp.fields = {
        sectionTitle: { id: 'sectionTitle', label: 'Section Title', type: 'text', value: sectionTitle },
        productItems: { id: 'productItems', label: 'Products List', type: 'list', value: products }
      };
      break;
    }

    case 'Forms': {
      let sectionTitle = `Contact Our Team`;
      let formFields = [
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your name' },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
        { name: 'message', label: 'Your Message', type: 'textarea', placeholder: 'How can we help you?' }
      ];
      let submitText = `Send Message`;

      if (industry === 'Healthcare') {
        sectionTitle = `Book an Appointment Today`;
        formFields = [
          { name: 'fullName', label: 'Patient Name', type: 'text', placeholder: 'John Doe' },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000' },
          { name: 'dept', label: 'Medical Department', type: 'text', placeholder: 'e.g., Cardiology, General Practice' },
          { name: 'date', label: 'Preferred Appointment Date', type: 'text', placeholder: 'MM/DD/YYYY' }
        ];
        submitText = `Schedule Visit`;
      } else if (industry === 'Restaurant') {
        sectionTitle = `Reserve a Table`;
        formFields = [
          { name: 'fullName', label: 'Guest Name', type: 'text', placeholder: 'Your Name' },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'For booking receipt' },
          { name: 'guests', label: 'Number of Guests', type: 'text', placeholder: 'e.g., 2, 4, or 6 people' },
          { name: 'time', label: 'Reservation Time', type: 'text', placeholder: 'e.g., Friday, 7:30 PM' }
        ];
        submitText = `Confirm Table`;
      } else if (industry === 'School') {
        sectionTitle = `Admissions & Inquiries Form`;
        formFields = [
          { name: 'parentName', label: 'Parent/Guardian Name', type: 'text', placeholder: 'Enter name' },
          { name: 'studentAge', label: 'Student Age & Class', type: 'text', placeholder: 'e.g., 10 years, Grade 5' },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter contact email' },
          { name: 'questions', label: 'Questions / Inquiry Notes', type: 'textarea', placeholder: 'Ask us anything about admissions' }
        ];
        submitText = `Submit Inquiry`;
      }

      comp.fields = {
        sectionTitle: { id: 'sectionTitle', label: 'Section Title', type: 'text', value: sectionTitle },
        formFields: { id: 'formFields', label: 'Form Input Fields', type: 'list', value: formFields },
        submitText: { id: 'submitText', label: 'Submit Button Label', type: 'text', value: submitText }
      };
      break;
    }

    case 'Testimonials': {
      let sectionTitle = `What Our Happy Clients Say`;
      let list = [
        { quote: `Absolute perfection! The onboarding was simple, the product functions correctly, and support was lightning fast. Highly recommend.`, author: `Sarah Jenkins`, role: `VP Operations, TechNova`, avatar: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80` },
        { quote: `They helped us double our business metrics within four months of implementing their systems. Simply outstanding value.`, author: `David Chen`, role: `Founder, GreenMarket`, avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80` }
      ];

      if (industry === 'Healthcare') {
        list = [
          { quote: `Dr. Rivera and the team were incredibly attentive. They diagnosed my knee pain immediately and the therapy was great.`, author: `Alice Patterson`, role: `Patient since 2024`, avatar: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80` },
          { quote: `Very sanitary facilities, gentle nurses, and prompt service. I was in and out for my routine screening in just 30 minutes!`, author: `Marcus Broady`, role: `Patient`, avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80` }
        ];
      } else if (industry === 'Restaurant') {
        list = [
          { quote: `The truffle mushrooms pasta was rich, creamy, and flavorful. Online delivery arrived hot in under 20 minutes!`, author: `Emily Vance`, role: `Local Food Critic`, avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80` },
          { quote: `Cozy ambient seating, extremely polite servers, and the cheeseburger is the best in the city. A absolute 10/10.`, author: `Roberto Santino`, role: `Gourmet Food Blogger`, avatar: `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80` }
        ];
      }

      comp.fields = {
        sectionTitle: { id: 'sectionTitle', label: 'Section Title', type: 'text', value: sectionTitle },
        testimonialsList: { id: 'testimonialsList', label: 'Testimonials', type: 'list', value: list }
      };
      break;
    }

    case 'Pricing': {
      let sectionTitle = `Transparent Pricing Plans`;
      let plans = [
        { name: 'Starter Pack', price: '$19', period: 'mo', features: ['Basic features access', 'Single user account', 'Email support access', 'Weekly status logs'], btnText: 'Get Started', popular: false },
        { name: 'Professional Pro', price: '$49', period: 'mo', features: ['Unlimited system integrations', 'Up to 5 team members', 'Priority 24/7 support calls', 'Automated cloud backups'], btnText: 'Buy Pro', popular: true },
        { name: 'Enterprise Core', price: '$99', period: 'mo', features: ['Custom enterprise APIs', 'Dedicated system manager', 'White-labeled logs export', '99.9% uptime SLA'], btnText: 'Contact Sales', popular: false }
      ];

      if (industry === 'Gym') {
        sectionTitle = `Flexible Membership Plans`;
        plans = [
          { name: 'Basic Access', price: '$29', period: 'mo', features: ['Access to all gym floor machines', 'Locker and shower access', 'Free physical evaluation'], btnText: 'Sign Up', popular: false },
          { name: 'Pro Workout', price: '$59', period: 'mo', features: ['Unlimited fitness group classes', '2 sessions with personal trainer', 'Access to sauna and recovery spa'], btnText: 'Join Pro', popular: true },
          { name: 'Elite Performance', price: '$99', period: 'mo', features: ['Unlimited personal coaching', 'Custom meal & supplement plan', 'Free protein shakes & apparel pack'], btnText: 'Join Elite', popular: false }
        ];
      } else if (industry === 'Agency') {
        sectionTitle = `Simple Project Retainers`;
        plans = [
          { name: 'Growth Campaign', price: '$1,500', period: 'mo', features: ['Custom SEO content calendar', 'Management of $2k ad spends', 'Bi-weekly analytics summaries'], btnText: 'Select Growth', popular: false },
          { name: 'Brand & Product Scaler', price: '$3,800', period: 'mo', features: ['Complete custom web design (Vite/NextJS)', 'Full branding style guidelines', 'Interactive social ad campaigns', 'Priority Slack support channels'], btnText: 'Approve Scaler', popular: true }
        ];
      }

      comp.fields = {
        sectionTitle: { id: 'sectionTitle', label: 'Section Title', type: 'text', value: sectionTitle },
        plansList: { id: 'plansList', label: 'Pricing Plans', type: 'list', value: plans }
      };
      break;
    }

    case 'Footer':
      comp.fields = {
        copyright: { id: 'copyright', label: 'Copyright Text', type: 'text', value: `© 2026 ${businessName}. All rights reserved. Created with AI Builder.` },
        socials: { id: 'socials', label: 'Social Networks', type: 'list', value: ['Twitter', 'Facebook', 'Instagram', 'LinkedIn'] }
      };
      break;
  }

  return comp;
};

// Builds a complete pages structure for the website config
export const createInitialConfig = (
  industry: Industry,
  businessName: string,
  theme: ThemeConfig
): WebsiteConfig => {
  const logoSvg = generateLogoSvg(businessName, industry, theme.primaryColor);

  const pageIds: { id: string; name: string; types: ComponentType[] }[] = [
    { id: 'home', name: 'Home', types: ['Navbar', 'Hero', 'Cards', 'Products', 'Testimonials', 'Pricing', 'Footer'] },
    { id: 'about', name: 'About Us', types: ['Navbar', 'Hero', 'Cards', 'Testimonials', 'Footer'] },
    { id: 'services', name: 'Services', types: ['Navbar', 'Hero', 'Cards', 'Pricing', 'Footer'] },
    { id: 'products', name: 'Products', types: ['Navbar', 'Hero', 'Products', 'Footer'] },
    { id: 'blog', name: 'Blog', types: ['Navbar', 'Hero', 'Cards', 'Footer'] },
    { id: 'contact', name: 'Contact', types: ['Navbar', 'Hero', 'Forms', 'Footer'] }
  ];

  // For About, Blog, etc. we need custom text variations. We can do that by generating components and then slightly adapting fields
  const pages: Record<string, WebPage> = {};

  pageIds.forEach((pInfo) => {
    const components: WebsiteComponent[] = pInfo.types.map((type) => {
      const comp = generateComponentData(type, industry, businessName, theme);
      
      // Customize components depending on page context
      if (pInfo.id === 'about') {
        if (type === 'Hero') {
          comp.fields.headline.value = `About Our Mission & Journey`;
          comp.fields.subheadline.value = `We began with a simple idea: to bring absolute quality and integrity to our users. Discover the values that push our teams every single day.`;
          comp.fields.ctaText.value = `Meet Our Team`;
        }
        if (type === 'Cards') {
          comp.fields.sectionTitle.value = `Meet Our Leaders`;
          comp.fields.cardItems.value = [
            { title: 'Dr. Evelyn Adams', desc: 'Chief Executive Officer with 15+ years of strategic management.', icon: 'User' },
            { title: 'Marcus Vance', desc: 'Lead Creative Designer pushing visual styles to premium levels.', icon: 'Palette' },
            { title: 'Sarah Chen', desc: 'VP Engineering managing our high-volume server platforms.', icon: 'Terminal' }
          ];
        }
      } else if (pInfo.id === 'services') {
        if (type === 'Hero') {
          comp.fields.headline.value = `Premium Services We Offer`;
          comp.fields.subheadline.value = `Discover customized programs engineered to optimize your output and secure your health, growth, or academic success.`;
          comp.fields.ctaText.value = `View Package Prices`;
        }
      } else if (pInfo.id === 'blog') {
        if (type === 'Hero') {
          comp.fields.headline.value = `Insights, News & Updates`;
          comp.fields.subheadline.value = `Stay ahead with articles written directly by our industry experts. We share strategies, recipes, health guides, and trends daily.`;
          comp.fields.ctaText.value = `Subscribe to Newsletter`;
        }
        if (type === 'Cards') {
          comp.fields.sectionTitle.value = `Latest Articles`;
          comp.fields.cardItems.value = [
            { title: 'Optimizing Daily Routines for Peak Health', desc: 'Discover 5 easy tricks that boost cognitive focus and physical energy levels within days.', icon: 'BookOpen' },
            { title: 'Trending Architectures in Modern SaaS Design', desc: 'An in-depth look at utility style grids, responsive glassmorphism containers, and animations.', icon: 'Laptop' },
            { title: 'Top Recipes Handpicked by Our Gourmet Chefs', desc: 'Unravel seasoning tips and cooking temperatures that elevate ordinary dinners to gourmet levels.', icon: 'Utensils' }
          ];
        }
      } else if (pInfo.id === 'contact') {
        if (type === 'Hero') {
          comp.fields.headline.value = `Get in Touch Today`;
          comp.fields.subheadline.value = `Have questions or want to partner with us? Fill out the short form below, and our representatives will reach out in under 12 hours.`;
          comp.fields.ctaText.value = `Call Us Directly`;
        }
      }

      return comp;
    });

    pages[pInfo.id] = {
      id: pInfo.id,
      name: pInfo.name,
      components
    };
  });

  return {
    businessName,
    industry,
    logoSvg,
    theme,
    pages
  };
};
