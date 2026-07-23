import axios from 'axios';
import { create } from 'zustand';
import type { WebsiteProject, UserSession } from '../types/builder';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://brixo-2-0.onrender.com';

interface AuthState {
  session: UserSession;
  projects: WebsiteProject[];
  paymentHistory: any[];
  subscriptionStatus: any;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => boolean;

  // Projects Actions
  loadProjects: () => Promise<void>;
  createProject: (project: WebsiteProject) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  updateProject: (project: WebsiteProject) => Promise<void>;
  publishProject: (id: string) => Promise<{ publishUrl: string; slug: string }>;
  fetchPaymentHistory: () => Promise<void>;
  fetchSubscriptionStatus: () => Promise<void>;
  upgradeUserPlanLocally: (plan: string) => void;
}

// Simple local storage keys
const AUTH_KEY = 'universal_builder_session';
const savedSession = JSON.parse(
  localStorage.getItem(AUTH_KEY) ||
  '{"isLoggedIn":false,"email":""}'
);

export const useAuthStore = create<AuthState>((set, get) => ({
  session: savedSession,
  projects: [],
  paymentHistory: [],
  subscriptionStatus: null,

  login: async (email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);

      const session = {
        email: user.email,
        isLoggedIn: true,
        name: user.name,
        plan: user.plan || 'free'
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      set({ session });
      await get().loadProjects();

      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      const errMsg = error.response?.data?.message || error.message || "Failed to log in";
      return { success: false, message: errMsg };
    }
  },

  signup: async (name, email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        { name, email, password }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);

      const session = {
        email: user.email,
        isLoggedIn: true,
        name: user.name,
        plan: user.plan || 'free'
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      set({ session });
      await get().loadProjects();

      return { success: true };
    } catch (error: any) {
      console.error("Signup failed:", error);
      const errMsg = error.response?.data?.message || error.message || "Failed to sign up";
      return { success: false, message: errMsg };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("token");
    set({ session: { isLoggedIn: false, email: '' }, projects: [] });
  },

  forgotPassword: (email) => {
    const users = JSON.parse(localStorage.getItem('universal_builder_users') || '[]');
    return users.some((u: any) => u.email === email);
  },

  loadProjects: async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get(
      `${API_BASE_URL}/api/projects`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const mappedProjects = response.data.projects.map((p: any) => ({
      id: p._id,
      name: p.title,
      category: p.description,
      templateName: p.data?.templateName || "",
      config: p.data,
      published: p.published || false,
      slug: p.slug || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    set({ projects: mappedProjects });
  } catch (error: any) {
    console.log("LOAD PROJECT ERROR:", error.response?.data);
    console.log(error);
    set({ projects: [] });
  }
},

  createProject: async (project) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/api/projects`,
      {
        title: project.name,
        description: project.category,
        data: project.config
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const savedProject = response.data.project;
    const mappedProject: WebsiteProject = {
      id: savedProject._id,
      name: savedProject.title,
      category: savedProject.description,
      templateName: savedProject.data?.templateName || "",
      config: savedProject.data,
      createdAt: savedProject.createdAt,
      updatedAt: savedProject.updatedAt,
    };

    set(state => ({
      projects: [...state.projects, mappedProject],
    }));

    return savedProject._id;
  } catch (error) {
    console.log("CREATE PROJECT ERROR:", error);
    return '';
  }
},

  deleteProject: async (id) => {
  console.log("Delete clicked:", id);

  try {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
      `${API_BASE_URL}/api/projects/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Delete response:", response.data);
    await get().loadProjects();
  } catch (error: any) {
    console.log("DELETE ERROR:", error.response?.data);
    console.log(error);
  }
},

  duplicateProject: async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/projects`,
      {
        title: `Copy of ${get().projects.find(p => p.id === id)?.name || 'Project'}`,
        description: 'Duplicate',
        data: get().projects.find(p => p.id === id)?.config
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const savedProject = response.data.project;
    const mappedProject: WebsiteProject = {
      id: savedProject._id,
      name: savedProject.title,
      category: savedProject.description,
      templateName: savedProject.data?.templateName || "",
      config: savedProject.data,
      createdAt: savedProject.createdAt,
      updatedAt: savedProject.updatedAt,
    };

    set(state => ({
      projects: [...state.projects, mappedProject],
    }));
  } catch (error) {
    console.log("DUPLICATE ERROR:", error);
  }
},

  updateProject: async (project) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      `${API_BASE_URL}/api/projects/${project.id}`,
      {
        title: project.name,
        description: project.category,
        data: project.config
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    set(state => ({
      projects: state.projects.map(p =>
        p.id === project.id
          ? {
              id: response.data.project._id,
              name: response.data.project.title,
              category: response.data.project.description,
              templateName: response.data.project.data?.templateName || "",
              config: response.data.project.data,
              createdAt: response.data.project.createdAt,
              updatedAt: response.data.project.updatedAt,
            }
          : p
      )
    }));
  } catch (error) {
    console.log("UPDATE PROJECT ERROR:", error);
  }
},

  publishProject: async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_BASE_URL}/api/projects/publish/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { project, publishUrl, slug, qrCodeDataUrl, qrCodeSvg } = response.data;

      set(state => ({
        projects: state.projects.map(p =>
          p.id === id
            ? {
                ...p,
                published: project.published,
                slug: project.slug,
                updatedAt: project.updatedAt,
              }
            : p
        )
      }));

      return { publishUrl, slug: project.slug, qrCodeDataUrl, qrCodeSvg };
    } catch (error: any) {
      console.log("PUBLISH ERROR:", error.response?.data);
      throw error;
    }
  },

  unpublishProject: async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_BASE_URL}/api/projects/unpublish/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      set(state => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, published: false } : p
        )
      }));

      return response.data;
    } catch (error: any) {
      console.log("UNPUBLISH ERROR:", error.response?.data);
      throw error;
    }
  },


  fetchPaymentHistory: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/payment/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        set({ paymentHistory: response.data.payments });
      }
    } catch (error) {
      console.log("FETCH PAYMENT HISTORY ERROR:", error);
    }
  },

  fetchSubscriptionStatus: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/payment/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        set(state => ({
          subscriptionStatus: response.data.subscription,
          session: {
            ...state.session,
            plan: response.data.plan
          }
        }));
        // Update local session storage to persist plan type
        const currentSession = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          ...currentSession,
          plan: response.data.plan
        }));
      }
    } catch (error) {
      console.log("FETCH SUBSCRIPTION STATUS ERROR:", error);
    }
  },

  upgradeUserPlanLocally: (plan: string) => {
    set(state => ({
      session: {
        ...state.session,
        plan
      }
    }));
    const currentSession = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      ...currentSession,
      plan
    }));
  },
}));
