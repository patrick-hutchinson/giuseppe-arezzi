"use client";

import { useRef, useState } from "react";

import styles from "./Home.module.css";

import { AnimatePresence, motion } from "framer-motion";

import Section from "@/components/Section/Section";

import IntroductionText from "./components/IntroductionText";
import ProjectContainer from "./components/Projects/ProjectContainer";
import Text from "@/components/Text/Text";
import { PortableText } from "@portabletext/react";
import Media from "@/components/Media/Media";
import Carousel from "@/components/Carousel/Carousel";

export default function HomePage({ site, home, projects }) {
  const projectsSectionRef = useRef(null);
  const [hoveredPrintImage, setHoveredPrintImage] = useState(null);
  const [activeGallery, setActiveGallery] = useState(null);

  const handlePrintHoverStart = (printItem) => {
    const firstGalleryItem = printItem?.gallery?.[0];
    if (!firstGalleryItem?.medium) return;
    setHoveredPrintImage(firstGalleryItem.medium);
  };

  const handlePrintHoverEnd = () => {
    setHoveredPrintImage(null);
  };

  const handlePrintClick = (printItem) => {
    if (!printItem?.gallery?.length) return;
    setActiveGallery(printItem.gallery);
  };

  const closeGalleryOverlay = () => {
    setActiveGallery(null);
  };

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
          <AnimatePresence mode="wait">
            {hoveredPrintImage ? (
              <motion.div
                key="gallery-preview"
                className={styles.publicityPreview}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <Media medium={hoveredPrintImage} eager contain />
              </motion.div>
            ) : (
              <motion.div
                key="publicity-content"
                className={styles.publicityGroupContent}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`${styles.publicityPrint} ${styles.publicityColumn}`}>
          <strong>Selected Print</strong>
          <ul>
            {home.print?.map((printItem, index) => (
              <motion.li
                key={printItem?.title || index}
                onHoverStart={() => handlePrintHoverStart(printItem)}
                onHoverEnd={handlePrintHoverEnd}
                onClick={() => handlePrintClick(printItem)}
                whileHover={{
                  textIndent: printItem.gallery ? "20px" : "0px",
                  fontWeight: printItem.gallery ? 700 : 400,
                  cursor: printItem.gallery ? "pointer" : "default",
                }}
              >
                {printItem.title}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className={`${styles.publicityWeb} ${styles.publicityColumn}`}>
          <strong>Selected Web</strong>

          <PortableText
            value={home.web}
            components={{
              block: {
                normal: ({ children }) => <div>{children}</div>,
              },
              marks: {
                link: ({ value, children }) => {
                  const href = value?.href || value?.link;

                  return (
                    <motion.a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ x: 20, fontWeight: 700 }}
                      style={{ display: "inline-block", cursor: "pointer" }}
                    >
                      {children}
                    </motion.a>
                  );
                },
              },
            }}
          />
        </div>
      </Section>

      <AnimatePresence>
        {activeGallery?.length ? (
          <motion.div
            className={styles.galleryOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={closeGalleryOverlay}
          >
            <motion.div
              className={styles.galleryOverlayInner}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <button className={styles.galleryOverlayClose} onClick={closeGalleryOverlay}>
                Close
              </button>
              <Carousel array={activeGallery} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
