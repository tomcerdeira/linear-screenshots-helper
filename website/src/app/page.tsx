import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";
import { SITE_URL, REPO_URL, DMG_DOWNLOAD_URL } from "@/lib/links";

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Linear Screenshot",
    description:
      "A lightweight macOS menu bar app that captures screenshots and instantly creates or updates Linear tickets.",
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    downloadUrl: DMG_DOWNLOAD_URL,
    softwareVersion: "1.0",
    author: {
      "@type": "Person",
      name: "Tom Cerdeira",
      url: REPO_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
