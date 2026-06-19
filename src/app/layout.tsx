import type { Metadata } from "next";

import { AppProviders } from "@/src/app/providers";
import { Inter, Outfit, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wyrefy.com"),
  title: {
    default: "Wyrefy | Autonomous AI Frontend Workspace",
    template: "%s | Wyrefy",
  },
  description: "Wyrefy is an autonomous AI workspace that turns Figma designs and project context into live, production-grade applications.",
  keywords: [
    "AI frontend generation",
    "Figma to code",
    "Autonomous AI workspace",
    "React code generator",
    "Next.js code generator",
    "AI developer tools",
    "frontend automation",
    "Figma to React",
    "no-code AI",
    "Selsoft",
  ],
  authors: [{ name: "Selsoft Inc", url: "https://selsoftinc.com" }],
  creator: "Selsoft Inc",
  publisher: "Selsoft Inc",
  alternates: {
    canonical: "https://wyrefy.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wyrefy.com",
    title: "Wyrefy | Autonomous AI Frontend Workspace",
    description: "Wyrefy is an autonomous AI workspace that turns Figma designs and project context into live, production-grade applications.",
    siteName: "Wyrefy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wyrefy - Autonomous AI Frontend Workspace",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wyrefy | Autonomous AI Frontend Workspace",
    description: "Wyrefy is an autonomous AI workspace that turns Figma designs and project context into live, production-grade applications.",
    images: ["/og-image.png"],
    creator: "@Wyrefy",
    site: "@Wyrefy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/wyrefy_logo.ico",
    shortcut: "/wyrefy_logo.ico",
    apple: "/wyrefy_logo.png",
  },
  verification: {
    // Add your Google Search Console verification token here when ready:
    // google: "your-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`min-h-full antialiased ${inter.variable} ${outfit.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          // Safe use of dangerouslySetInnerHTML to initialize theme and prevent FOUC
          dangerouslySetInnerHTML={{ __html: `
            try {
              const stored = localStorage.getItem("wyrefy-theme") || "system";
              const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              document.documentElement.dataset.theme = stored === "system" ? (systemDark ? "dark" : "light") : stored;
            } catch {}
          ` }}
        />
      </head>
      <body className="min-h-full overflow-x-clip">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
