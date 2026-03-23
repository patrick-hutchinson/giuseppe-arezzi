import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import styles from "./Projects.module.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ProjectHeader = ({
  project,
  isHovering,
  cursorPosition,
  handleInfo,
  showInfo,
  hideTitle,
  containerSize,
  disableCursorFollow = false,
  isMobile = false,
  isLastProject = false,
}) => {
  const isHoverActive = isHovering && !disableCursorFollow;
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  const [hasSnappedToCursor, setHasSnappedToCursor] = useState(false);
  const [headerSize, setHeaderSize] = useState({ width: 0, height: 0 });
  const headerRef = useRef(null);
  const snapTimerRef = useRef(null);
  const shouldHideTitle = disableCursorFollow ? false : hideTitle || isToggleHovered;

  useEffect(() => {
    if (!headerRef.current || typeof ResizeObserver === "undefined") return;

    const updateSize = () => {
      const rect = headerRef.current.getBoundingClientRect();
      setHeaderSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(headerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHoverActive) {
      setHasSnappedToCursor(false);
      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }
      return;
    }

    if (snapTimerRef.current) {
      window.clearTimeout(snapTimerRef.current);
    }

    snapTimerRef.current = window.setTimeout(() => {
      setHasSnappedToCursor(true);
      snapTimerRef.current = null;
    }, 180);

    return () => {
      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }
    };
  }, [isHoverActive]);

  let targetX = 0;
  let targetY = 0;

  if (isHoverActive) {
    const rawX = cursorPosition.x - headerSize.width / 2;
    const rawY = cursorPosition.y - headerSize.height / 2;
    const maxX = Math.max(0, (containerSize?.width || 0) - headerSize.width);
    const maxY = Math.max(0, (containerSize?.height || 0) - headerSize.height);

    targetX = clamp(rawX, 0, maxX);
    targetY = clamp(rawY, 0, maxY);
  }

  if (disableCursorFollow) {
    return (
      <div
        className={`${styles.projectHeaderLayer} ${
          isMobile ? styles.projectHeaderLayerMobileSticky : ""
        } ${isMobile && isLastProject ? styles.projectHeaderLayerMobileStickyLast : ""}`}
        typo="bold"
      >
        <div
          className={`${styles.projectHeaderMobile} ${
            isMobile ? styles.projectHeaderMobileSticky : ""
          } ${isMobile && isLastProject ? styles.projectHeaderMobileStickyLast : ""}`}
        >
          <div className={styles.projectHeaderMobileMeta}>
            <span>{project.title},</span>
            <span>{project.edition},</span>
            <span>{project.year}</span>
          </div>
          <button
            className={`${styles.toggleInfo} ${styles.toggleInfoMobile}`}
            onClick={handleInfo}
          >
            {showInfo ? "-" : "+"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectHeaderLayer} typo="bold">
      <AnimatePresence>
        {isHoverActive && (
          <motion.button
            className={styles.toggleInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={handleInfo}
            onMouseEnter={() => setIsToggleHovered(true)}
            onMouseLeave={() => setIsToggleHovered(false)}
          >
            {showInfo ? "-" : "+"}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        ref={headerRef}
        className={styles.projectHeader}
        initial={false}
        animate={{ opacity: shouldHideTitle ? 0 : 1, x: targetX, y: targetY }}
        transition={{
          opacity: { duration: 0.18, ease: "easeOut" },
          x: isHoverActive && hasSnappedToCursor
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 540,
                damping: 44,
                mass: 0.35,
              },
          y: isHoverActive && hasSnappedToCursor
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 540,
                damping: 44,
                mass: 0.35,
              },
        }}
      >
        {project.title}, Edition {project.edition}, {project.year}
      </motion.div>
    </div>
  );
};

export default ProjectHeader;
