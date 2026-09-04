import "./globals.css";
import "./fonts.css";

import { getSite } from "@/lib/fetch";

import { DeviceProvider } from "@/context/DeviceContext";
import { ViewportProvider } from "../context/ViewportContext";

const metadataIcons = {
  icon: [
    { url: "/favicon/icons/favicon.ico", sizes: "any", type: "image/x-icon" },
    { url: "/favicon/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    { url: "/favicon/icons/favicon-192x192.png", sizes: "192x192", type: "image/png" },
  ],
  shortcut: "/favicon/icons/favicon.ico",
  apple: [
    { url: "/favicon/icons/favicon-57x57.png", sizes: "57x57" },
    { url: "/favicon/icons/favicon-60x60.png", sizes: "60x60" },
    { url: "/favicon/icons/favicon-72x72.png", sizes: "72x72" },
    { url: "/favicon/icons/favicon-76x76.png", sizes: "76x76" },
    { url: "/favicon/icons/favicon-114x114.png", sizes: "114x114" },
    { url: "/favicon/icons/favicon-120x120.png", sizes: "120x120" },
    { url: "/favicon/icons/favicon-144x144.png", sizes: "144x144" },
    { url: "/favicon/icons/favicon-152x152.png", sizes: "152x152" },
    { url: "/favicon/icons/favicon-180x180.png", sizes: "180x180" },
  ],
};

export async function generateMetadata() {
  const site = await getSite();
  return {
    title: site?.title,
    description: site?.description,
    manifest: "/favicon/site.webmanifest",
    icons: metadataIcons,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="cc9341ef-be00-431b-b65b-1b92c289ea25" />
      </head>
      <body>
        <DeviceProvider>
          <ViewportProvider>{children}</ViewportProvider>
        </DeviceProvider>
      </body>
    </html>
  );
}
