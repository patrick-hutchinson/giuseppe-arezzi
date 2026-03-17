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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragResistance: 1, dragFree: isTouch ? true : false }, []);
  const rootRef = useRef(null);
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

  // Triple the date in case it is not long enough to fill the width of the screen
  const carouselMedia = [...array, ...array, ...array];

  useEffect(() => {
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
  }, [emblaApi, array.length, onIndexChange]);

  useEffect(() => {
    if (!emblaApi) return;

    const isTopVisibleCarousel = () => {
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
    };

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
  }, [emblaApi]);

  useEffect(() => {
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
  }, [emblaApi]);

  return (
    <motion.div
      className={`${styles.carousel_outer} embla`}
      ref={setEmblaNode}
      data-carousel-id={carouselIdRef.current}
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
