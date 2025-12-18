import styles from "./Home.module.css";

import Text from "@/components/Text/Text";

export default function HomePage({ site, home }) {
  return (
    <main className={styles.main}>
      <div className={styles.announcement_container}>
        <div>{site.title}</div>
        {/* <Text text={home.announcement} /> */}

        <p className={styles.announcement_text}>
          New website under construction. <br />
          You can contact me at&nbsp;
          <a href="mailto:info@giuseppearezzi.com">info@giuseppearezzi.com</a>
        </p>

        <div>
          {site.socials.map((social, index) => (
            <a key={index} href={social.link} target="_blank">
              {social.platform}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
