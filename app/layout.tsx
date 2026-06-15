import type { Metadata } from "next";

import { AppProviders } from "@/src/app/providers";
import { Inter, Outfit, Space_Grotesk } from "next/font/google";
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
  title: "Wyrefy",
  description: "AI frontend generation workspace",
  icons: {
    icon: "/wyrefy_logo.ico",
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
      className={`h-full antialiased scroll-smooth ${inter.variable} ${outfit.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const stored = localStorage.getItem("wyrefy-theme") || "system";
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.dataset.theme = stored === "system" ? (systemDark ? "dark" : "light") : stored;
          } catch {}
        ` }} />
      </head>
      <body className="min-h-full overflow-x-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
