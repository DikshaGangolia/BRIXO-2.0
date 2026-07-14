import { CleanBlockRenderer } from "./CleanBlockRenderer";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PreviewSite: React.FC = () => {
  const { siteId } = useParams();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
  `https://brixo-2-0.onrender.com/api/projects/public/${siteId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("PREVIEW PROJECT:", response.data);
        console.log("PROJECT PAGES:", response.data.project?.data?.pages);
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
        Loading Website...
      </div>
    );
  }


  return (
  <div
    className="min-h-screen"
    style={{
      backgroundColor: project.data.designTokens.backgroundColor,
    }}
  >
    {project.data.pages.map((page: any) => (
  <div key={page.id}>
    {page.components.map((comp: any) => (
      <CleanBlockRenderer
        key={comp.id}
        comp={comp}
        tokens={project.data.designTokens}
        pages={project.data.pages}
        onNavigate={() => {}}
      />
    ))}
  </div>
))}
  </div>
);
};

export default PreviewSite;