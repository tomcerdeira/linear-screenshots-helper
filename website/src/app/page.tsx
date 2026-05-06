import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Linear Screenshot — Capture and Create Linear Tickets Instantly",
  description:
    "A lightweight macOS menu bar app that captures any region of your screen and creates Linear issues in seconds, without leaving your flow.",
  openGraph: {
    title: "Linear Screenshot",
    description:
      "Capture screenshots and create Linear tickets instantly from your menu bar.",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
