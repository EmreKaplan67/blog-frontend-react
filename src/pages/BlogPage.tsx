import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import type { Post } from "../types";

function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (offset: number) => {
    const response = await fetch(
      `http://localhost:8000/posts?limit=10&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    return response.json();
  };

  useEffect(() => {
    fetchPosts(0)
      .then((data) => {
        setPosts(data);

        if (data.length < 10) {
          setHasMore(false);
        }
      })
      .catch(() => {
        setError("Unable to load posts.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);

    try {
      const newPosts = await fetchPosts(posts.length);

      setPosts((currentPosts) => [...currentPosts, ...newPosts]);

      if (newPosts.length < 10) {
        setHasMore(false);
      }
    } catch {
      setError("Unable to load more posts.");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf3e3]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
          Loading stories...
        </p>
      </main>
    );
  }

  if (error && posts.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf3e3] px-6">
        <p className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf3e3]/70">
      <section className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:py-20">
        <div className="mb-12 max-w-3xl border-b border-amber-900/15 pb-10">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-amber-800">
            Field notes / journal
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Ideas worth keeping.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-stone-700">
            Thoughtful essays on building, making, and finding a clearer path
            through the noise.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full bg-amber-900 px-7 py-3.5 text-sm font-bold text-amber-50 shadow-lg shadow-amber-950/15 transition hover:-translate-y-0.5 hover:bg-amber-800 hover:shadow-amber-700/20 disabled:cursor-wait disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {error && posts.length > 0 && (
          <p className="mt-4 text-center text-red-600">{error}</p>
        )}
      </section>
    </main>
  );
}

export default BlogPage;