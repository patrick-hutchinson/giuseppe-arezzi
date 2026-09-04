import { useCallback, useContext, useEffect, useRef, useState } from "react";

import styles from "./Projects.module.css";

import Carousel from "@/components/Carousel/Carousel";
import ProjectHeader from "./ProjectHeader";
import ProjectDescription from "./ProjectDescription";
import { DeviceContext } from "@/context/DeviceContext";

const Project = ({
  project,
  projectId,
  projectIndex = 0,
  isActive = false,
  activePointerPosition = null,
  isLastProject = false,
}) => {
  const { isTouch, isMobile, isTablet } = useContext(DeviceContext);
  const [showInfo, setShowInfo] = useState(false);
  const [isInfoPanelHovered, setIsInfoPanelHovered] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const projectRef = useRef(null);
  const lastPointerRef = useRef(null);

  if (!project) return;

  useEffect(() => {
    const updateOrientation = () => {
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);

  const useMobileInfoMode = isMobile || (isTablet && isPortrait);

  const updateCursorFromViewport = useCallback((point) => {
    if (isTouch) return;
    if (!point || !projectRef.current) return;

    const bounds = projectRef.current.getBoundingClientRect();
    lastPointerRef.current = point;

    setCursorPosition((previousPosition) => {
      const nextPosition = {
        x: point.x - bounds.left,
        y: point.y - bounds.top,
      };

      if (previousPosition.x === nextPosition.x && previousPosition.y === nextPosition.y) {
        return previousPosition;
      }

      return nextPosition;
    });

    setContainerSize((previousSize) => {
      const nextSize = {
        width: bounds.width,
        height: bounds.height,
      };

      if (previousSize.width === nextSize.width && previousSize.height === nextSize.height) {
        return previousSize;
      }

      return nextSize;
    });
  }, [isTouch]);

  const handlePointerMove = (event) => {
    if (isTouch) return;
    if (event.pointerType && event.pointerType !== "mouse") return;
    updateCursorFromViewport({ x: event.clientX, y: event.clientY });
  };

  const handleInfo = () => {
    setShowInfo((prev) => !prev);
  };

  useEffect(() => {
    if (isTouch) return;

    if (!isActive) {
      lastPointerRef.current = null;
      return;
    }

    if (activePointerPosition) {
      updateCursorFromViewport(activePointerPosition);
    }
  }, [activePointerPosition, isActive, isTouch, updateCursorFromViewport]);

  useEffect(() => {
    if (isTouch || !isActive) return;

    let frameId = null;

    const updateCursorAfterScroll = () => {
      frameId = null;
      updateCursorFromViewport(lastPointerRef.current);
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateCursorAfterScroll);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [isActive, isTouch, updateCursorFromViewport]);

  return (
    <div
      ref={projectRef}
      data-project-id={projectId}
      className={`${styles.project}`}
      style={{ zIndex: projectIndex + 1 }}
      onPointerMove={isTouch ? undefined : handlePointerMove}
    >
      <ProjectHeader
        project={project}
        isHovering={isActive}
        cursorPosition={cursorPosition}
        handleInfo={handleInfo}
        showInfo={showInfo}
        hideTitle={isInfoPanelHovered}
        containerSize={containerSize}
        disableCursorFollow={Boolean(isTouch)}
        isMobile={Boolean(isMobile)}
        isLastProject={isLastProject}
      />

      <div className={styles.projectStage}>
        <ProjectDescription
          project={project}
          showInfo={showInfo}
          onClose={handleInfo}
          onHoverStart={() => setIsInfoPanelHovered(true)}
          onHoverEnd={() => setIsInfoPanelHovered(false)}
          isMobile={Boolean(useMobileInfoMode)}
        />

        <div className={styles.projectCarouselWrap}>
          <Carousel array={project.gallery} isInfinite={true} />
        </div>
      </div>
    </div>
  );
};

export default Project;
