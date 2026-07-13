import { createFileRoute } from "@tanstack/react-router";

/**
 * Blog post route — placeholder.
 *
 * The `$slug` param will be used to fetch a single post from the
 * content adapter in a subsequent change.
 */
export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();

  return (
    <article>
      <div
        style={{ viewTransitionName: `blog-${slug}` }}
        className="mb-6 aspect-4/3 w-full rounded-md bg-muted/10"
      />
      <h1 className="mb-2 text-3xl">Blog post</h1>
      <p className="max-w-[40ch] text-muted">This post's content will load here.</p>
    </article>
  );
}
