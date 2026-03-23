import Section from "@/components/Section/Section";

import ProjectContainer from "./ProjectContainer";

const ProjectsSection = ({ projects, sectionRef }) => {
  return (
    <Section ref={sectionRef}>
      <ProjectContainer projects={projects} />
    </Section>
  );
};

export default ProjectsSection;
