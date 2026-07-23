import { CleanBlockRenderer } from "./CleanBlockRenderer";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CartSidebar } from "./CartSidebar";
import { useCartStore } from "../../store/useCartStore";
import { ShoppingBag, EyeOff, Sparkles } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PreviewSite: React.FC = () => {
  const { siteId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [isUnpublished, setIsUnpublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const { toggleCart, getCartCount } = useCartStore();
  const cartCount = getCartCount();

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      setIsUnpublished(false);
      setIsError(false);

      try {
        // 1. Try fetching public site by slug
        let res;
        try {
          res = await axios.get(`${API_BASE_URL}/api/public/projects/public/slug/${siteId}`);
        } catch (slugErr: any) {
          if (slugErr.response && slugErr.response.status === 403) {
            setIsUnpublished(true);
            setIsLoading(false);
            return;
          }
          // Fallback: try by Mongo _id
          res = await axios.get(`${API_BASE_URL}/api/public/projects/public/${siteId}`);
        }

        if (res.data.site) {
          const site = res.data.site;
          if (site.status === "UNPUBLISHED") {
            setIsUnpublished(true);
          } else {
            setProject({
              title: site.title,
              data: site.data,
            });
          }
        } else if (res.data.project) {
          setProject(res.data.project);
        } else {
          setIsError(true);
        }
      } catch (error: any) {
        console.error("PREVIEW LOAD ERROR:", error);
        if (error.response && error.response.status === 403) {
          setIsUnpublished(true);
        } else {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (siteId) {
      loadProject();
    }
  }, [siteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading BRIXO Website...</p>
      </div>
    );
  }

  if (isUnpublished || isError || !project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-red-950/60 border border-red-900/60 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <EyeOff className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest block">404 - Offline</span>
            <h2 className="text-xl font-black text-slate-100 mt-1">Website Not Available</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This website is currently unpublished or has been taken offline by its owner.
            </p>
          </div>
          <a
            href="/dashboard"
            className="inline-block w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const currentPage = project.data.pages[activePageIdx];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: project.data.designTokens.backgroundColor,
      }}
    >
      {/* Page Navigation Bar */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          background: project.data.designTokens.backgroundColor + "dd",
          borderColor: project.data.designTokens.primaryColor + "15",
          color: project.data.designTokens.textColor,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span
              className="text-sm font-black uppercase tracking-tighter flex items-center gap-1.5"
              style={{ color: project.data.designTokens.primaryColor }}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              {project.title}
            </span>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              {project.data.pages.map((p: any, idx: number) => (
                <button
                  key={p.id}
                  onClick={() => setActivePageIdx(idx)}
                  className={`transition-all hover:opacity-100 ${
                    activePageIdx === idx ? "opacity-100 font-extrabold" : "opacity-40"
                  }`}
                  style={{ color: project.data.designTokens.textColor }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: project.data.designTokens.primaryColor }}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Render components */}
      <div className="flex flex-col">
        {(currentPage?.components || []).map((comp: any) => (
          <CleanBlockRenderer
            key={comp.id}
            comp={comp}
            tokens={project.data.designTokens}
            pages={project.data.pages}
            onNavigate={(id) => {
              const idx = project.data.pages.findIndex((p: any) => p.id === id);
              if (idx !== -1) setActivePageIdx(idx);
            }}
          />
        ))}
      </div>

      <CartSidebar />
    </div>
  );
};

export default PreviewSite;
