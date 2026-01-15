import "./globals.css";
import "./fonts.css";

const [site] = await Promise.all([getSite()]);

export const metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
