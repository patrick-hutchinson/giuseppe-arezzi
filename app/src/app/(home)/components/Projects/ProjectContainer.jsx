import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { DeviceContext } from "@/context/DeviceContext";
import Project from "./Project";

import styles from "./Projects.module.css";

const ProjectContainer = ({ projects }) => {
  const { isTouch } = useContext(DeviceContext);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activePointerPosition, setActivePointerPosition] = useState(null);
  const activeProjectIdRef = useRef(null);
  const frameRef = useRef(null);
  const pointerRef = useRef(null);

  const setActiveProject = useCallback((projectId, pointerPosition = null) => {
    if (activeProjectIdRef.current === projectId) return;

    activeProjectIdRef.current = projectId;
    setActiveProjectId(projectId);
    setActivePointerPosition(projectId && pointerPosition ? { ...pointerPosition } : null);
  }, []);

  const updateActiveProject = useCallback(() => {
    frameRef.current = null;

    const pointerPosition = pointerRef.current;
    if (!pointerPosition) {
      setActiveProject(null);
      return;
    }

    const element = document.elementFromPoint(pointerPosition.x, pointerPosition.y);
    const projectNode = element?.closest?.("[data-project-id]");
    setActiveProject(projectNode?.dataset.projectId || null, pointerPosition);
  }, [setActiveProject]);

  const requestActiveProjectUpdate = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(updateActiveProject);
  }, [updateActiveProject]);

  useEffect(() => {
    if (isTouch) {
      setActiveProject(null);
      return;
    }

    const handlePointerMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      pointerRef.current = { x: event.clientX, y: event.clientY };
      requestActiveProjectUpdate();
    };

    const handlePointerLeave = () => {
      pointerRef.current = null;
      setActiveProject(null);
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", requestActiveProjectUpdate, { passive: true });
    window.addEventListener("resize", requestActiveProjectUpdate);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", requestActiveProjectUpdate);
      window.removeEventListener("resize", requestActiveProjectUpdate);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [isTouch, requestActiveProjectUpdate, setActiveProject]);

  if (!projects || projects.length == 0) return;

  return (
    <div className={styles.projectContainer}>
      {projects.map((project, index) => {
        const projectId = project._id || `project-${index}`;

        return (
          <Project
            key={projectId}
            project={project}
            projectId={projectId}
            projectIndex={index}
            isActive={activeProjectId === projectId}
            activePointerPosition={activePointerPosition}
            isLastProject={index === projects.length - 1}
          />
        );
      })}
    </div>
  );
};

export default ProjectContainer;
