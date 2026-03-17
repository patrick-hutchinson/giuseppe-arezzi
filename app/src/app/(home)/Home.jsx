"use client";

import { useRef } from "react";

import styles from "./Home.module.css";

import Section from "@/components/Section/Section";

import IntroductionText from "./components/IntroductionText";
import ProjectContainer from "./components/Projects/ProjectContainer";

export default function HomePage({ site, home, projects }) {
  const projectsSectionRef = useRef(null);

  return (
    <main className={styles.main}>
      <Section className={styles.introductionSection}>
        <IntroductionText text={home?.introduction} projectsBoundaryRef={projectsSectionRef} />
      </Section>

      <Section ref={projectsSectionRef}>
        <ProjectContainer projects={projects} />
      </Section>

      <Section className={styles.publicitySection}>{/* <Text text={home.introduction} /> */}</Section>
    </main>
  );
}
