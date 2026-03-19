"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";

import styles from "./Home.module.css";

import { AnimatePresence, motion } from "framer-motion";

import Section from "@/components/Section/Section";

import IntroductionText from "./components/IntroductionText";
import ProjectContainer from "./components/Projects/ProjectContainer";
import Text from "@/components/Text/Text";
import { PortableText } from "@portabletext/react";
import Media from "@/components/Media/Media";
import Carousel from "@/components/Carousel/Carousel";
import { DeviceContext } from "@/context/DeviceContext";

const getWrappedIndex = (index, length) => {
  if (!length) return 0;
  return ((index % length) + length) % length;
};

export default function HomePage({ site, home, projects }) {
  const { isMobile, isTouch } = useContext(DeviceContext);
  const projectsSectionRef = useRef(null);
  const awardsSectionRef = useRef(null);
  const lockedScrollYRef = useRef(0);
  const [hoveredPrintImage, setHoveredPrintImage] = useState(null);
  const [activePrintIndex, setActivePrintIndex] = useState(null);
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);

  const [isHoveringContact, setIsHoveringContact] = useState(false);

  const printItemsWithGallery = useMemo(
    () => (home?.print || []).filter((printItem) => Array.isArray(printItem?.gallery) && printItem.gallery.length > 0),
    [home?.print],
  );

  const galleryCount = printItemsWithGallery.length;
  const normalizedActivePrintIndex =
    activePrintIndex === null || galleryCount === 0 ? null : getWrappedIndex(activePrintIndex, galleryCount);

  const hasActivePrint = normalizedActivePrintIndex !== null;
  const activePrint = hasActivePrint ? printItemsWithGallery[normalizedActivePrintIndex] : null;
  const activeGallery = activePrint?.gallery || null;
  const singleMobileImage = Array.isArray(activeGallery) && activeGallery.length === 1 ? activeGallery[0] : null;
  const isSingleMobilePortraitImage =
    Boolean(isMobile) &&
    singleMobileImage?.medium?.type === "image" &&
    typeof singleMobileImage?.medium?.width === "number" &&
    typeof singleMobileImage?.medium?.height === "number" &&
    singleMobileImage.medium.height > singleMobileImage.medium.width;
  const isSingleMobileLandscapeImage =
    Boolean(isMobile) &&
    singleMobileImage?.medium?.type === "image" &&
    typeof singleMobileImage?.medium?.width === "number" &&
    typeof singleMobileImage?.medium?.height === "number" &&
    singleMobileImage.medium.width >= singleMobileImage.medium.height;
  const singleMobileLandscapeAspect =
    isSingleMobileLandscapeImage && singleMobileImage?.medium?.height
      ? singleMobileImage.medium.width / singleMobileImage.medium.height
      : null;
  const previousPrintIndex = hasActivePrint ? getWrappedIndex(normalizedActivePrintIndex - 1, galleryCount) : null;
  const nextPrintIndex = hasActivePrint ? getWrappedIndex(normalizedActivePrintIndex + 1, galleryCount) : null;

  const handlePrintHoverStart = (printItem) => {
    if (isMobile) return;
    const firstGalleryItem = printItem?.gallery?.[0];
    if (!firstGalleryItem?.medium) return;
    setHoveredPrintImage(firstGalleryItem.medium);
  };

  const handlePrintHoverEnd = () => {
    if (isMobile) return;
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
    setActivePrintIndex((currentIndex) => {
      if (currentIndex === null || galleryCount === 0) return currentIndex;
      return getWrappedIndex(currentIndex - 1, galleryCount);
    });
  };

  const openNextPrintGallery = () => {
    setActivePrintIndex((currentIndex) => {
      if (currentIndex === null || galleryCount === 0) return currentIndex;
      return getWrappedIndex(currentIndex + 1, galleryCount);
    });
  };

  useEffect(() => {
    if (activePrintIndex === null || galleryCount === 0) return;
    const wrappedIndex = getWrappedIndex(activePrintIndex, galleryCount);
    if (wrappedIndex !== activePrintIndex) {
      setActivePrintIndex(wrappedIndex);
    }
  }, [activePrintIndex, galleryCount]);

  useEffect(() => {
    if (!isMobile) return;
    setHoveredPrintImage(null);
  }, [isMobile]);

  useEffect(() => {
    if (activePrintIndex === null) return;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setActivePrintIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePrintIndex]);

  useEffect(() => {
    if (!hasActivePrint) return;

    const html = document.documentElement;
    const body = document.body;
    const lenis = window?.lenis || window?.__lenis;

    lockedScrollYRef.current = window.scrollY || window.pageYOffset || 0;

    lenis?.stop?.();

    html.classList.add("gallery-scroll-lock");
    body.classList.add("gallery-scroll-lock");
    body.style.top = `-${lockedScrollYRef.current}px`;

    return () => {
      lenis?.start?.();

      html.classList.remove("gallery-scroll-lock");
      body.classList.remove("gallery-scroll-lock");
      body.style.top = "";
      window.scrollTo(0, lockedScrollYRef.current);
    };
  }, [hasActivePrint]);

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
            <AnimatePresence>
              {!hasActivePrint ? (
                <motion.a
                  key="floating-contact"
                  href={`mailto:${site?.email || ""}`}
                  className={styles.floatingHeaderContact}
                  onMouseEnter={() => setIsHoveringContact(true)}
                  onMouseLeave={() => setIsHoveringContact(false)}
                  typo="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {isHoveringContact ? site?.email : "Contact"}
                </motion.a>
              ) : null}
            </AnimatePresence>
          </motion.header>
        ) : null}
      </AnimatePresence>

      <Section className={styles.introductionSection}>
        <IntroductionText
          text={home?.introduction}
          projectsBoundaryRef={projectsSectionRef}
          headerVisible={showFloatingHeader}
          awardsBoundaryRef={awardsSectionRef}
        />
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
                <div ref={awardsSectionRef}>
                  <div typo="bold">Awards</div>
                  <Text text={home.awards} />
                </div>
                <div>
                  <div typo="bold">Acquisitions</div>
                  <Text text={home.acquisitions} />
                </div>
                <div>
                  <div typo="bold">Selected Clients</div>
                  <Text text={home.clients} />
                </div>
                <div>
                  <div typo="bold">Past Collaborators</div>
                  <Text text={home.collaborators} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`${styles.publicityMetaColumn} ${styles.publicityColumn}`}>
          <div className={styles.publicityPrint}>
            <div typo="bold">Selected Print</div>
            <ul>
              {home.print?.map((printItem, index) => (
                <motion.li
                  key={printItem?.title || index}
                  typo={
                    isTouch && Array.isArray(printItem?.gallery) && printItem.gallery.length > 0
                      ? "bold"
                      : undefined
                  }
                  onHoverStart={isMobile ? undefined : () => handlePrintHoverStart(printItem)}
                  onHoverEnd={isMobile ? undefined : handlePrintHoverEnd}
                  onClick={() => handlePrintClick(printItem)}
                  whileHover={{
                    textIndent: isTouch ? "0px" : printItem.gallery ? "20px" : "0px",
                    fontWeight: printItem.gallery ? 700 : 400,
                    cursor: printItem.gallery ? "pointer" : "default",
                  }}
                >
                  {printItem.title}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className={styles.publicityWeb}>
            <div typo="bold">Selected Web</div>

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
            onClick={isMobile ? undefined : closeGalleryOverlay}
          >
            <motion.div
              className={styles.galleryOverlayInner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              {isSingleMobilePortraitImage ? (
                <div className={styles.singleMobileGalleryImage}>
                  <Media medium={singleMobileImage?.medium} eager />
                </div>
              ) : isSingleMobileLandscapeImage ? (
                <div className={styles.singleMobileLandscapePan}>
                  <div
                    className={styles.singleMobileLandscapeFrame}
                    style={
                      singleMobileLandscapeAspect
                        ? { width: `calc(90dvh * ${singleMobileLandscapeAspect})` }
                        : undefined
                    }
                  >
                    <Media medium={singleMobileImage?.medium} eager contain />
                  </div>
                </div>
              ) : (
                <Carousel array={activeGallery} />
              )}

              <div className={styles.galleryOverlayNavigation}>
                <button type="button" className={styles.galleryOverlayNavLeft} onClick={openPreviousPrintGallery}>
                  <span typo="bold">←</span>
                  {!isMobile ? <span>{printItemsWithGallery[previousPrintIndex]?.title}</span> : null}
                </button>

                <button type="button" className={styles.galleryOverlayClose} onClick={closeGalleryOverlay} typo="bold">
                  x
                </button>

                <button type="button" className={styles.galleryOverlayNavRight} onClick={openNextPrintGallery}>
                  {!isMobile ? <span>{printItemsWithGallery[nextPrintIndex]?.title}</span> : null}
                  <span typo="bold">→</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
