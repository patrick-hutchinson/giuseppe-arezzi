import { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import styles from "./Projects.module.css";

import Text from "@/components/Text/Text";
import Carousel from "@/components/Carousel/Carousel";
import ProjectHeader from "./ProjectHeader";
import ProjectDescription from "./ProjectDescription";
import { DeviceContext } from "@/context/DeviceContext";

const Project = ({ project }) => {
  const { isTouch, isMobile, isTablet } = useContext(DeviceContext);
  const [showInfo, setShowInfo] = useState(false);
  const [isInfoPanelHovered, setIsInfoPanelHovered] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const [isHovering, setIsHovering] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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
  };

  const handleInfo = () => {
    setShowInfo((prev) => !prev);
  };

  return (
    <div
      className={styles.project}
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
      />

      <div className={styles.projectStage}>
        <ProjectDescription
          project={project}
          showInfo={showInfo}
          onHoverStart={() => setIsInfoPanelHovered(true)}
          onHoverEnd={() => setIsInfoPanelHovered(false)}
          isMobile={Boolean(useMobileInfoMode)}
        />

        <motion.div
          className={styles.projectCarouselWrap}
          animate={{ x: useMobileInfoMode ? "0vw" : showInfo ? "25vw" : "0vw" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Carousel array={project.gallery} />
        </motion.div>
      </div>
    </div>
  );
};

export default Project;
