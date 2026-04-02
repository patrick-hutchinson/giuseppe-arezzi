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
                <div className={styles.publicityGroupMain}>
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
                  {home.currentCollaborators && (
                    <div>
                      <div typo="bold">Current Collaborators</div>
                      <Text text={home.currentCollaborators} />
                    </div>
                  )}
                  <div>
                    <div typo="bold">Past Collaborators</div>
                    <Text text={home.collaborators} />
                  </div>
                </div>
                {!isMobile ? (
                  <div className={styles.publicityGroupFooterContact} style={{ gap: "0px" }}>
                    For any enquiries, press, or internship requests, feel free to get in touch at{" "}
                    <a href={`mailto:${site?.email || ""}`} className={styles.publicityContactEmail}>
                      {site?.email}
                    </a>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`${styles.publicityMetaColumn} ${styles.publicityColumn}`}>
          <div className={styles.publicityMetaContent}>
            <div>
              <div className={styles.publicityPrint}>
                <div typo="bold" className={styles.publicityChipLabel} style={{ marginBottom: "var(--margin-3)" }}>
                  Press
                </div>
                <ul>
                  {home?.print?.map((printItem, index) => (
                    <motion.li
                      key={printItem?.title || index}
                      className={styles.publicityChipItem}
                      typo={
                        isTouch && Array.isArray(printItem?.gallery) && printItem.gallery.length > 0 ? "bold" : undefined
                      }
                      onHoverStart={isMobile ? undefined : () => handlePrintHoverStart(printItem)}
                      onHoverEnd={isMobile ? undefined : handlePrintHoverEnd}
                      onClick={() => handlePrintClick(printItem)}
                      transition={{ duration: 0 }}
                      whileHover={{
                        cursor: printItem.gallery ? "pointer" : "default",
                        backgroundColor: printItem.gallery ? "#000" : "#fff",
                        color: printItem.gallery ? "#fff" : "#000",
                      }}
                    >
                      {printItem.title}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className={styles.publicityWeb}>
                <div typo="bold" className={styles.publicityChipLabel} style={{ marginBottom: "var(--margin-3)" }}>
                  More On:
                </div>
                <Text text={home?.web} />
              </div>

              {isMobile ? (
                <div className={styles.publicityMobileContactGrid}>
                  <div className={styles.publicityMobileContactMain}>
                    For any enquiries, press, or internship requests, feel free to get in touch at{" "}
                    <a href={`mailto:${site?.email || ""}`} className={styles.publicityContactEmail}>
                      {site?.email}
                    </a>
                  </div>
                  <div className={styles.publicityMobileContactSocials}>
                    {Array.isArray(site?.socials) && site.socials.length > 0
                      ? site.socials.map((social, index) => (
                          <a
                            key={`${social?.platform || "social-mobile"}-${index}`}
                            href={social?.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.publicityContactEmail}
                          >
                            {social?.platform || social?.link}
                          </a>
                        ))
                      : null}
                  </div>
                </div>
              ) : null}
            </div>

            {!isMobile && Array.isArray(site?.socials) && site.socials.length > 0 ? (
              <div className={styles.publicityMetaFooterSocials}>
                {site.socials.map((social, index) => (
                  <span key={`${social?.platform || "social"}-${index}`}>
                    <a
                      href={social?.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.publicityContactEmail}
                    >
                      {social?.platform || social?.link}
                    </a>
                    {index < site.socials.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            ) : null}
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
              {activePrint?.title ? (
                <div
                  className={styles.galleryOverlayFixedTitle}
                  ref={galleryOverlayFixedTitle}
                  style={{ top: `${overlayInnerTop}px`, left: "var(--margin-page)" }}
                >
                  <span typo="bold">{activePrint.title}</span>
                  {isMobile && (activePrint?.edition || activePrint?.year) ? (
                    <>
                      {activePrint?.edition ? <div>{activePrint.edition}</div> : null}
                      {activePrint?.year ? <div>{activePrint.year}</div> : null}
                    </>
                  ) : null}
                </div>
              ) : null}

              <div>
                <Carousel
                  key={activePrint?._id || normalizedActivePrintIndex}
                  array={activeGallery}
                  autoScroll={false}
                  containScroll="trimSnaps"
                  leadingGap={isMobile ? "50vw" : "25vw"}
                  trailingGap="var(--margin-page)"
                />
              </div>

              <div className={styles.galleryOverlayNavigation}>
                <button type="button" className={styles.galleryOverlayNavLeft} onClick={openPreviousPrintGallery}>
                  <span className={styles.galleryOverlayNavContent}>
                    <span style={{ position: "relative", top: "-1.5px", fontSize: "22px" }}>←</span>
                    {!isMobile ? <span>{printItemsWithGallery[previousPrintIndex]?.title}</span> : null}
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.galleryOverlayClose}
                  onClick={closeGalleryOverlay}
                  style={{ fontSize: "22px" }}
                >
                  <span className={styles.galleryOverlayCloseGlyph}>×</span>
                </button>

                <button type="button" className={styles.galleryOverlayNavRight} onClick={openNextPrintGallery}>
                  <span className={styles.galleryOverlayNavContent}>
                    {!isMobile ? <span>{printItemsWithGallery[nextPrintIndex]?.title}</span> : null}
                    <span style={{ position: "relative", top: "-1.5px", fontSize: "22px" }}>→</span>
                  </span>
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
