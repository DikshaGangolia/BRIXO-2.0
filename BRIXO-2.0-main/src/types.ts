export type Industry =
  | 'E-commerce'
  | 'Restaurant'
  | 'Healthcare'
  | 'School'
  | 'Gym'
  | 'Real Estate'
  | 'Portfolio'
  | 'Blog'
  | 'Travel'
  | 'Salon'
  | 'NGO'
  | 'Agency';

export type ComponentType =
  | 'Navbar'
  | 'Hero'
  | 'Cards'
  | 'Products'
  | 'Forms'
  | 'Testimonials'
  | 'Pricing'
  | 'Footer';

export interface ThemeConfig {
  primaryColor: string; // Hex code or Tailwind color class
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string; // e.g., 'font-sans', 'font-serif', etc.
  borderRadius: string; // 'rounded-none', 'rounded-md', 'rounded-full'
  glassmorphism: boolean;
}

export interface ComponentField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'color' | 'icon' | 'list';
  value: any;
}

export interface WebsiteComponent {
  id: string;
  type: ComponentType;
  title: string;
  fields: {
    [key: string]: ComponentField;
  };
}

export interface WebPage {
  id: string; // 'home' | 'about' | 'services' | 'products' | 'blog' | 'contact'
  name: string;
  components: WebsiteComponent[];
}

export interface WebsiteConfig {
  businessName: string;
  industry: Industry;
  logoSvg: string; // SVG code or symbol
  theme: ThemeConfig;
  pages: {
    [pageId: string]: WebPage;
  };
}

export interface DeployState {
  isDeploying: boolean;
  progress: number;
  logs: string[];
  url: string | null;
  slug?: string;
  qrCodeDataUrl?: string;
  qrCodeSvg?: string;
  targetPlatform: 'Vercel' | 'Netlify' | 'GitHub Pages' | null;
}

