import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Linear Screenshot",
    short_name: "LinScreenshot",
    description:
      "Capture screenshots and create Linear tickets instantly from your macOS menu bar.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#5E6AD2",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
