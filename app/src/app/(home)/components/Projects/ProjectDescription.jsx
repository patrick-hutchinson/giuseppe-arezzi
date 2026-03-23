import Text from "@/components/Text/Text";
import { AnimatePresence, motion } from "framer-motion";

import styles from "./Projects.module.css";

const ProjectDescription = ({ project, showInfo, onHoverStart, onHoverEnd, isMobile = false }) => {
  if (!showInfo) return null;

  if (!isMobile) {
    return (
      <aside className={styles.projectInfo} onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
        {project.description ? <Text text={project.description} className={styles.projectDescription} /> : null}
        <br />
        {project.credits && project.credits.length > 0 && (
          <div>
            {project.credits.map((credit) => (
              <div key={credit._id} className={styles.filmCredit}>
                <div className={styles.creditTitle}>{credit.role}:</div>
                <div className={styles.creditor}>
                  {credit.people?.map((person, index) => (
                    <div key={index}>{person}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    );
  }

  return (
    <AnimatePresence>
      {showInfo ? (
        <motion.aside
          className={`${styles.projectInfo} ${styles.projectInfoMobile}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
        >
          {project.description ? <Text text={project.description} className={styles.projectDescription} /> : null}
          <br />
          {project.credits && project.credits.length > 0 && (
            <div>
              {project.credits.map((credit) => (
                <div key={credit._id} className={styles.filmCredit}>
                  <div className={styles.creditTitle}>{credit.role}:</div>
                  <div className={styles.creditor}>
                    {credit.people?.map((person, index) => (
                      <div key={index}>{person}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};

export default ProjectDescription;
