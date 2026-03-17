import { AnimatePresence, motion } from "framer-motion";

import styles from "./Projects.module.css";

const CURSOR_OFFSET = 12;

const ProjectHeader = ({ project, isHovering, cursorPosition, handleInfo, showInfo }) => {
  const targetX = isHovering ? cursorPosition.x + CURSOR_OFFSET : 0;
  const targetY = isHovering ? cursorPosition.y + CURSOR_OFFSET : 0;

  return (
    <div className={styles.projectHeaderLayer}>
      <AnimatePresence>
        {isHovering && (
          <motion.button
            className={styles.toggleInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={handleInfo}
          >
            {showInfo ? "-" : "+"}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.projectHeader}
        initial={false}
        animate={{ x: targetX, y: targetY }}
        transition={{
          type: "spring",
          stiffness: isHovering ? 540 : 260,
          damping: isHovering ? 44 : 28,
          mass: isHovering ? 0.35 : 0.7,
        }}
      >
        {project.title}, Edition {project.edition}, {project.year}
      </motion.div>
    </div>
  );
};

export default ProjectHeader;
