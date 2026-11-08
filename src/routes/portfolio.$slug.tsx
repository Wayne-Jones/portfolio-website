import { createFileRoute, notFound } from "@tanstack/react-router";

import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { NotFound } from "@/components/article/NotFound";
import { TagChips } from "@/components/article/TagChips";
import { Gallery } from "@/components/content/nodes/Gallery";
import { PostBody } from "@/components/content/PostBody";
import { contentService } from "@/content";
import type { GalleryImage } from "@/content/types";

/**
 * Portfolio project route — renders a case study with project metadata, the
 * canonical body, and an optional gallery.
 */
export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => {
    const project = await contentService.getProject(params.slug);
    if (project === null) throw notFound();
    return project;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title;
    return {
      meta: [
        { title: title === undefined ? "Project not found — Portfolio" : `${title} — Portfolio` },
        { name: "description", content: loaderData?.excerpt ?? "" },
      ],
    };
  },
  notFoundComponent: PortfolioNotFound,
  component: PortfolioProject,
});

function PortfolioNotFound() {
  return (
    <NotFound
      title="Project not found"
      message="This case study doesn't exist, or it may have been unpublished."
    />
  );
}

function PortfolioProject() {
  const project = Route.useLoaderData();

  const metadata = [
    project.role ?? "—",
    project.client ?? "—",
    project.year?.toString() ?? "—",
  ].join(" · ");
  const hasMetadata =
    project.role !== undefined || project.client !== undefined || project.year !== undefined;
  const gallery = project.gallery ?? [];

  return (
    <ArticleLayout
      breadcrumbs={[{ label: "Portfolio", to: "/portfolio" }]}
      header={
        <ArticleHeader
          title={project.title}
          eyebrow="Case study"
          meta={
            <>
              <ArticleMeta publishedAt={project.publishedAt} author={project.author} />
              {hasMetadata ? <p className="mt-2">{metadata}</p> : null}
            </>
          }
          tags={<TagChips tags={project.tags} />}
          image={
            project.featureImage === undefined || project.featureImage === ""
              ? undefined
              : { src: project.featureImage, alt: project.title }
          }
          imageTransitionName={`work-tile-${project.slug}`}
          emptyImageFallback
        />
      }
      footer={gallery.length === 0 ? undefined : <ProjectGallery images={gallery} />}
    >
      <PostBody content={project.content} />
    </ArticleLayout>
  );
}

function ProjectGallery({ images }: { images: GalleryImage[] }) {
  return (
    <section aria-labelledby="project-gallery-heading">
      <h2
        id="project-gallery-heading"
        className="mb-6 font-display text-2xl font-semibold tracking-tight"
      >
        Gallery
      </h2>
      <Gallery images={images} />
    </section>
  );
}
