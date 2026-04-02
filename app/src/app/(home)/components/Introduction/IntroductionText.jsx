import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import Text from "@/components/Text/Text";

import styles from "../../Home.module.css";

const INTRO_PROJECT_GAP = 0;
const INTRO_FIXED_WORDS = 2;

const countPortableTextCharacters = (blocks = []) => {
  return blocks.reduce((count, block) => {
    if (block?._type !== "block" || !Array.isArray(block.children)) return count;

    return count + block.children.reduce((childCount, child) => childCount + (child?.text?.length || 0), 0);
  }, 0);
};

const getPortableTextContent = (blocks = []) => {
  return blocks.reduce((result, block) => {
    if (block?._type !== "block" || !Array.isArray(block.children)) return result;
    return result + block.children.reduce((childText, child) => childText + (child?.text || ""), "");
  }, "");
};

const getFixedPrefixCharacters = (blocks = [], wordsToKeep = 0) => {
  if (wordsToKeep <= 0) return 0;
  const content = getPortableTextContent(blocks);
  if (!content) return 0;

  const words = [...content.matchAll(/\S+/g)];
  if (!words.length) return 0;
  if (words.length <= wordsToKeep) return content.length;

  const targetWord = words[wordsToKeep - 1];
  return targetWord.index + targetWord[0].length;
};

const stripPortableTextPrefix = (blocks = [], prefixCharacters = 0) => {
  if (prefixCharacters <= 0) return blocks;

  let remaining = prefixCharacters;
  const nextBlocks = [];

  for (const block of blocks) {
    if (block?._type !== "block" || !Array.isArray(block.children)) continue;

    const nextChildren = [];

    for (const child of block.children) {
      const childText = child?.text || "";
      if (!childText.length) {
        if (remaining <= 0) nextChildren.push(child);
        continue;
      }

      if (remaining <= 0) {
        nextChildren.push(child);
        continue;
      }

      if (remaining >= childText.length) {
        remaining -= childText.length;
        continue;
      }

      nextChildren.push({
        ...child,
        text: childText.slice(remaining),
      });
      remaining = 0;
    }

    if (!nextChildren.length) continue;
    nextBlocks.push({
      ...block,
      children: nextChildren,
    });
  }

  return nextBlocks;
};

const truncatePortableText = (blocks = [], maxCharacters = 0) => {
  if (maxCharacters <= 0) return [];

  let remaining = maxCharacters;
  const nextBlocks = [];

  for (const block of blocks) {
    if (remaining <= 0) break;
    if (block?._type !== "block" || !Array.isArray(block.children)) continue;

    const nextChildren = [];

    for (const child of block.children) {
      if (remaining <= 0) break;

      const childText = child?.text || "";
      if (!childText.length) {
        nextChildren.push(child);
        continue;
      }

      const slice = childText.slice(0, remaining);
      if (!slice.length) continue;

      nextChildren.push({
        ...child,
        text: slice,
      });

      remaining -= slice.length;
    }

    if (!nextChildren.length) continue;

    nextBlocks.push({
      ...block,
      children: nextChildren,
    });
  }

  return nextBlocks;
};

const IntroductionText = ({ text, projectsBoundaryRef, headerVisible = false, awardsBoundaryRef, onReady }) => {
  const introduction = text || [];
  const totalIntroCharacters = useMemo(() => countPortableTextCharacters(introduction), [introduction]);
  const fixedPrefixCharacters = useMemo(() => getFixedPrefixCharacters(introduction, INTRO_FIXED_WORDS), [introduction]);
  const fixedPrefixText = useMemo(
    () => getPortableTextContent(introduction).slice(0, fixedPrefixCharacters),
    [fixedPrefixCharacters, introduction],
  );
  const introMeasurementRef = useRef(null);
  const hasReportedReadyRef = useRef(false);
  const [visibleCharacters, setVisibleCharacters] = useState(totalIntroCharacters);
  const [fadeIntroductionOut, setFadeIntroductionOut] = useState(false);

  useEffect(() => {
    setVisibleCharacters(totalIntroCharacters);
  }, [totalIntroCharacters]);

  useEffect(() => {
    let frameId = null;

    const updateVisibleCharacters = () => {
      frameId = null;

      const measurementRect = introMeasurementRef.current?.getBoundingClientRect?.();
      const measurementHeight = measurementRect?.height || 0;
      const introTop = measurementRect?.top || 0;
      const projectsTop = projectsBoundaryRef?.current?.getBoundingClientRect()?.top ?? 0;
      const marginPage = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--margin-page"));
      const deletionBuffer = Number.isFinite(marginPage) ? marginPage : 0;

      if (!totalIntroCharacters || !measurementHeight) {
        setVisibleCharacters(totalIntroCharacters);
        return;
      }

      // Strictly map visible text to the live vertical space between intro top and projects top.
      // This guarantees deletion keeps pace and prevents overlap with incoming media.
      const availableHeight = Math.max(0, projectsTop - introTop - INTRO_PROJECT_GAP - deletionBuffer);
      const clampedRatio = Math.max(0, Math.min(1, availableHeight / measurementHeight));
      const minVisibleCharacters = headerVisible ? fixedPrefixCharacters : 0;
      const nextVisibleCharacters = Math.max(minVisibleCharacters, Math.floor(totalIntroCharacters * clampedRatio));

      setVisibleCharacters((currentVisibleCharacters) => {
        if (currentVisibleCharacters === nextVisibleCharacters) return currentVisibleCharacters;
        return nextVisibleCharacters;
      });

      if (!hasReportedReadyRef.current) {
        hasReportedReadyRef.current = true;
        onReady?.();
      }
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateVisibleCharacters);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(requestUpdate);
      if (introMeasurementRef.current) resizeObserver.observe(introMeasurementRef.current);
      if (projectsBoundaryRef?.current) resizeObserver.observe(projectsBoundaryRef.current);
    }

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [fixedPrefixCharacters, headerVisible, onReady, projectsBoundaryRef, totalIntroCharacters]);

  useEffect(() => {
    let frameId = null;

    const updateFadeState = () => {
      frameId = null;
      const awardsTop = awardsBoundaryRef?.current?.getBoundingClientRect()?.top;
      if (typeof awardsTop !== "number") return;

      const marginPage = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--margin-page"));
      const topThreshold = (Number.isFinite(marginPage) ? marginPage : 0) + 50;
      setFadeIntroductionOut(awardsTop <= topThreshold);
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateFadeState);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [awardsBoundaryRef]);

  const introText = useMemo(() => truncatePortableText(introduction, visibleCharacters), [introduction, visibleCharacters]);
  const introTextWithoutPrefix = useMemo(
    () => stripPortableTextPrefix(introText, fixedPrefixCharacters),
    [fixedPrefixCharacters, introText],
  );
  const handleLogotypeClick = useCallback(() => {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    if (currentScrollY <= 1) return;

    const lenis = window?.lenis || window?.__lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(0, {
        duration: 1,
        easing: (value) => 1 - (1 - value) ** 3,
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className={styles.introductionStable}>
      <div className={styles.introductionStabilizer} aria-hidden="true" ref={introMeasurementRef}>
        <Text text={introduction} className={styles.introductionText} />
      </div>

      <motion.div
        className={styles.introductionOverlay}
        animate={{ opacity: fadeIntroductionOut ? 0 : 1 }}
        transition={{ duration: 0 }}
      >
        {headerVisible ? (
          <div className={styles.introductionTextWithPrefix}>
            <span className={styles.introductionPrefixBold} typo="bold" onClick={handleLogotypeClick}>
              {fixedPrefixText}
            </span>
            <Text text={introTextWithoutPrefix} className={styles.introductionTextInline} />
          </div>
        ) : (
          <Text text={introText} className={styles.introductionText} />
        )}
      </motion.div>
    </div>
  );
};

export default IntroductionText;
