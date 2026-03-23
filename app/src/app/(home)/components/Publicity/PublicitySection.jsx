import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Section from "@/components/Section/Section";
import Carousel from "@/components/Carousel/Carousel";
import Media from "@/components/Media/Media";
import Text from "@/components/Text/Text";
import { DeviceContext } from "@/context/DeviceContext";

import styles from "../../Home.module.css";

const getWrappedIndex = (index, length) => {
  if (!length) return 0;
  return ((index % length) + length) % length;
};

const PublicitySection = ({ home, site, awardsSectionRef, onGalleryOpenChange }) => {
  const { isMobile, isTouch } = useContext(DeviceContext);
  const lockedScrollYRef = useRef(0);
  const overlayInnerRef = useRef(null);
  const galleryOverlayFixedTitle = useRef(null);
  const [hoveredPrintImage, setHoveredPrintImage] = useState(null);
  const [activePrintIndex, setActivePrintIndex] = useState(null);
  const [overlayInnerTop, setOverlayInnerTop] = useState(0);

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
  const previousPrintIndex = hasActivePrint ? getWrappedIndex(normalizedActivePrintIndex - 1, galleryCount) : null;
  const nextPrintIndex = hasActivePrint ? getWrappedIndex(normalizedActivePrintIndex + 1, galleryCount) : null;

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
    onGalleryOpenChange?.(hasActivePrint);
  }, [hasActivePrint, onGalleryOpenChange]);

  useEffect(() => {
    if (!hasActivePrint) return;

    let frameId = null;

    const updateOverlayTop = () => {
      frameId = null;
      const top = overlayInnerRef.current?.getBoundingClientRect()?.top;
      if (typeof top !== "number") return;
      setOverlayInnerTop(top);
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateOverlayTop);
    };

    requestUpdate();
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("resize", requestUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [hasActivePrint]);

  return (
    <>
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
                <div>
                  For any enquiries, press, or internship requests, feel free to get in touch at{" "}
                  <strong>{site?.email}</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`${styles.publicityMetaColumn} ${styles.publicityColumn}`}>
          <div className={styles.publicityPrint}>
            <div typo="bold" style={{ marginBottom: "var(--margin-3)" }}>
              Selected Print
            </div>
            <ul>
              {home?.print?.map((printItem, index) => (
                <motion.li
                  key={printItem?.title || index}
                  typo={isTouch && Array.isArray(printItem?.gallery) && printItem.gallery.length > 0 ? "bold" : undefined}
                  onHoverStart={isMobile ? undefined : () => handlePrintHoverStart(printItem)}
                  onHoverEnd={isMobile ? undefined : handlePrintHoverEnd}
                  onClick={() => handlePrintClick(printItem)}
                  transition={{ duration: 0 }}
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
        </div>
      </Section>

      <AnimatePresence>
        {activeGallery?.length ? (
          <motion.div
            className={`${styles.galleryOverlay} ${styles.publicityCarousel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={isMobile ? undefined : closeGalleryOverlay}
          >
            <motion.div
              className={styles.galleryOverlayInner}
              ref={overlayInnerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              {!isMobile && activePrint?.title ? (
                <div
                  className={styles.galleryOverlayFixedTitle}
                  ref={galleryOverlayFixedTitle}
                  style={{ top: `${overlayInnerTop}px`, left: "var(--margin-page)" }}
                >
                  <strong>{activePrint.title}</strong>
                </div>
              ) : null}

              {isSingleMobilePortraitImage ? (
                <div className={styles.singleMobileGalleryImage}>
                  <Media medium={singleMobileImage?.medium} eager />
                </div>
              ) : isSingleMobileLandscapeImage ? (
                <div className={styles.singleMobileLandscapePan}>
                  <div
                    className={styles.singleMobileLandscapeFrame}
                    style={
                      singleMobileLandscapeAspect ? { width: `calc(90dvh * ${singleMobileLandscapeAspect})` } : undefined
                    }
                  >
                    <Media medium={singleMobileImage?.medium} eager contain />
                  </div>
                </div>
              ) : (
                <div>
                  <Carousel array={activeGallery} />
                </div>
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
    </>
  );
};

export default PublicitySection;
