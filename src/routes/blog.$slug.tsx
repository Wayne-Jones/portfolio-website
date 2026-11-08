import { createFileRoute, notFound } from "@tanstack/react-router";

import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { NotFound } from "@/components/article/NotFound";
import { TagChips } from "@/components/article/TagChips";
import { PostBody } from "@/components/content/PostBody";
import { contentService } from "@/content";

/**
 * Blog post route — loads a single post from the content service and renders
 * its header, metadata, tags, and canonical body.
 */
export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await contentService.getPost(params.slug);
    if (post === null) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title;
    return {
      meta: [
        { title: title === undefined ? "Post not found — Blog" : `${title} — Blog` },
        { name: "description", content: loaderData?.excerpt ?? "" },
      ],
    };
  },
  notFoundComponent: BlogNotFound,
  component: BlogPost,
});

function BlogNotFound() {
  return (
    <NotFound
      title="Post not found"
      message="This post doesn't exist, or it may have been unpublished."
    />
  );
}

function BlogPost() {
  const post = Route.useLoaderData();

  return (
    <ArticleLayout
      breadcrumbs={[{ label: "Blog", to: "/blog" }]}
      current={post.title}
      header={
        <ArticleHeader
          title={post.title}
          eyebrow="Blog"
          meta={
            <ArticleMeta
              publishedAt={post.publishedAt}
              readingTime={post.readingTime}
              author={post.author}
            />
          }
          tags={<TagChips tags={post.tags} />}
          image={
            post.featureImage === undefined || post.featureImage === ""
              ? undefined
              : { src: post.featureImage, alt: "" }
          }
          imageTransitionName={`blog-${post.slug}`}
        />
      }
    >
      <PostBody content={post.content} />
    </ArticleLayout>
  );
}
