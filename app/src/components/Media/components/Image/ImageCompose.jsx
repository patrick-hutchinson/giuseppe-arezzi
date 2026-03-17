import { useState } from "react";

import Image from "./Image";
import styles from "../../Media.module.css";
import Placeholder from "../Placeholder";

const ImageCompose = ({ medium, className, eager = false, contain = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`${styles.mediaContainer} ${className}`}>
      {<Placeholder medium={medium} isLoaded={isLoaded} contain={contain} />}
      <Image medium={medium} setIsLoaded={setIsLoaded} eager={eager} contain={contain} />
    </div>
  );
};

export default ImageCompose;
