import { useContext, useEffect, useRef, useState } from "react";

import styles from "./Projects.module.css";

import Carousel from "@/components/Carousel/Carousel";
import ProjectHeader from "./ProjectHeader";
import ProjectDescription from "./ProjectDescription";
import { DeviceContext } from "@/context/DeviceContext";

const Project = ({ project, projectIndex = 0 }) => {
  const { isTouch, isMobile, isTablet } = useContext(DeviceContext);
  const [showInfo, setShowInfo] = useState(false);
  const [isInfoPanelHovered, setIsInfoPanelHovered] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const [isHovering, setIsHovering] = useState(false);
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

  const handleMouseMove = (event) => {
    if (isTouch) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    setCursorPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    setContainerSize({
      width: bounds.width,
      height: bounds.height,
    });
  };

  const handleMouseEnter = (event) => {
    if (isTouch) return;
    setIsHovering(true);
    handleMouseMove(event);
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    setIsHovering(false);
    lastPointerRef.current = null;
  };

  const handleInfo = () => {
    setShowInfo((prev) => !prev);
  };

  useEffect(() => {
    if (isTouch || !isHovering) return;

    let frameId = null;

    const updateCursorFromViewport = () => {
      frameId = null;
      if (!projectRef.current || !lastPointerRef.current) return;

      const bounds = projectRef.current.getBoundingClientRect();
      const { x, y } = lastPointerRef.current;

      setCursorPosition({
        x: x - bounds.left,
        y: y - bounds.top,
      });

      setContainerSize({
        width: bounds.width,
        height: bounds.height,
      });
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateCursorFromViewport);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [isHovering, isTouch]);

  return (
    <div
      ref={projectRef}
      className={`${styles.project}`}
      style={{ zIndex: projectIndex + 1 }}
      onMouseMove={isTouch ? undefined : handleMouseMove}
      onMouseEnter={isTouch ? undefined : handleMouseEnter}
      onMouseLeave={isTouch ? undefined : handleMouseLeave}
    >
      <ProjectHeader
        project={project}
        isHovering={isHovering}
        cursorPosition={cursorPosition}
        handleInfo={handleInfo}
        showInfo={showInfo}
        hideTitle={isInfoPanelHovered}
        containerSize={containerSize}
        disableCursorFollow={Boolean(isTouch)}
        isMobile={Boolean(isMobile)}
      />

      <div className={styles.projectStage}>
        <ProjectDescription
          project={project}
          showInfo={showInfo}
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
