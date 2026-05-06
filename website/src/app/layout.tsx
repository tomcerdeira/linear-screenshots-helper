import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MotionProvider } from "@/components/MotionProvider";
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
  title: "Linear Screenshot — Capture and Create Linear Tickets Instantly",
  description:
    "A lightweight menu bar app that captures screenshots and instantly creates or updates Linear tickets. Global hotkeys, rich text, keyboard-driven workflow.",
  openGraph: {
    title: "Linear Screenshot",
    description:
      "Capture screenshots and create Linear tickets instantly from your menu bar.",
    type: "website",
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
