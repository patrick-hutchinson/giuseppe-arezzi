import { useCallback, useContext, useEffect, useRef, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Media from "@/components/Media/Media";

import styles from "./Carousel.module.css";

import { motion } from "framer-motion";

import { DeviceContext } from "@/context/DeviceContext";

const Carousel = ({ array, onIndexChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { isTouch } = useContext(DeviceContext);
  if (!array) return;
  const hasMultipleSlides = array.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: hasMultipleSlides,
      dragResistance: 1,
      dragFree: hasMultipleSlides && isTouch ? true : false,
    },
    []
  );
  const rootRef = useRef(null);
  const wheelGestureLockedRef = useRef(false);
  const wheelGestureReleaseTimeoutRef = useRef(null);
  const carouselIdRef = useRef(
    `carousel-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );

  const setEmblaNode = useCallback(
    (node) => {
      rootRef.current = node;
      emblaRef(node);
    },
    [emblaRef]
  );

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

  const carouselMedia = hasMultipleSlides ? [...array, ...array, ...array] : array;

  useEffect(() => {
    if (!hasMultipleSlides) return;
    if (!emblaApi) return;

    const updateIndex = () => {
      const index = emblaApi.selectedScrollSnap();
      onIndexChange?.(index % array.length); // normalize for tripled array
    };

    updateIndex();
    emblaApi.on("select", updateIndex);
    emblaApi.on("scroll", updateIndex);

    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("scroll", updateIndex);
    };
  }, [emblaApi, array.length, hasMultipleSlides, onIndexChange]);

  useEffect(() => {
    if (!hasMultipleSlides) return;
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
  }, [emblaApi, hasMultipleSlides, isTopVisibleCarousel]);

  useEffect(() => {
    if (!hasMultipleSlides) return;
    if (!emblaApi) return;

    const onDragStart = () => setIsDragging(true);
    const onDragEnd = () => setIsDragging(false);

    emblaApi.on("pointerDown", onDragStart);
    emblaApi.on("pointerUp", onDragEnd);
    emblaApi.on("dragEnd", onDragEnd);

    return () => {
      emblaApi.off("pointerDown", onDragStart);
      emblaApi.off("pointerUp", onDragEnd);
      emblaApi.off("dragEnd", onDragEnd);
    };
  }, [emblaApi, hasMultipleSlides]);

  useEffect(() => {
    return () => {
      if (wheelGestureReleaseTimeoutRef.current) {
        window.clearTimeout(wheelGestureReleaseTimeoutRef.current);
      }
    };
  }, []);

  const handleWheel = (event) => {
    if (!hasMultipleSlides) return;
    if (!emblaApi) return;
    if (!isTopVisibleCarousel()) return;

    const absDeltaX = Math.abs(event.deltaX);
    const absDeltaY = Math.abs(event.deltaY);
    const isHorizontalIntent = absDeltaX > absDeltaY && absDeltaX > 8;
    const isShiftHorizontalIntent = event.shiftKey && absDeltaY > 8;

    if (!isHorizontalIntent && !isShiftHorizontalIntent) return;

    event.preventDefault();

    if (wheelGestureReleaseTimeoutRef.current) {
      window.clearTimeout(wheelGestureReleaseTimeoutRef.current);
    }

    wheelGestureReleaseTimeoutRef.current = window.setTimeout(() => {
      wheelGestureLockedRef.current = false;
      wheelGestureReleaseTimeoutRef.current = null;
    }, 180);

    if (wheelGestureLockedRef.current) return;
    wheelGestureLockedRef.current = true;

    const wheelDelta = isHorizontalIntent ? event.deltaX : event.deltaY;
    if (wheelDelta > 0) {
      emblaApi.scrollNext();
      return;
    }

    emblaApi.scrollPrev();
  };

  return (
    <motion.div
      className={`${styles.carousel_outer} ${hasMultipleSlides ? "embla" : ""} ${
        !hasMultipleSlides ? styles.carouselStatic : ""
      }`}
      ref={setEmblaNode}
      data-carousel-id={carouselIdRef.current}
      onWheel={handleWheel}
    >
      <div className={`${styles.carousel_inner} embla__container`}>
        {carouselMedia.map((item) => {
          return (
            <li key={item._id} className={`${styles.slide} embla__slide`}>
              <Media medium={item.medium} />
            </li>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Carousel;
