import { forwardRef } from "react";

import styles from "./Section.module.css";

const Section = forwardRef(function Section({ children, className }, ref) {
  return (
    <section ref={ref} className={`${styles.section} ${className}`}>
      {children}
    </section>
  );
});

export default Section;
