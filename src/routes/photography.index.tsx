import { createFileRoute } from "@tanstack/react-router";

import { PhotoSetGallery } from "@/components/photography/PhotoSetGallery";
import { contentService } from "@/content";

/**
 * Photography index — masonry gallery of every photo set.
 */
export const Route = createFileRoute("/photography/")({
  loader: async () => ({ photoSets: await contentService.getPhotoSets() }),
  head: () => ({
    meta: [
      { title: "Photography — Portfolio" },
      { name: "description", content: "Photo sets from the archive." },
    ],
  }),
  component: PhotographyIndex,
});

function PhotographyIndex() {
  const { photoSets } = Route.useLoaderData();
  return <PhotoSetGallery photoSets={photoSets} />;
}
