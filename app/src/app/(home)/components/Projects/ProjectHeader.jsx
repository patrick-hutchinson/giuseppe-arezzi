import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
}) => {
  const isHoverActive = isHovering && !disableCursorFollow;
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  const [hasSnappedToCursor, setHasSnappedToCursor] = useState(false);
  const [headerSize, setHeaderSize] = useState({ width: 0, height: 0 });
  const [edgeMargin, setEdgeMargin] = useState(0);
  const headerRef = useRef(null);
  const snapTimerRef = useRef(null);
  const shouldHideTitle = disableCursorFollow ? false : hideTitle || isToggleHovered;

  useEffect(() => {
    const updateEdgeMargin = () => {
      const cssMargin = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--margin-page"));
      setEdgeMargin(Number.isFinite(cssMargin) ? cssMargin : 0);
    };

    updateEdgeMargin();
    window.addEventListener("resize", updateEdgeMargin);

    return () => {
      window.removeEventListener("resize", updateEdgeMargin);
    };
  }, []);

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
    const relativeRawX = rawX - edgeMargin;
    const relativeRawY = rawY - edgeMargin;
    const maxOffsetX = Math.max(0, (containerSize?.width || 0) - headerSize.width - 2 * edgeMargin);
    const maxOffsetY = Math.max(0, (containerSize?.height || 0) - headerSize.height - 2 * edgeMargin);

    targetX = clamp(relativeRawX, 0, maxOffsetX);
    targetY = clamp(relativeRawY, 0, maxOffsetY);
  }

  if (disableCursorFollow) {
    return (
      <div className={`${styles.projectHeaderLayer} ${isMobile ? styles.projectHeaderLayerMobileSticky : ""}`} typo="bold">
        <div className={`${styles.projectHeaderMobile} ${isMobile ? styles.projectHeaderMobileSticky : ""}`}>
          <div className={styles.projectHeaderMobileMeta}>
            <span>{project.title},</span>
            <span>{project.edition},</span>
            <span>{project.year}</span>
          </div>
          <button className={`${styles.toggleInfo} ${styles.toggleInfoMobile}`} onClick={handleInfo}>
            <span className={styles.toggleInfoGlyph}>{showInfo ? "-" : "+"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectHeaderLayer} typo="bold">
      {isHoverActive ? (
        <motion.button
          className={styles.toggleInfo}
          onClick={handleInfo}
          onMouseEnter={() => setIsToggleHovered(true)}
          onMouseLeave={() => setIsToggleHovered(false)}
        >
          <span className={styles.toggleInfoGlyph}>{showInfo ? "-" : "+"}</span>
        </motion.button>
      ) : null}

      <motion.div
        ref={headerRef}
        className={styles.projectHeader}
        initial={false}
        animate={{ opacity: shouldHideTitle ? 0 : 1, x: targetX, y: targetY }}
        transition={{
          opacity: { duration: 0.18, ease: "easeOut" },
          x: { duration: 0 },
          y: { duration: 0 },
        }}
      >
        {project.title}, {project.edition}, {project.year}
      </motion.div>
    </div>
  );
};

export default ProjectHeader;
