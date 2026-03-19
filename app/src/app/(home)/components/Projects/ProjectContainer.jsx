import Project from "./Project";

import styles from "./Projects.module.css";

const ProjectContainer = ({ projects }) => {
  console.log(projects, "projects");
  if (!projects || projects.length == 0) return;

  return (
    <div className={styles.projectContainer}>
      {projects.map((project, index) => (
        <Project key={project._id} project={project} projectIndex={index} />
      ))}
    </div>
  );
};

export default ProjectContainer;
