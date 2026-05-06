import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MotionProvider } from "@/components/MotionProvider";
import { SITE_URL } from "@/lib/links";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Linear Screenshot — Capture and Create Linear Tickets Instantly",
    template: "%s | Linear Screenshot",
  },
  description:
    "A lightweight macOS menu bar app that captures screenshots and instantly creates or updates Linear tickets. Global hotkeys, rich text, keyboard-driven workflow.",
  keywords: [
    "Linear",
    "screenshot",
    "macOS",
    "menu bar",
    "ticket",
    "issue tracker",
    "productivity",
    "developer tools",
    "screen capture",
    "bug report",
  ],
  authors: [{ name: "Tom Cerdeira" }],
  creator: "Tom Cerdeira",
  openGraph: {
    title: "Linear Screenshot",
    description:
      "Capture screenshots and create Linear tickets instantly from your menu bar.",
    url: SITE_URL,
    siteName: "Linear Screenshot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linear Screenshot",
    description:
      "Capture screenshots and create Linear tickets instantly from your menu bar.",
  },
  alternates: {
    canonical: SITE_URL,
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
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="relative h-dvh bg-background text-foreground overflow-hidden">
        <MotionProvider>
          <AnimatedBackground />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
