import { useEffect, useMemo, useRef, useState } from "react";

import Text from "@/components/Text/Text";

import styles from "../Home.module.css";

const INTRO_PROJECT_GAP = 100;
const INTRO_FIXED_WORDS = 2;

const countPortableTextCharacters = (blocks = []) => {
  return blocks.reduce((count, block) => {
    if (block?._type !== "block" || !Array.isArray(block.children)) return count;

    return (
      count +
      block.children.reduce((childCount, child) => childCount + (child?.text?.length || 0), 0)
    );
  }, 0);
};

const getPortableTextContent = (blocks = []) => {
  return blocks.reduce((result, block) => {
    if (block?._type !== "block" || !Array.isArray(block.children)) return result;
    return (
      result +
      block.children.reduce((childText, child) => childText + (child?.text || ""), "")
    );
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

const IntroductionText = ({ text, projectsBoundaryRef, headerVisible = false }) => {
  const introduction = text || [];
  const totalIntroCharacters = useMemo(
    () => countPortableTextCharacters(introduction),
    [introduction]
  );
  const fixedPrefixCharacters = useMemo(
    () => getFixedPrefixCharacters(introduction, INTRO_FIXED_WORDS),
    [introduction]
  );
  const dynamicIntroCharacters = Math.max(0, totalIntroCharacters - fixedPrefixCharacters);
  const fixedPrefixText = useMemo(
    () => getPortableTextContent(introduction).slice(0, fixedPrefixCharacters),
    [fixedPrefixCharacters, introduction]
  );
  const introMeasurementRef = useRef(null);
  const [visibleCharacters, setVisibleCharacters] = useState(totalIntroCharacters);

  useEffect(() => {
    setVisibleCharacters(totalIntroCharacters);
  }, [totalIntroCharacters]);

  useEffect(() => {
    let frameId = null;

    const updateVisibleCharacters = () => {
      frameId = null;

      const measurementHeight = introMeasurementRef.current?.offsetHeight || 0;
      const projectsTop = projectsBoundaryRef?.current?.getBoundingClientRect()?.top ?? 0;

      if (!totalIntroCharacters || !measurementHeight) {
        setVisibleCharacters(totalIntroCharacters);
        return;
      }

      const availableHeight = Math.max(0, projectsTop - INTRO_PROJECT_GAP);
      const clampedRatio = Math.max(0, Math.min(1, availableHeight / measurementHeight));
      const nextVisibleCharacters =
        fixedPrefixCharacters + Math.floor(dynamicIntroCharacters * clampedRatio);

      setVisibleCharacters((currentVisibleCharacters) => {
        if (currentVisibleCharacters === nextVisibleCharacters) return currentVisibleCharacters;
        return nextVisibleCharacters;
      });
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
  }, [dynamicIntroCharacters, fixedPrefixCharacters, projectsBoundaryRef, totalIntroCharacters]);

  const introText = useMemo(
    () => truncatePortableText(introduction, visibleCharacters),
    [introduction, visibleCharacters]
  );
  const introTextWithoutPrefix = useMemo(
    () => stripPortableTextPrefix(introText, fixedPrefixCharacters),
    [fixedPrefixCharacters, introText]
  );

  return (
    <>
      {headerVisible ? (
        <div className={styles.introductionTextWithPrefix}>
          <span className={styles.introductionPrefixBold} typo="bold">
            {fixedPrefixText}
          </span>
          <Text text={introTextWithoutPrefix} className={styles.introductionTextInline} />
        </div>
      ) : (
        <Text text={introText} className={styles.introductionText} />
      )}
      <div className={styles.introductionMeasure} aria-hidden="true" ref={introMeasurementRef}>
        <Text text={introduction} className={styles.introductionText} />
      </div>
    </>
  );
};

export default IntroductionText;
