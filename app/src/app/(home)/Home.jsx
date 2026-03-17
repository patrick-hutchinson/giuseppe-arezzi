"use client";

import { useRef } from "react";

import styles from "./Home.module.css";

import Section from "@/components/Section/Section";

import IntroductionText from "./components/IntroductionText";
import ProjectContainer from "./components/Projects/ProjectContainer";
import Text from "@/components/Text/Text";

export default function HomePage({ site, home, projects }) {
  const projectsSectionRef = useRef(null);

  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  return (
    <main className={styles.main}>
      <Section className={styles.introductionSection}>
        <IntroductionText text={home?.introduction} projectsBoundaryRef={projectsSectionRef} />
      </Section>

      <Section ref={projectsSectionRef}>
        <ProjectContainer projects={projects} />
      </Section>

      <Section className={styles.publicitySection}>
        <div className={`${styles.publicityGroup} ${styles.publicityColumn}`}>
          <div>
            <strong>Awards</strong>
            <Text text={home.awards} />
          </div>
          <div>
            <strong>Acquisitions</strong>
            <Text text={home.acquisitions} />
          </div>
          <div>
            <strong>Selected Clients</strong>
            <Text text={home.clients} />
          </div>
          <div>
            <strong>Past Collaborators</strong>
            <Text text={home.collaborators} />
          </div>
        </div>

        <div className={`${styles.publicityPrint} ${styles.publicityColumn}`}>
          <strong>Selected Print</strong>
          <ul>
            {home.print?.map((printItem, index) => (
              <li
                key={printItem?.title || index}
                onMouseEnter={() => handleMouseEnter()}
                onMouseLeave={() => handleMouseLeave()}
              >
                {printItem.title}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.publicityWeb} ${styles.publicityColumn}`}>
          <strong>Selected Web</strong>
          <Text text={home.web} />
        </div>
      </Section>
    </main>
  );
}
