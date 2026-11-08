import { BlogCard } from "@/components/home/blog/BlogCard";
import { Section } from "@/components/home/shared/Section";
import type { Post } from "@/content/types";

interface RecentPostsProps {
  posts: Post[];
  /** True while the section's deferred content is pending. */
  loading?: boolean;
}

const skeletonItems = [0, 1, 2];

export function RecentPosts({ posts, loading = false }: RecentPostsProps) {
  if (loading) {
    return (
      <Section eyebrow="BLOG" title="Recent posts" loading loadingMessage="Loading recent posts…">
        <div aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {skeletonItems.map((i) => (
            <div key={i} className="flex flex-col rounded-md bg-muted/10 p-6">
              <div className="animate-shimmer mb-3 h-5 w-3/4 rounded" />
              <div className="animate-shimmer mb-2 h-4 w-full rounded" />
              <div className="mt-auto flex gap-3 pt-4">
                <div className="animate-shimmer h-3 w-20 rounded" />
                <div className="animate-shimmer h-3 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (posts.length === 0) {
    return (
      <Section eyebrow="BLOG" title="Recent posts">
        <p className="text-muted">No posts yet.</p>
      </Section>
    );
  }

  return (
    <Section eyebrow="BLOG" title="Recent posts">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </Section>
  );
}
