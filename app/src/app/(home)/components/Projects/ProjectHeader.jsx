import { motion } from "framer-motion";

import styles from "./Projects.module.css";

const CURSOR_OFFSET = 12;

const ProjectHeader = ({ project, isHovering, cursorPosition }) => {
  const targetX = isHovering ? cursorPosition.x + CURSOR_OFFSET : 0;
  const targetY = isHovering ? cursorPosition.y + CURSOR_OFFSET : 0;

  return (
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
  );
};

export default ProjectHeader;
