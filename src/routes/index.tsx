import { createFileRoute, defer } from "@tanstack/react-router";
import { Suspense, use } from "react";

import { RecentPosts } from "@/components/home/blog/RecentPosts";
import { ContactFooter } from "@/components/home/contact-footer/ContactFooter";
import { Hero } from "@/components/home/hero/Hero";
import { Photography } from "@/components/home/photography/Photography";
import { WorkPortfolio } from "@/components/home/work-portfolio/WorkPortfolio";
import { contentService } from "@/content";
import type { Photo, Post, Project } from "@/content/types";

export const Route = createFileRoute("/")({
  loader: () => {
    return {
      projects: defer(contentService.getFeaturedProjects(4)),
      photos: defer(contentService.getFeaturedPhotos(6)),
      posts: defer(contentService.getRecentPosts(3)),
    };
  },
  component: Homepage,
});

function WorkPortfolioSection({ projects }: { projects: Promise<Project[]> }) {
  return <WorkPortfolio projects={use(projects)} />;
}

function PhotographySection({ photos }: { photos: Promise<Photo[]> }) {
  return <Photography photos={use(photos)} />;
}

function RecentPostsSection({ posts }: { posts: Promise<Post[]> }) {
  return <RecentPosts posts={use(posts)} />;
}

function Homepage() {
  const { projects, photos, posts } = Route.useLoaderData();

  return (
    <>
      <Hero />
      <Suspense fallback={<WorkPortfolio projects={[]} />}>
        <WorkPortfolioSection projects={projects} />
      </Suspense>
      <Suspense fallback={<Photography photos={[]} />}>
        <PhotographySection photos={photos} />
      </Suspense>
      <Suspense fallback={<RecentPosts posts={[]} />}>
        <RecentPostsSection posts={posts} />
      </Suspense>
      <ContactFooter />
    </>
  );
}
