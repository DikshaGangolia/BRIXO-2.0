import { CleanBlockRenderer } from "./CleanBlockRenderer";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CartSidebar } from "./CartSidebar";
import { useCartStore } from "../../store/useCartStore";
import { ShoppingBag } from "lucide-react";

const API_BASE_URL = "https://brixo-2-0.onrender.com";

const PreviewSite: React.FC = () => {
  const { siteId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const { toggleCart, getCartCount } = useCartStore();
  const cartCount = getCartCount();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/public/projects/public/${siteId}`
        );

        console.log("PREVIEW PROJECT:", response.data);
        setProject(response.data.project);

      } catch (error) {
        console.log("PREVIEW ERROR:", error);
      }
    };

    if (siteId) {
      loadProject();
    }
  }, [siteId]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold">Loading Website...</p>
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
      {/* Page Navigation Bar (only show if multiple pages) */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-md" 
        style={{ 
          background: project.data.designTokens.backgroundColor + 'dd', 
          borderColor: project.data.designTokens.primaryColor + '15',
          color: project.data.designTokens.textColor
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-black uppercase tracking-tighter" style={{ color: project.data.designTokens.primaryColor }}>
              {project.title}
            </span>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              {project.data.pages.map((p: any, idx: number) => (
                <button
                  key={p.id}
                  onClick={() => setActivePageIdx(idx)}
                  className={`transition-all hover:opacity-100 ${
                    activePageIdx === idx ? 'opacity-100' : 'opacity-40'
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

      {/* Render all components on the current page */}
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
