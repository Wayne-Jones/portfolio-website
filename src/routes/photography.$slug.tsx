import { createFileRoute, notFound } from "@tanstack/react-router";

import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { NotFound } from "@/components/article/NotFound";
import { TagChips } from "@/components/article/TagChips";
import { FigureImage } from "@/components/content/nodes/FigureImage";
import { PostBody } from "@/components/content/PostBody";
import { contentService } from "@/content";

/**
 * Photo set route — renders the set metadata, optional cover, canonical body,
 * and the full image grid.
 */
export const Route = createFileRoute("/photography/$slug")({
  loader: async ({ params }) => {
    const photoSet = await contentService.getPhotoSet(params.slug);
    if (photoSet === null) throw notFound();
    return photoSet;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title;
    return {
      meta: [
        {
          title:
            title === undefined ? "Photo set not found — Photography" : `${title} — Photography`,
        },
        { name: "description", content: loaderData?.excerpt ?? "" },
      ],
    };
  },
  notFoundComponent: PhotoSetNotFound,
  component: PhotoSetDetail,
});

function PhotoSetNotFound() {
  return (
    <NotFound
      title="Photo set not found"
      message="This set doesn't exist, or it may have been unpublished."
    />
  );
}

function PhotoSetDetail() {
  const photoSet = Route.useLoaderData();

  const metadata = [photoSet.location, photoSet.camera]
    .filter((part) => part !== undefined && part !== "")
    .join(" · ");

  return (
    <ArticleLayout
      breadcrumbs={[{ label: "Photography", to: "/photography" }]}
      current={photoSet.title}
      header={
        <ArticleHeader
          title={photoSet.title}
          eyebrow="Photography"
          meta={
            <>
              <ArticleMeta publishedAt={photoSet.publishedAt} author={photoSet.author} />
              {metadata === "" ? null : <p className="mt-2">{metadata}</p>}
            </>
          }
          tags={<TagChips tags={photoSet.tags} />}
          image={
            photoSet.coverImage === undefined || photoSet.coverImage === ""
              ? undefined
              : { src: photoSet.coverImage, alt: "" }
          }
          imageTransitionName={`photo-${photoSet.slug}`}
          emptyImageFallback
        />
      }
      footer={
        photoSet.images.length === 0 ? undefined : (
          <PhotoGrid images={photoSet.images} title={photoSet.title} />
        )
      }
      footerFullBleed
    >
      <PostBody content={photoSet.content} />
    </ArticleLayout>
  );
}

function PhotoGrid({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section aria-label="Photo set images" className="columns-2 gap-4 md:columns-3">
      {images.map((src, index) => (
        <div key={`${src}-${index}`} className="mb-4 break-inside-avoid [&>figure]:my-0">
          <FigureImage image={{ src, alt: `${title} — photograph ${index + 1}` }} />
        </div>
      ))}
    </section>
  );
}
