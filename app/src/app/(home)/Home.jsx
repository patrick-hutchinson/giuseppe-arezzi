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
  const [isLayoutReady, setIsLayoutReady] = useState(false);

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

  const handleInfoClick = () => {
    const targetNode = awardsSectionRef.current;
    if (!targetNode) return;
    const targetTop = Math.max(
      0,
      (window.scrollY || window.pageYOffset || 0) + targetNode.getBoundingClientRect().top - 16,
    );

    const lenis = window?.lenis || window?.__lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(targetTop, {
        duration: 1,
        easing: (value) => 1 - (1 - value) ** 3,
      });
      return;
    }

    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  return (
    <main className={`${styles.main} ${isLayoutReady ? styles.mainReady : styles.mainPending}`}>
      {showFloatingHeader ? (
        <header className={styles.floatingHeader}>
          {isPrintGalleryOpen ? (
            <div className={styles.floatingHeaderLogotype} typo="bold">
              Giuseppe Arezzi
            </div>
          ) : null}
          <button type="button" className={styles.floatingHeaderContact} onClick={handleInfoClick} typo="bold">
            Info
          </button>
        </header>
      ) : null}

      <IntroductionSection
        text={home?.introduction}
        projectsBoundaryRef={projectsSectionRef}
        headerVisible={showFloatingHeader}
        awardsBoundaryRef={awardsSectionRef}
        onReady={() => setIsLayoutReady(true)}
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
