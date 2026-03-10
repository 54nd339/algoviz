import type { MetadataRoute } from "next";

import { CATEGORY_SLUGS } from "@/lib/categories";

export const dynamic = "force-static";

const BASE_URL = "https://algos.sandeepswain.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryRoutes = CATEGORY_SLUGS.map((cat) => ({
    url: `${BASE_URL}/${cat}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...categoryRoutes,
  ];
}
