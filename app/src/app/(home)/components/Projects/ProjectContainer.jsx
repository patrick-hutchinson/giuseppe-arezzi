import Project from "./Project";

import styles from "./Projects.module.css";

const ProjectContainer = ({ projects }) => {
  if (!projects || projects.length == 0) return;

  return (
    <div className={styles.projectContainer}>
      {projects.map((project, index) => (
        <Project
          key={project._id}
          project={project}
          projectIndex={index}
          isLastProject={index === projects.length - 1}
        />
      ))}
    </div>
  );
};

export default ProjectContainer;
