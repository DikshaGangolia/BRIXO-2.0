export type ThemeType =
  | 'Modern'
  | 'Minimal'
  | 'Luxury'
  | 'Corporate'
  | 'Dark'
  | 'Creative'
  | 'Neon'
  | 'Glassmorphism';

export type ComponentType =
  | 'Navbar'
  | 'Hero'
  | 'Features'
  | 'Services'
  | 'Products'
  | 'Gallery'
  | 'Testimonials'
  | 'Pricing'
  | 'FAQ'
  | 'Blog'
  | 'ContactForm'
  | 'Map'
  | 'Footer'
  | 'Banner'
  | 'Stats'
  | 'Team'
  | 'VideoSection'
  | 'Newsletter';

export interface DesignTokens {
  primaryColor: string;      // e.g., '#3b82f6'
  secondaryColor: string;    // e.g., '#1d4ed8'
  accentColor: string;       // e.g., '#f59e0b'
  backgroundColor: string;   // e.g., '#ffffff'
  textColor: string;         // e.g., '#1e293b'
  fontFamily: string;        // 'font-sans', 'font-serif', 'font-mono'
  borderRadius: string;      // 'rounded-none', 'rounded-md', 'rounded-xl', 'rounded-3xl', 'rounded-full'
  boxShadow: string;         // 'shadow-none', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'
  glassmorphism: boolean;
  
  // Layout spacing defaults
  paddingTop: string;        // 'py-8', 'py-12', 'py-16', 'py-20', etc.
  paddingBottom: string;
  marginTop: string;         // 'my-0', 'my-4', 'my-8', etc.
  marginBottom: string;
}

export interface ComponentBlock {
  id: string;
  type: ComponentType;
  title: string;
  styles: Partial<DesignTokens>; // Component level overrides
  fields: {
    title?: string;
    subtitle?: string;
    content?: string;
    ctaText?: string;
    imageUrl?: string;
    videoUrl?: string;
    mapEmbedUrl?: string;
    items?: any[];               // For lists like pricing, features, faq, blog posts
  };
  customCode?: {
    html?: string;
    jsx?: string;
    css?: string;
    tailwindClasses?: string;
  };
}

export interface WebPage {
  id: string;
  name: string;
  path: string;
  components: ComponentBlock[];
}

export interface WebsiteConfig {
  pages: WebPage[];
  theme: ThemeType;
  designTokens: DesignTokens;
  assets: string[];
}

export interface WebsiteProject {
  id: string;
  name: string;
  category: string; // e.g. E-commerce, Restaurant
  templateName: string;
  config: WebsiteConfig;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  email: string;
  isLoggedIn: boolean;
  name?: string;
  plan?: string;
}
