import axios from 'axios';
import { create } from 'zustand';
import type { WebsiteProject, UserSession } from '../types/builder';

interface AuthState {
  session: UserSession;
  projects: WebsiteProject[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => boolean;

  // Projects Actions
  loadProjects: () => void;
  createProject: (project: WebsiteProject) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => void;
  updateProject: (project: WebsiteProject) => void;
}

// Simple local storage keys
const AUTH_KEY = 'universal_builder_session';
const USERS_KEY = 'universal_builder_users';
const PROJECTS_KEY = 'universal_builder_projects';
const savedSession = JSON.parse(
  localStorage.getItem(AUTH_KEY) ||
  '{"isLoggedIn":false,"email":""}'
);

console.log("SESSION FROM LOCAL STORAGE:", savedSession);
export const useAuthStore = create<AuthState>((set, get) => ({
  session: savedSession,
  projects: [],

  login: async (email, password) => {
  try {
    const response = await axios.post(
      "https://brixo-2-0.onrender.com/api/auth/login",
      {
        email,
        password
      }
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

    get().loadProjects();

    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
},

  signup: async (name, email, password) => {
  try {
    const response = await axios.post(
      "https://brixo-2-0.onrender.com/api/auth/register",
      {
        name,
        email,
        password
      }
    );

    const user = response.data.user;

    const session = {
      email: user.email,
      isLoggedIn: true,
      name: user.name,
      plan: user.plan || 'free'
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(session));

    set({ session });

    get().loadProjects();

    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
},

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ session: { isLoggedIn: false, email: '' }, projects: [] });
  },

  forgotPassword: (email) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.some((u: any) => u.email === email); // Mock password recovery check
  },

  loadProjects: async () => {
  try {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    const response = await axios.get(
      "https://brixo-2-0.onrender.com/api/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("PROJECT RESPONSE:", response.data);

    set({
  projects: response.data.projects.map((p: any) => ({
    id: p._id,
    name: p.title,
    category: p.description,
    templateName: p.data?.templateName || "",
    config: p.data,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  })),
});

  } catch (error: any) {
    console.log("LOAD PROJECT ERROR:", error.response?.data);
    console.log(error);
  }
},
  createProject: async (project) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "https://brixo-2-0.onrender.com/api/projects",
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

set(state => ({
  projects: [
    ...state.projects,
    {
      id: savedProject._id,
      name: savedProject.title,
      category: savedProject.description,
      templateName: savedProject.data?.templateName || "",
      config: savedProject.data,
      createdAt: savedProject.createdAt,
      updatedAt: savedProject.updatedAt,
    },
  ],
}));

  } catch (error) {
    console.log("CREATE PROJECT ERROR:", error);
  }
},
  deleteProject: async (id) => {
  console.log("Delete clicked:", id);

  try {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    const response = await axios.delete(
      `http://127.0.0.1:5000/api/projects/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Delete response:", response.data);

    set((state) => ({
  projects: state.projects.filter((p: any) => (p.id || p._id) !== id),
}));

await get().loadProjects();

  } catch (error: any) {
    console.log("DELETE ERROR:", error.response?.data);
    console.log(error);
  }
},

  duplicateProject: (id) => {
    const allProjects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    const target = allProjects.find((p: any) => p.id === id);
    if (!target) return;

    const clone: WebsiteProject = {
      ...target,
      id: Math.random().toString(36).substring(2, 9),
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    allProjects.push(clone);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(allProjects));

    set(state => ({ projects: [...state.projects, clone] }));
  },

  updateProject: async (project) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      `https://brixo-2-0.onrender.com/api/projects/${project.id}`,
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
        p.id === project.id ? response.data.project : p
      )
    }));

  } catch (error) {
    console.log("UPDATE PROJECT ERROR:", error);
  }
},
}));
