"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./Home.module.css";
import IntroductionSection from "./components/Introduction/IntroductionSection";
import ProjectsSection from "./components/Projects/ProjectsSection";
import PublicitySection from "./components/Publicity/PublicitySection";

export default function HomePage({ site, home, projects }) {
  const projectsSectionRef = useRef(null);
  const awardsSectionRef = useRef(null);
  const [isPrintGalleryOpen, setIsPrintGalleryOpen] = useState(false);
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);

  const [isHoveringContact, setIsHoveringContact] = useState(false);

  useEffect(() => {
    let frameId = null;

    const updateHeaderVisibility = () => {
      frameId = null;
      const projectsBounds = projectsSectionRef.current?.getBoundingClientRect();
      if (!projectsBounds) return;

      const marginPage = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--margin-page"));
      const topThreshold = Number.isFinite(marginPage) ? marginPage : 0;

      setShowFloatingHeader(projectsBounds.top <= topThreshold);
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateHeaderVisibility);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <main className={styles.main}>
      {showFloatingHeader ? (
        <header className={styles.floatingHeader}>
          {isPrintGalleryOpen ? (
            <div className={styles.floatingHeaderLogotype} typo="bold">
              Giuseppe Arezzi
            </div>
          ) : null}
          <a
            href={`mailto:${site?.email || ""}`}
            className={styles.floatingHeaderContact}
            onMouseEnter={() => setIsHoveringContact(true)}
            onMouseLeave={() => setIsHoveringContact(false)}
            typo="bold"
          >
            {isHoveringContact ? site?.email : "Contact"}
          </a>
        </header>
      ) : null}

      <IntroductionSection
        text={home?.introduction}
        projectsBoundaryRef={projectsSectionRef}
        headerVisible={showFloatingHeader}
        awardsBoundaryRef={awardsSectionRef}
      />

      <ProjectsSection projects={projects} sectionRef={projectsSectionRef} />

      <PublicitySection
        home={home}
        site={site}
        awardsSectionRef={awardsSectionRef}
        onGalleryOpenChange={setIsPrintGalleryOpen}
      />
    </main>
  );
}
