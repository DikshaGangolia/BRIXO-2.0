import type { WebsiteConfig, ComponentBlock, DesignTokens, ThemeType } from '../types/builder';

// Spacing & styling token defaults
const DEFAULT_TOKENS: DesignTokens = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1d4ed8',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  fontFamily: 'font-sans',
  borderRadius: 'rounded-xl',
  boxShadow: 'shadow-md',
  glassmorphism: false,
  paddingTop: 'py-16',
  paddingBottom: 'py-16',
  marginTop: 'my-0',
  marginBottom: 'my-0'
};

const genId = (type: string) => `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;

// Core programmatic components generator helper
export const createComponent = (type: any, fields: any): ComponentBlock => ({
  id: genId(type),
  type,
  title: `${type} Section`,
  styles: {},
  fields
});

export const getTemplatePreset = (category: string, name: string): WebsiteConfig => {
  let theme: ThemeType = 'Modern';
  let designTokens: DesignTokens = { ...DEFAULT_TOKENS };
  const components: ComponentBlock[] = [];

  // Setup specific styles and layouts per preset
  const normalizedCategory = category.toLowerCase();
  const normalizedName = normalizedNameParser(name);

  // Setup Navbar & Footer for all templates
  const navbarFields = {
    title: name,
    subtitle: 'Brand logo text',
    items: ['Home', 'About', 'Services', 'Products', 'Blog', 'Contact']
  };

  const footerFields = {
    title: `© 2026 ${name}. All rights reserved.`,
    subtitle: 'Universal Visual Website Builder.',
    items: ['Twitter', 'Facebook', 'Instagram', 'LinkedIn']
  };

  // Add Navbar
  components.push(createComponent('Navbar', navbarFields));

  if (normalizedCategory === 'ecommerce') {
    theme = 'Modern';
    designTokens.primaryColor = '#0891b2';
    designTokens.secondaryColor = '#0e7490';
    designTokens.backgroundColor = '#fafafa';
    designTokens.textColor = '#1e293b';

    if (normalizedName === 'fashionstore') {
      designTokens.fontFamily = 'font-serif';
      theme = 'Luxury';
      designTokens.primaryColor = '#b45309';
      components.push(createComponent('Banner', {
        title: 'Mid-Season Sale: up to 50% off!',
        subtitle: 'Shop the latest style trends today.',
        ctaText: 'Shop Couture'
      }));
      components.push(createComponent('Hero', {
        title: 'Unveiling Modern Elegance',
        subtitle: 'Step into curated luxurious fashion collections sourced from award-winning global designers.',
        ctaText: 'View Collections',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
      }));
      components.push(createComponent('Products', {
        title: 'Featured Collection',
        items: [
          { name: 'Classic Trench Coat', price: '₹0.10', desc: 'Premium windproof materials.', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80' },
          { name: 'Linen Summer Dress', price: '₹0.10', desc: 'Breathable ecological flax fibers.', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
          { name: 'Italian Leather Boots', price: '₹0.10', desc: 'Handcrafted full-grain soles.', img: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=400&q=80' },
          { name: 'Silk Scarf', price: '₹0.10', desc: 'Pure mulberry silk.', img: 'https://images.unsplash.com/photo-1584917469897-5753827032df?auto=format&fit=crop&w=400&q=80' }
        ]
      }));
    } else if (normalizedName === 'electronicsstore') {
      theme = 'Neon';
      designTokens.primaryColor = '#3b82f6';
      designTokens.backgroundColor = '#020617';
      designTokens.textColor = '#f8fafc';
      components.push(createComponent('Hero', {
        title: 'Future Tech at Your Fingertips',
        subtitle: 'Unrivaled audio, speed, and processing power. Discover our cutting-edge gadget lineup.',
        ctaText: 'Explore Gear',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
      }));
      components.push(createComponent('Products', {
        title: 'Top Gadgets',
        items: [
          { name: 'Wireless ANC Headphones', price: '₹0.10', desc: 'Hybrid noise-cancelling tech.', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' },
          { name: 'Pro Gaming Console', price: '₹0.10', desc: 'Ultra high frame rate output.', img: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=400&q=80' },
          { name: 'Smart Watch', price: '₹0.10', desc: 'Fitness and health tracking.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' },
          { name: 'Bluetooth Speaker', price: '₹0.10', desc: 'Crystal clear sound.', img: 'https://images.unsplash.com/photo-1608156639585-340049695c73?auto=format&fit=crop&w=400&q=80' }
        ]
      }));
    } else { // grocery store
      designTokens.primaryColor = '#16a34a';
      components.push(createComponent('Hero', {
        title: 'Organic Farm Fresh Grocery',
        subtitle: '100% certified organic fruits, greens, dairy, and household essentials. Delivered in 15 mins.',
        ctaText: 'Order Fresh',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
      }));
      components.push(createComponent('Features', {
        title: 'Why Choose FreshBaskets',
        items: [
          { title: 'Locally Sourced', desc: 'Directly from ecological family farms.', icon: 'Leaf' },
          { title: 'Zero Waste Packs', desc: 'Biodegradable box materials.', icon: 'ShieldCheck' }
        ]
      }));
      components.push(createComponent('Products', {
        title: 'Fresh Fruits & Vegetables',
        items: [
          { name: 'Organic Avocados', price: '₹0.10', desc: 'Perfect ripeness guaranteed.', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80' },
          { name: 'Fresh Strawberries', price: '₹0.10', desc: 'Handpicked this morning.', img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80' },
          { name: 'Red Apples', price: '₹0.10', desc: 'Sweet and crunchy.', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?auto=format&fit=crop&w=400&q=80' },
          { name: 'Baby Spinach', price: '₹0.10', desc: 'Triple washed organic.', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80' }
        ]
      }));
    }
  }

  else if (normalizedCategory === 'restaurant') {
    theme = 'Creative';
    designTokens.primaryColor = '#ea580c';
    designTokens.secondaryColor = '#c2410c';
    designTokens.backgroundColor = '#fffaf8';
    designTokens.textColor = '#1c1917';

    if (normalizedName === 'fastfood') {
      components.push(createComponent('Hero', {
        title: 'Hot, Crispy & Delicious Fast Foods',
        subtitle: 'Double flame-broiled beef patties, golden French fries, and ice-cold custom milkshakes.',
        ctaText: 'Order Delivery',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
      }));
    } else if (normalizedName === 'cafe') {
      designTokens.primaryColor = '#854d0e';
      components.push(createComponent('Hero', {
        title: 'Artisanal Coffee & Fresh Pastries',
        subtitle: 'Quiet seating, rich espresso roasts, and warm croissants baked right in our kitchen.',
        ctaText: 'Browse Menu',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
      }));
    } else { // fine dining
      theme = 'Luxury';
      designTokens.primaryColor = '#b45309';
      designTokens.backgroundColor = '#0b0f19';
      designTokens.textColor = '#f3f4f6';
      components.push(createComponent('Hero', {
        title: 'An Unforgettable Culinary Journey',
        subtitle: 'Indulge in seasonal multi-course recipes curated by Michelin-star master chefs.',
        ctaText: 'Reserve Table',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
      }));
    }
    
    // Add Menu/Products for Restaurant
    components.push(createComponent('Products', {
      title: 'Our Signature Menu',
      items: [
        { name: 'Truffle Mushroom Fettuccine', price: '₹0.10', desc: 'Rich butter sauce, fresh parmesan, white glaze.', img: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=400&q=80' },
        { name: 'Pan-Seared Rosemary Salmon', price: '₹0.10', desc: 'Accompanied by garlic green asparagus.', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80' },
        { name: 'Wagyu Beef Burger', price: '₹0.10', desc: 'Caramelized onions, aged cheddar.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
        { name: 'Caesar Salad', price: '₹0.10', desc: 'Crispy romaine, herb croutons.', img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=400&q=80' }
      ]
    }));
  }

  else if (normalizedCategory === 'healthcare') {
    theme = 'Corporate';
    designTokens.primaryColor = '#0d9488'; // Teal
    designTokens.secondaryColor = '#0f766e';
    designTokens.backgroundColor = '#f8fafc';
    designTokens.textColor = '#0f172a';

    if (normalizedName === 'hospital') {
      components.push(createComponent('Hero', {
        title: 'Comprehensive 24/7 Medical Care',
        subtitle: 'Our multi-specialty trauma units bring together modern diagnostics and comforting treatment.',
        ctaText: 'Emergency Contacts',
        imageUrl: 'https://images.unsplash.com/photo-1586543013521-2ef66be008c2?auto=format&fit=crop&w=800&q=80'
      }));
    } else if (normalizedName === 'clinic') {
      components.push(createComponent('Hero', {
        title: 'Professional Care for Your Family',
        subtitle: 'General checkups, health physiological tracking, pediatric screenings, and vaccinations.',
        ctaText: 'Book Appointment',
        imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
      }));
    } else { // dental
      components.push(createComponent('Hero', {
        title: 'Achieve Your Perfect Healthy Smile',
        subtitle: 'State-of-the-art biological dentistry, orthodontic braces, crowns, and cleaning plans.',
        ctaText: 'Schedule Screening',
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80'
      }));
    }

    components.push(createComponent('Services', {
      title: 'Our Specialties',
      items: [
        { title: 'Internal Diagnostics', desc: 'Physiological checks and custom telemetry.' },
        { title: 'Emergency Ward', desc: 'Active specialists available 24/7.' }
      ]
    }));
    
    components.push(createComponent('ContactForm', {
      title: 'Request a Health Slot Booking',
      ctaText: 'Schedule Now'
    }));
  }

  else if (normalizedCategory === 'business') {
    theme = 'Corporate';
    designTokens.primaryColor = '#1e3a8a';
    designTokens.secondaryColor = '#2563eb';
    designTokens.backgroundColor = '#f8fafc';

    if (normalizedName === 'agency') {
      theme = 'Creative';
      designTokens.primaryColor = '#7c3aed';
      components.push(createComponent('Hero', {
        title: 'We Design Remarkable Digital Experiences',
        subtitle: 'A full-stack agency blending UI design, custom React applications, and ROI scaling scripts.',
        ctaText: 'Work with Us',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
      }));
    } else if (normalizedName === 'startup') {
      components.push(createComponent('Hero', {
        title: 'Accelerate Core Business Growth',
        subtitle: 'Build SaaS modules, monitor serverless analytics streams, and configure team dashboards.',
        ctaText: 'Start Free Trial',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
      }));
    } else { // consulting
      components.push(createComponent('Hero', {
        title: 'Strategic Insights for Modern Enterprise',
        subtitle: 'Risk management audits, operations optimization maps, and global tax compliance reports.',
        ctaText: 'Request Consult',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
      }));
    }

    components.push(createComponent('Stats', {
      title: 'Our Global Impact',
      items: [
        { title: '₹1.2B+', desc: 'Asset growth handled.' },
        { title: '99.9%', desc: 'Optimization satisfaction rate.' }
      ]
    }));
    components.push(createComponent('Pricing', {
      title: 'Transparent Plans',
      items: [
        { name: 'Growth Campaign', price: '₹999', period: 'mo', features: ['SEO Strategy', 'Social Campaign management', 'Slack priority channel'] },
        { name: 'Enterprise Core', price: '₹2499', period: 'mo', features: ['Custom systems coding', 'Telemetry monitors', 'SLA contracts'] }
      ]
    }));
  }

  else if (normalizedCategory === 'portfolio') {
    theme = 'Dark';
    designTokens.primaryColor = '#8b5cf6';
    designTokens.secondaryColor = '#6d28d9';
    designTokens.backgroundColor = '#0b0f19';
    designTokens.textColor = '#f3f4f6';

    if (normalizedName === 'designer') {
      theme = 'Glassmorphism';
      designTokens.primaryColor = '#ec4899';
      components.push(createComponent('Hero', {
        title: 'Hi, I design digital layouts that speak.',
        subtitle: '3D modeling, premium branding catalogs, and custom Figma layout designs.',
        ctaText: 'Browse Gallery',
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
      }));
    } else if (normalizedName === 'developer') {
      components.push(createComponent('Hero', {
        title: 'Building high-performance software systems.',
        subtitle: 'Specializing in robust React rendering frameworks, custom databases, and serverless streams.',
        ctaText: 'Get GitHub Code',
        imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80'
      }));
    } else { // photographer
      designTokens.primaryColor = '#10b981';
      components.push(createComponent('Hero', {
        title: 'Capturing Organic Raw Moments',
        subtitle: 'Adventure travel catalogs, luxury product campaigns, and landscape framing.',
        ctaText: 'View Portfolios',
        imageUrl: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80'
      }));
    }

    components.push(createComponent('Gallery', {
      title: 'Recent Works Showcase',
      items: [
        { title: 'Creative Brand Guide', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80' },
        { title: 'Interactive Web Dashboard', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80' }
      ]
    }));
  }

  else if (normalizedCategory === 'education') {
    theme = 'Corporate';
    designTokens.primaryColor = '#1e3a8a';
    designTokens.secondaryColor = '#3b82f6';
    designTokens.backgroundColor = '#fafafa';

    if (normalizedName === 'school') {
      components.push(createComponent('Hero', {
        title: 'Nurturing Leaders of Tomorrow',
        subtitle: 'Advanced curriculum combining science, coding labs, athletic fields, and art clubs.',
        ctaText: 'Apply Today',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'
      }));
    } else if (normalizedName === 'coaching') {
      components.push(createComponent('Hero', {
        title: 'Master Entrance Exams with Experts',
        subtitle: 'Structured study plans, mock evaluations, and individual feedback coaching.',
        ctaText: 'Enroll Now',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'
      }));
    } else { // online course
      theme = 'Creative';
      designTokens.primaryColor = '#ea580c';
      components.push(createComponent('Hero', {
        title: 'Learn Modern Tech & Coding Online',
        subtitle: 'Self-paced courses written directly by senior software engineers. Lifetime access.',
        ctaText: 'Browse Courses',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
      }));
    }

    components.push(createComponent('Features', {
      title: 'Our Learning Pillars',
      items: [
        { title: 'Interactive Video Lessons', desc: 'Frictionless streaming with checkpoints.' },
        { title: 'Expert Grading Comments', desc: 'Direct feedback on code submissions.' }
      ]
    }));
  }

  else if (normalizedCategory === 'gym') {
    theme = 'Dark';
    designTokens.primaryColor = '#dc2626'; // High energy red
    designTokens.secondaryColor = '#171717';
    designTokens.accentColor = '#facc15';
    designTokens.backgroundColor = '#0a0a0a';
    designTokens.textColor = '#f5f5f5';

    if (normalizedName === 'fitnesscenter') {
      components.push(createComponent('Hero', {
        title: 'Forge Your Absolute Ultimate Self',
        subtitle: 'Access to elite weight equipment, personal training camps, recovery pools, and custom diets.',
        ctaText: 'Get Membership',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
      }));
    } else { // personal trainer
      components.push(createComponent('Hero', {
        title: 'Custom Workouts Tailored to Your Body',
        subtitle: 'Get a dedicated fitness coach mapping custom workout regimes and supplementation routines.',
        ctaText: 'Request Evaluation',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80'
      }));
    }

    components.push(createComponent('Pricing', {
      title: 'Gym Memberships',
      items: [
        { name: 'Basic Floor', price: '₹29', period: 'mo', features: ['Gym floor access', 'Locker access'] },
        { name: 'Pro Workout Coach', price: '₹59', period: 'mo', features: ['Group sessions', 'Sauna recovery', 'Custom nutrition guidance'] }
      ]
    }));
  }

  else { // real estate - property agency
    theme = 'Corporate';
    designTokens.primaryColor = '#1e293b';
    designTokens.secondaryColor = '#475569';
    designTokens.accentColor = '#b45309';
    designTokens.backgroundColor = '#fdfdfd';

    components.push(createComponent('Hero', {
      title: 'Find Premium Houses & Properties',
      subtitle: 'Exclusive real estate listings located in highly secure, premium family neighborhoods.',
      ctaText: 'Browse Properties',
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
    }));

    components.push(createComponent('Products', {
      title: 'Exclusive Listings',
      items: [
        { name: 'The Meridian Heights Penthouse', price: '₹1.25M', desc: 'Luxury panoramic urban views.', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' },
        { name: 'Whispering Pines Villa', price: '₹780k', desc: '4 bed family home with wide pool.', img: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=400&q=80' },
        { name: 'Oceanview Estate', price: '₹2.5M', desc: 'Private beach access, 6 bedrooms.', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' },
        { name: 'Modern City Loft', price: '₹550k', desc: 'Open floor plan, industrial style.', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80' }
      ]
    }));
  }

  // Add remaining sections (FAQ, ContactForm, Testimonials, Footer)
  components.push(createComponent('Testimonials', {
    title: 'Customer Stories',
    items: [
      { quote: 'Excellent system! Delivered results ahead of schedule. Best design value in the market.', author: 'Johnathan Cole', role: 'COO TechNovation' },
      { quote: 'Highly professional setups. Support resolves queries within minutes.', author: 'Elena Rostova', role: 'Founder BioGrow' },
      { quote: 'The best builder I have ever used. Simply amazing!', author: 'Michael Chen', role: 'Product Manager' },
      { quote: 'Incredible speed and quality. Highly recommended.', author: 'Sarah Smith', role: 'Designer' }
    ]
  }));

  components.push(createComponent('FAQ', {
    title: 'Frequently Answered Questions',
    items: [
      { q: 'How does onboarding begin?', a: 'Once registered, pick a starter blueprint and visual components compile instantly.' },
      { q: 'Can I export custom source code?', a: 'Yes! Select the ZIP downloads to output raw HTML or clean Vite React configurations.' }
    ]
  }));

  // Ensure contact form is added if not already done
  if (!components.some(c => c.type === 'ContactForm')) {
    components.push(createComponent('ContactForm', {
      title: 'Get in Touch With Us',
      subtitle: 'We reply in under 12 hours.',
      ctaText: 'Submit Inquiry'
    }));
  }

  // Add Footer
  components.push(createComponent('Footer', footerFields));

  // Build Pages
  const pages = [
    { id: 'home', name: 'Home', path: '/', components },
    { id: 'about', name: 'About Us', path: '/about', components: createSubpageComponents('About Us', name, components) },
    { id: 'services', name: 'Services', path: '/services', components: createSubpageComponents('Our Services', name, components) },
    { id: 'products', name: 'Products', path: '/products', components: createSubpageComponents('Our Catalog', name, components) },
    { id: 'blog', name: 'Blog', path: '/blog', components: createSubpageComponents('News & Updates', name, components) },
    { id: 'contact', name: 'Contact', path: '/contact', components: createSubpageComponents('Contact', name, components) }
  ];

  return {
    pages,
    theme,
    designTokens,
    assets: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    ]
  };
};

// Generates subpage layout keeping headers/footers
const createSubpageComponents = (pageName: string, brandName: string, homeComponents: ComponentBlock[]): ComponentBlock[] => {
  const result: ComponentBlock[] = [];
  const nav = homeComponents.find(c => c.type === 'Navbar');
  const footer = homeComponents.find(c => c.type === 'Footer');

  if (nav) result.push(JSON.parse(JSON.stringify(nav)));

  // Custom page header banner
  result.push(createComponent('Hero', {
    title: pageName,
    subtitle: `Learn more about ${pageName} offered by ${brandName}. Experience dedicated services today.`,
    ctaText: 'Book Consult'
  }));

  // Custom Features or Content
  if (pageName.includes('Contact')) {
    result.push(createComponent('ContactForm', {
      title: `Submit Details to ${brandName}`,
      ctaText: 'Send Information'
    }));
  } else {
    result.push(createComponent('Features', {
      title: 'Core Insights',
      items: [
        { title: 'Quality Controls', desc: 'Ensuring strict compliance standards.' },
        { title: 'Global Delivery', desc: 'Expediting logistics networks.' }
      ]
    }));
  }

  if (footer) result.push(JSON.parse(JSON.stringify(footer)));
  return result;
};

const normalizedNameParser = (str: string): string => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};
