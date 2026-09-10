import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";
import type { Post } from "../types";

function AdminPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const response = await apiFetch("/posts?limit=50&offset=0");

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await response.json();
    setPosts(data);
  };

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchPosts();
      } catch {
        // handle error if you want
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    const response = await apiFetch(`/posts/${postId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Unable to delete post.");
      return;
    }

    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId),
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-600">Field notes</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:py-14">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Content library</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">Posts</h2>
          </div>

          <button
            onClick={() => navigate("/admin/posts/new")}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-amber-600"
          >
            + New Post
          </button>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-500">Loading posts...</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{post.title}</h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded-full border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPage;
