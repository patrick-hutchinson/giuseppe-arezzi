import "./globals.css";
import "./fonts.css";

import { getSite } from "@/lib/fetch";

import { DeviceProvider } from "@/context/DeviceContext";
import { ViewportProvider } from "../context/ViewportContext";

const [site] = await Promise.all([getSite()]);

export const metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <DeviceProvider>
        <ViewportProvider>
          <body>{children}</body>
        </ViewportProvider>
      </DeviceProvider>
    </html>
  );
}
