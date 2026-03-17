"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const [activePrintIndex, setActivePrintIndex] = useState(null);
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);

  const printItemsWithGallery = useMemo(
    () => (home?.print || []).filter((printItem) => Array.isArray(printItem?.gallery) && printItem.gallery.length > 0),
    [home?.print],
  );

  const hasActivePrint = activePrintIndex !== null && activePrintIndex >= 0;
  const activePrint = hasActivePrint ? printItemsWithGallery[activePrintIndex] : null;
  const activeGallery = activePrint?.gallery || null;

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
    const nextActiveIndex = printItemsWithGallery.findIndex((item) => item === printItem);
    if (nextActiveIndex === -1) return;
    setActivePrintIndex(nextActiveIndex);
  };

  const closeGalleryOverlay = () => {
    setActivePrintIndex(null);
  };

  const openPreviousPrintGallery = () => {
    if (!printItemsWithGallery.length || activePrintIndex === null) return;
    const previousIndex = (activePrintIndex - 1 + printItemsWithGallery.length) % printItemsWithGallery.length;
    setActivePrintIndex(previousIndex);
  };

  const openNextPrintGallery = () => {
    if (!printItemsWithGallery.length || activePrintIndex === null) return;
    const nextIndex = (activePrintIndex + 1) % printItemsWithGallery.length;
    setActivePrintIndex(nextIndex);
  };

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
      <AnimatePresence>
        {showFloatingHeader ? (
          <motion.header
            className={styles.floatingHeader}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <a href={`mailto:${site?.email || ""}`} className={styles.floatingHeaderContact}>
              Contact
            </a>
          </motion.header>
        ) : null}
      </AnimatePresence>

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
              <Carousel array={activeGallery} />

              <div className={styles.galleryOverlayNavigation}>
                <button className={styles.galleryOverlayNavLeft} onClick={openPreviousPrintGallery}>
                  ←
                </button>

                <button className={styles.galleryOverlayClose} onClick={closeGalleryOverlay}>
                  x
                </button>

                <button className={styles.galleryOverlayNavRight} onClick={openNextPrintGallery}>
                  <span>{printItemsWithGallery[(activePrintIndex + 1) % printItemsWithGallery.length]?.title}</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
