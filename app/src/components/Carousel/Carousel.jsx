import { useCallback, useEffect, useRef } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Media from "@/components/Media/Media";

import styles from "./Carousel.module.css";

import { motion } from "framer-motion";

const Carousel = ({ array, onIndexChange, isInfinite = false, dragFree = true, autoScroll = true }) => {
  if (!array) return;
  const hasMultipleSlides = array.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: isInfinite,
      dragResistance: 1,
      dragFree,
      skipSnaps: dragFree,
    },
    [],
  );
  const rootRef = useRef(null);
  const carouselIdRef = useRef(`carousel-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const autoScrollStoppedRef = useRef(false);
  const autoScrollRafRef = useRef(null);

  const stopAutoScroll = useCallback(() => {
    autoScrollStoppedRef.current = true;
    if (autoScrollRafRef.current !== null) {
      window.cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  const setEmblaNode = useCallback(
    (node) => {
      rootRef.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  const isCarouselInView = useCallback(() => {
    const currentNode = rootRef.current;
    if (!currentNode) return false;

    const rect = currentNode.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }, []);

  const isTopVisibleCarousel = useCallback(() => {
    const currentNode = rootRef.current;
    if (!currentNode) return false;

    const viewportCenter = window.innerHeight / 2;
    const allCarousels = Array.from(document.querySelectorAll(".embla"));

    const visibleCarousels = allCarousels.filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    });

    if (!visibleCarousels.length) return false;

    const closestNode = visibleCarousels.reduce((closest, node) => {
      const rect = node.getBoundingClientRect();
      const nodeCenter = rect.top + rect.height / 2;
      const distanceToCenter = Math.abs(nodeCenter - viewportCenter);

      if (!closest || distanceToCenter < closest.distanceToCenter) {
        return { node, distanceToCenter };
      }

      return closest;
    }, null)?.node;

    return closestNode === currentNode;
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateIndex = () => {
      const index = emblaApi.selectedScrollSnap();
      const normalizedIndex = index % array.length;
      onIndexChange?.(normalizedIndex);
    };

    updateIndex();
    emblaApi.on("select", updateIndex);
    emblaApi.on("scroll", updateIndex);

    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("scroll", updateIndex);
    };
  }, [emblaApi, array.length, onIndexChange]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleKeyDown = (e) => {
      if (!isTopVisibleCarousel()) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        emblaApi.scrollNext();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emblaApi.scrollPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [emblaApi, isTopVisibleCarousel]);

  useEffect(() => {
    if (!autoScroll) return;
    if (!emblaApi) return;
    if (!hasMultipleSlides) return;
    if (autoScrollStoppedRef.current) return;

    let previousTime = 0;

    const tick = (time) => {
      if (autoScrollStoppedRef.current) return;

      autoScrollRafRef.current = window.requestAnimationFrame(tick);

      if (!isCarouselInView()) {
        previousTime = time;
        return;
      }

      if (!previousTime) {
        previousTime = time;
        return;
      }

      const frameDelta = Math.min(64, time - previousTime);
      previousTime = time;

      const engine = emblaApi.internalEngine?.();
      const canScrollByDistance =
        Boolean(engine?.scrollTo?.distance) &&
        Boolean(engine?.scrollBody?.useBaseFriction) &&
        Boolean(engine?.scrollBody?.useDuration);

      if (!canScrollByDistance) return;

      // Gentle continuous drift that mimics a very slow autoplay.
      engine.scrollTo.distance(frameDelta * -0.012, false);
    };

    autoScrollRafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (autoScrollRafRef.current !== null) {
        window.cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
    };
  }, [autoScroll, emblaApi, hasMultipleSlides, isCarouselInView]);

  const handleWheel = (event) => {
    if (!hasMultipleSlides) return;
    if (!emblaApi) return;
    if (!isTopVisibleCarousel()) return;

    const absDeltaX = Math.abs(event.deltaX);
    const absDeltaY = Math.abs(event.deltaY);
    const isHorizontalIntent = absDeltaX > absDeltaY && absDeltaX > 8;
    const isShiftHorizontalIntent = event.shiftKey && absDeltaY > 8;

    if (!isHorizontalIntent && !isShiftHorizontalIntent) return;

    stopAutoScroll();

    const wheelDelta = isHorizontalIntent ? event.deltaX : event.deltaY;
    const directionAdjustedDelta = -wheelDelta;
    const engine = emblaApi.internalEngine?.();
    const canScrollByDistance =
      Boolean(engine?.scrollTo?.distance) &&
      Boolean(engine?.scrollBody?.useBaseFriction) &&
      Boolean(engine?.scrollBody?.useDuration);

    event.preventDefault();

    if (canScrollByDistance) {
      // Trackpad swipe follows wheel distance continuously instead of snap-by-snap stepping.
      // engine.scrollBody.useBaseFriction().useDuration(25);
      engine.scrollTo.distance(directionAdjustedDelta * 1, false);
      return;
    }

    if (directionAdjustedDelta > 0) {
      emblaApi.scrollNext();
      return;
    }

    emblaApi.scrollPrev();
  };

  return (
    <motion.div
      className={`${styles.carousel_outer} embla`}
      ref={setEmblaNode}
      data-carousel-id={carouselIdRef.current}
      onWheel={handleWheel}
      onPointerDown={stopAutoScroll}
    >
      <div className={`${styles.carousel_inner}`}>
        {array.map((item, index) => {
          const aspectRatio = item.medium.width / item.medium.height;
          const slideWidth = `calc(80vh * ${aspectRatio})`;

          return (
            <li key={`${item?._id ?? "slide"}-${index}`} className={`${styles.slide} slide`} style={{ width: slideWidth }}>
              <Media medium={item.medium} />
            </li>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Carousel;
