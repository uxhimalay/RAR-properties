import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const interDisplay = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "../fonts/InterDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/InterDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/InterDisplay-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/InterDisplay-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/InterDisplay-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/InterDisplay-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
});

/**
 * The public origin. Social previews need absolute URLs; without this Next resolves them against
 * localhost and warns at build time. Set NEXT_PUBLIC_SITE_URL in the environment before launch.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ArcSphere — Dubai real estate: homes, offices, villas and hot deals",
  description:
    "ArcSphere is a Dubai real estate agency. Explore residential, commercial, warehouse and villa listings, current hot deals, book a visit and talk to a consultant.",
  icons: {
    icon: [{ url: "/seo/favicon-1.png", type: "image/png" }],
    apple: [{ url: "/seo/apple-touch-icon.png" }],
  },
  openGraph: {
    title: "ArcSphere — Dubai real estate",
    description:
      "Homes, offices, warehouses and villas across Dubai, current hot deals, and a consultant to walk you through them.",
    images: [{ url: "/seo/og-image.png", width: 3600, height: 2013 }],
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interDisplay.variable} ${inter.variable} antialiased`}>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
