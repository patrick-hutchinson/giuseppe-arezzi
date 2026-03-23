import Section from "@/components/Section/Section";

import styles from "../../Home.module.css";
import IntroductionText from "./IntroductionText";

const IntroductionSection = ({ text, projectsBoundaryRef, headerVisible, awardsBoundaryRef }) => {
  return (
    <Section className={styles.introductionSection}>
      <IntroductionText
        text={text}
        projectsBoundaryRef={projectsBoundaryRef}
        headerVisible={headerVisible}
        awardsBoundaryRef={awardsBoundaryRef}
      />
    </Section>
  );
};

export default IntroductionSection;
