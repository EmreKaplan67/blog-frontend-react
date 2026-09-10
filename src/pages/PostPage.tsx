import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Post } from "../types";

function PostPage() {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("Post not found.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/posts/${slug}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        return response.json();
      })
      .then((data) => {
        setPost(data);
      })
      .catch(() => {
        setError("Unable to load post.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Loading story...
        </p>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <p className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          {error || "Post not found."}
        </p>

        <Link to="/" className="mx-auto mt-6 block max-w-3xl font-semibold no-underline">
          Back to posts
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <article className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:py-24">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold no-underline">
          ← Back to posts
        </Link>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="mb-10 h-72 w-full rounded-2xl object-cover shadow-xl shadow-slate-900/10 sm:h-[28rem]"
          />
        )}

        <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-amber-600">
          Field notes
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold sm:text-6xl">{post.title}</h1>

        <p className="mt-5 text-sm font-medium text-slate-500">
          {new Date(post.created_at).toLocaleDateString()}
        </p>

        <div className="mt-12 max-w-3xl whitespace-pre-wrap font-serif text-xl leading-9 text-slate-700">
          {post.content}
        </div>
      </article>
    </main>
  );
}

export default PostPage;