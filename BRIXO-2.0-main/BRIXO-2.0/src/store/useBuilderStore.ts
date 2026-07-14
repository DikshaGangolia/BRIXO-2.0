import { create } from 'zustand';
import type { WebsiteProject, WebsiteConfig, WebPage, ComponentBlock, DesignTokens, ThemeType, ComponentType } from '../types/builder';
import { useAuthStore } from './useAuthStore';

interface BuilderState {
  activeProject: WebsiteProject | null;
  activePageId: string;
  selectedComponentId: string | null;
  viewportMode: 'desktop' | 'tablet' | 'mobile';

  // History stacks
  undoStack: WebsiteConfig[];
  redoStack: WebsiteConfig[];

  // Actions
  loadProject: (project: WebsiteProject) => void;
  setActivePageId: (pageId: string) => void;
  setSelectedComponentId: (id: string | null) => void;
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;

  // Builder operations
  addComponent: (type: ComponentType) => void;
  removeComponent: (id: string) => void;
  reorderComponent: (direction: 'up' | 'down', index: number) => void;
  duplicateComponent: (id: string) => void;
  updateComponentField: (componentId: string, fieldName: string, value: any) => void;
  updateComponentStyle: (componentId: string, styleKey: keyof DesignTokens, value: any) => void;
  updateComponentCode: (componentId: string, code: { html?: string; jsx?: string; css?: string; tailwindClasses?: string }) => void;

  // Pages operations
  addPage: (name: string) => void;
  deletePage: (id: string) => void;

  // Theme & token operations
  updateGlobalTheme: (theme: ThemeType) => void;
  updateDesignTokens: (tokens: Partial<DesignTokens>) => void;

  // History controls
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  saveActiveProject: () => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  activeProject: null,
  activePageId: 'home',
  selectedComponentId: null,
  viewportMode: 'desktop',
  undoStack: [],
  redoStack: [],

  loadProject: (project) => {
  set({
    activeProject: project,
    activePageId: project.config?.pages?.[0]?.id || 'home',
    selectedComponentId: null,
    undoStack: [],
    redoStack: []
  });
},

  setActivePageId: (pageId) => {
    set({ activePageId: pageId, selectedComponentId: null });
  },

  setSelectedComponentId: (id) => {
    set({ selectedComponentId: id });
  },

  setViewportMode: (mode) => {
    set({ viewportMode: mode });
  },

  // Save the current config snapshot into history
  pushHistory: () => {
    const activeProject = get().activeProject;
    if (!activeProject) return;

    // Deep clone config
    const currentConfig = JSON.parse(JSON.stringify(activeProject.config));
    set(state => {
      const newUndo = [...state.undoStack, currentConfig];
      if (newUndo.length > 20) newUndo.shift(); // Limit history stack size
      return {
        undoStack: newUndo,
        redoStack: [] // Clear redo on action
      };
    });
  },

  undo: () => {
    const { undoStack, activeProject } = get();
    if (undoStack.length === 0 || !activeProject) return;

    set(state => {
      const previousConfig = state.undoStack[state.undoStack.length - 1];
      const newUndo = state.undoStack.slice(0, -1);
      const newRedo = [...state.redoStack, JSON.parse(JSON.stringify(activeProject.config))];

      const updatedProject = {
        ...activeProject,
        config: previousConfig,
        updatedAt: new Date().toISOString()
      };

      return {
        activeProject: updatedProject,
        undoStack: newUndo,
        redoStack: newRedo,
        selectedComponentId: null
      };
    });
    get().saveActiveProject();
  },

  redo: () => {
    const { redoStack, activeProject } = get();
    if (redoStack.length === 0 || !activeProject) return;

    set(state => {
      const nextConfig = state.redoStack[state.redoStack.length - 1];
      const newRedo = state.redoStack.slice(0, -1);
      const newUndo = [...state.undoStack, JSON.parse(JSON.stringify(activeProject.config))];

      const updatedProject = {
        ...activeProject,
        config: nextConfig,
        updatedAt: new Date().toISOString()
      };

      return {
        activeProject: updatedProject,
        undoStack: newUndo,
        redoStack: newRedo,
        selectedComponentId: null
      };
    });
    get().saveActiveProject();
  },

  addComponent: (type) => {
    const { activeProject, activePageId } = get();
    if (!activeProject) return;

    get().pushHistory();

    let defaultFields: any = {
      title: `Pre-built ${type} headline`,
      subtitle: `Customize your subtitle and detail descriptions to present your business values clearly.`,
      ctaText: `Get Started`,
      imageUrl: `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80`,
    };

    if (type === 'Navbar') {
      defaultFields = {
        title: activeProject.name || 'Brand',
        subtitle: 'Brand logo text',
        items: ['Home', 'About', 'Services', 'Products', 'Blog', 'Contact']
      };
    } else if (type === 'Footer') {
      defaultFields = {
        title: `© 2026 ${activeProject.name || 'Brand'}. All rights reserved.`,
        subtitle: 'Universal Visual Website Builder.',
        items: ['Twitter', 'Facebook', 'Instagram', 'LinkedIn']
      };
    } else if (type === 'Features' || type === 'Services') {
      defaultFields = {
        title: `Pre-built ${type} headline`,
        items: [
          { title: 'Feature Item 1', desc: 'Detail explanation of properties.', icon: 'CheckCircle' },
          { title: 'Feature Item 2', desc: 'Detail explanation of properties.', icon: 'Award' }
        ]
      };
    } else if (type === 'Products') {
      defaultFields = {
        title: 'Featured Products',
        items: [
          { name: 'Classic T-Shirt', price: '$29.99', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80', desc: 'Premium cotton everyday wear.' },
          { name: 'Denim Jacket', price: '$89.99', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80', desc: 'Rugged style for all seasons.' }
        ]
      };
    } else if (type === 'Testimonials') {
      defaultFields = {
        title: 'Customer Stories',
        items: [
          { quote: 'Excellent system! Delivered results ahead of schedule. Best design value in the market.', author: 'Johnathan Cole', role: 'COO TechNovation' },
          { quote: 'Highly professional setups. Support resolves queries within minutes.', author: 'Elena Rostova', role: 'Founder BioGrow' }
        ]
      };
    } else if (type === 'Pricing') {
      defaultFields = {
        title: 'Flexible Pricing Plans',
        items: [
          { name: 'Basic', price: '$9', period: 'mo', features: ['1 User', 'Basic Analytics', 'Standard Support'] },
          { name: 'Pro', price: '$29', period: 'mo', features: ['5 Users', 'Advanced Analytics', 'Priority Support', 'API Access'] },
          { name: 'Enterprise', price: '$99', period: 'mo', features: ['Unlimited Users', 'Real-time Telemetry', 'Dedicated Account Manager'] }
        ]
      };
    } else if (type === 'ContactForm') {
      defaultFields = {
        title: 'Get in Touch With Us',
        subtitle: 'We reply in under 12 hours.',
        ctaText: 'Submit Inquiry'
      };
    }

    const newComp: ComponentBlock = {
      id: `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      title: `${type} Section`,
      styles: {},
      fields: defaultFields
    };

    const pages = activeProject.config.pages.map(page => {
      if (page.id !== activePageId) return page;

      const newComponents = [...(page.components || [])];
      const footerIdx = newComponents.findIndex(c => c.type === 'Footer');
      if (footerIdx !== -1) {
        newComponents.splice(footerIdx, 0, newComp);
      } else {
        newComponents.push(newComp);
      }

      return { ...page, components: newComponents };
    });

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      },
      selectedComponentId: newComp.id
    });
    get().saveActiveProject();
  },

  removeComponent: (id) => {
    const { activeProject, activePageId } = get();
    if (!activeProject) return;

    get().pushHistory();

    const pages = (activeProject.config.pages || []).map(page => {
      if (page.id !== activePageId) return page;
      return {
        ...page,
        components: page.components.filter(c => c.id !== id)
      };
    });

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      },
      selectedComponentId: get().selectedComponentId === id ? null : get().selectedComponentId
    });
    get().saveActiveProject();
  },

  reorderComponent: (direction, index) => {
    const { activeProject, activePageId } = get();
    if (!activeProject) return;

    get().pushHistory();

    const pages = activeProject.config.pages.map(page => {
      if (page.id !== activePageId) return page;

      const components = [...page.components];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;

      if (targetIdx < 0 || targetIdx >= components.length) return page;

      const temp = components[index];
      components[index] = components[targetIdx];
      components[targetIdx] = temp;

      return { ...page, components };
    });

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      }
    });
    get().saveActiveProject();
  },

  duplicateComponent: (id) => {
    const { activeProject, activePageId } = get();
    if (!activeProject) return;

    get().pushHistory();

    const pages = activeProject.config.pages.map(page => {
      if (page.id !== activePageId) return page;

      const index = page.components.findIndex(c => c.id === id);
      if (index === -1) return page;

      const target = page.components[index];
      const clone: ComponentBlock = {
        ...JSON.parse(JSON.stringify(target)),
        id: `${target.type.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`,
        title: `${target.title} (Copy)`
      };

      const components = [...page.components];
      components.splice(index + 1, 0, clone);

      return { ...page, components };
    });

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      }
    });
    get().saveActiveProject();
  },

  updateComponentField: (componentId, fieldName, value) => {
    const { activeProject, activePageId } = get();
    if (!activeProject) return;

    const pages = activeProject.config.pages.map(page => {
      if (page.id !== activePageId) return page;
      return {
        ...page,
        components: page.components.map(comp => {
          if (comp.id !== componentId) return comp;
          return {
            ...comp,
            fields: {
              ...comp.fields,
              [fieldName]: value
            }
          };
        })
      };
    });

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      }
    });
    get().saveActiveProject();
  },

  updateComponentStyle: (componentId, styleKey, value) => {
    const { activeProject, activePageId } = get();
    if (!activeProject) return;

    const pages = activeProject.config.pages.map(page => {
      if (page.id !== activePageId) return page;
      return {
        ...page,
        components: page.components.map(comp => {
          if (comp.id !== componentId) return comp;
          return {
            ...comp,
            styles: {
              ...comp.styles,
              [styleKey]: value
            }
          };
        })
      };
    });

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      }
    });
    get().saveActiveProject();
  },

  updateComponentCode: (componentId, code) => {
    const { activeProject, activePageId } = get();
    if (!activeProject) return;

    get().pushHistory();

    const pages = activeProject.config.pages.map(page => {
      if (page.id !== activePageId) return page;
      return {
        ...page,
        components: page.components.map(comp => {
          if (comp.id !== componentId) return comp;
          return {
            ...comp,
            customCode: {
              ...comp.customCode,
              ...code
            }
          };
        })
      };
    });

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      }
    });
    get().saveActiveProject();
  },

  addPage: (name) => {
    const { activeProject } = get();
    if (!activeProject) return;

    get().pushHistory();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const path = `/${id}`;

    // Copy components from Home (Navbar/Footer) to keep template consistency
    const homePage = activeProject.config.pages.find(p => p.id === 'home');
    const defaultComponents: ComponentBlock[] = [];

    if (homePage) {
      const nav = homePage.components.find(c => c.type === 'Navbar');
      const footer = homePage.components.find(c => c.type === 'Footer');
      if (nav) defaultComponents.push(JSON.parse(JSON.stringify(nav)));

      // Add a default body section
      defaultComponents.push({
        id: `hero-${Math.random().toString(36).substring(2, 9)}`,
        type: 'Hero',
        title: `${name} Page Banner`,
        styles: {},
        fields: {
          title: `Welcome to the ${name} page`,
          subtitle: `Learn more about our services, projects, and contact info.`,
          ctaText: `Explore More`
        }
      });

      if (footer) defaultComponents.push(JSON.parse(JSON.stringify(footer)));
    }

    const newPage: WebPage = {
      id,
      name,
      path,
      components: defaultComponents
    };

    set({
      activeProject: {
        ...activeProject,
        config: {
          ...activeProject.config,
          pages: [...activeProject.config.pages, newPage]
        },
        updatedAt: new Date().toISOString()
      },
      activePageId: id
    });
    get().saveActiveProject();
  },

  deletePage: (id) => {
    const { activeProject } = get();
    if (!activeProject || id === 'home') return; // Cannot delete home page

    get().pushHistory();

    const pages = activeProject.config.pages.filter(p => p.id !== id);

    set({
      activeProject: {
        ...activeProject,
        config: { ...activeProject.config, pages },
        updatedAt: new Date().toISOString()
      },
      activePageId: 'home'
    });
    get().saveActiveProject();
  },

  updateGlobalTheme: (theme) => {
    const { activeProject } = get();
    if (!activeProject) return;

    get().pushHistory();

    // Map theme names to color palettes
    let primaryColor = '#3b82f6';
    let secondaryColor = '#1d4ed8';
    let accentColor = '#f59e0b';
    let backgroundColor = '#ffffff';
    let textColor = '#0f172a';
    let fontFamily = 'font-sans';
    let borderRadius = 'rounded-xl';
    let boxShadow = 'shadow-md';
    let glassmorphism = false;

    switch (theme) {
      case 'Minimal':
        primaryColor = '#18181b';
        secondaryColor = '#3f3f46';
        accentColor = '#71717a';
        backgroundColor = '#fafafa';
        textColor = '#18181b';
        fontFamily = 'font-sans';
        borderRadius = 'rounded-none';
        boxShadow = 'shadow-none';
        break;
      case 'Luxury':
        primaryColor = '#d97706'; // Gold
        secondaryColor = '#1e1b4b';
        accentColor = '#fcd34d';
        backgroundColor = '#0b0b14'; // Dark navy
        textColor = '#f3f4f6';
        fontFamily = 'font-serif';
        borderRadius = 'rounded-sm';
        boxShadow = 'shadow-xl';
        break;
      case 'Corporate':
        primaryColor = '#0f172a';
        secondaryColor = '#0284c7';
        accentColor = '#f59e0b';
        backgroundColor = '#f8fafc';
        textColor = '#1e293b';
        fontFamily = 'font-sans';
        borderRadius = 'rounded-md';
        boxShadow = 'shadow-sm';
        break;
      case 'Dark':
        primaryColor = '#3b82f6';
        secondaryColor = '#60a5fa';
        accentColor = '#fbbf24';
        backgroundColor = '#090d16';
        textColor = '#f3f4f6';
        fontFamily = 'font-sans';
        borderRadius = 'rounded-xl';
        boxShadow = 'shadow-2xl';
        break;
      case 'Creative':
        primaryColor = '#ec4899'; // Pink
        secondaryColor = '#8b5cf6'; // Purple
        accentColor = '#14b8a6';
        backgroundColor = '#faf5ff';
        textColor = '#2e1065';
        fontFamily = 'font-sans';
        borderRadius = 'rounded-3xl';
        boxShadow = 'shadow-lg';
        break;
      case 'Neon':
        primaryColor = '#22c55e'; // Bright green
        secondaryColor = '#10b981';
        accentColor = '#06b6d4';
        backgroundColor = '#020617';
        textColor = '#f8fafc';
        fontFamily = 'font-mono';
        borderRadius = 'rounded-lg';
        boxShadow = 'shadow-[0_0_15px_rgba(34,197,94,0.3)]';
        break;
      case 'Glassmorphism':
        primaryColor = '#ffffff';
        secondaryColor = '#e2e8f0';
        accentColor = '#6366f1';
        backgroundColor = 'linear-gradient(to right, #4f46e5, #06b6d4)';
        textColor = '#ffffff';
        fontFamily = 'font-sans';
        borderRadius = 'rounded-2xl';
        boxShadow = 'shadow-xl';
        glassmorphism = true;
        break;
    }

    const updatedTokens: DesignTokens = {
      ...activeProject.config.designTokens,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      fontFamily,
      borderRadius,
      boxShadow,
      glassmorphism
    };

    set({
      activeProject: {
        ...activeProject,
        config: {
          ...activeProject.config,
          theme,
          designTokens: updatedTokens
        },
        updatedAt: new Date().toISOString()
      }
    });
    get().saveActiveProject();
  },

  updateDesignTokens: (tokens) => {
    const { activeProject } = get();
    if (!activeProject) return;

    set({
      activeProject: {
        ...activeProject,
        config: {
          ...activeProject.config,
          designTokens: {
            ...activeProject.config.designTokens,
            ...tokens
          }
        },
        updatedAt: new Date().toISOString()
      }
    });
    get().saveActiveProject();
  },

  saveActiveProject: async () => {
  const activeProject = get().activeProject;
  if (!activeProject) return;

  await useAuthStore.getState().updateProject(activeProject);
}
}));
