import { useEffect, useState } from "react";
import Text from "@/components/Text/Text";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import styles from "./Projects.module.css";

const ProjectDescription = ({ project, showInfo, onClose, onHoverStart, onHoverEnd, isMobile = false }) => {
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    if (!isMobile) return;
    setPortalRoot(document.body);
  }, [isMobile]);

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

  const mobilePanel = (
    <AnimatePresence>
      {showInfo ? (
        <motion.aside
          className={`${styles.projectInfo} ${styles.projectInfoMobile} ${styles.projectInfoMobileOverlay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
        >
          <div typo="bold">
            <span>{project.title},</span> <br />
            <span>{project.edition},</span> <br />
            <span>{project.year}</span>
          </div>

          <button type="button" className={styles.projectInfoMobileClose} onClick={onClose} aria-label="Close info panel">
            <strong>-</strong>
          </button>

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

  if (!portalRoot) return null;
  return createPortal(mobilePanel, portalRoot);
};

export default ProjectDescription;
