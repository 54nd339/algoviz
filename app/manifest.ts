import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Algoviz",
    short_name: "Algoviz",
    description:
      "Interactive algorithm visualizer with 100+ algorithms across 15 categories.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "any",
    categories: ["education", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
