import Section from "@/components/Section/Section";

import styles from "../../Home.module.css";
import IntroductionText from "./IntroductionText";

const IntroductionSection = ({ text, projectsBoundaryRef, headerVisible, awardsBoundaryRef, onReady }) => {
  return (
    <Section className={styles.introductionSection}>
      <IntroductionText
        text={text}
        projectsBoundaryRef={projectsBoundaryRef}
        headerVisible={headerVisible}
        awardsBoundaryRef={awardsBoundaryRef}
        onReady={onReady}
      />
    </Section>
  );
};

export default IntroductionSection;
