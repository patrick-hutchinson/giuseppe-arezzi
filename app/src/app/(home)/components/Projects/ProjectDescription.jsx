import Text from "@/components/Text/Text";
import { AnimatePresence, motion } from "framer-motion";

import styles from "./Projects.module.css";

const ProjectDescription = ({ project, showInfo }) => {
  return (
    <AnimatePresence>
      {showInfo && (
        <motion.aside
          className={styles.projectInfo}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
      )}
    </AnimatePresence>
  );
};

export default ProjectDescription;
