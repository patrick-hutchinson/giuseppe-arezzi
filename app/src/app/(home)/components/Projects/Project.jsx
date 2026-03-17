import { useState } from "react";

import styles from "./Projects.module.css";

import Carousel from "@/components/Carousel/Carousel";
import ProjectHeader from "./ProjectHeader";

const Project = ({ project }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  if (!project) return;

  const handleMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  const handleMouseEnter = (event) => {
    setIsHovering(true);
    handleMouseMove(event);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      className={styles.project}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ProjectHeader project={project} isHovering={isHovering} cursorPosition={cursorPosition} />
      <Carousel array={project.gallery} />
    </div>
  );
};

export default Project;
