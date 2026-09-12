import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Post not found.");
        setLoading(false);
        return;
      }

      try {
        // We don't have GET /posts/{id}, so fetch the list
        // and find the matching post for now.
        const response = await apiFetch("/admin/posts?limit=50&offset=0");

        if (!response.ok) {
          throw new Error("Failed to load post.");
        }

        const posts = await response.json();
        const post = posts.find((post: { id: string }) => post.id === id);

        if (!post) {
          throw new Error("Post not found.");
        }

        setTitle(post.title);
        setContent(post.content);
        setImageUrl(post.image_url || "");
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load post.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSave = async (
    event: React.FormEvent,
    action: "draft" | "publish",
  ) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    setError("");
    setSaving(true);

    try {
      // First save the current form fields.
      const updateResponse = await apiFetch(`/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          image_url: imageUrl.trim() || null,
        }),
      });

      if (!updateResponse.ok) {
        const responseText = await updateResponse.text();
        throw new Error(responseText || "Failed to update post.");
      }

      // Then set the desired status.
      const statusResponse = await apiFetch(
        `/posts/${id}/${action === "publish" ? "publish" : "draft"}`,
        {
          method: "POST",
        },
      );

      if (!statusResponse.ok) {
        const responseText = await statusResponse.text();

        throw new Error(
          responseText ||
            `Failed to ${action === "publish" ? "publish" : "save as draft"}.`,
        );
      }

      navigate("/admin");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Loading post...
        </p>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <p className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          {error}
        </p>

        <button
          onClick={() => navigate("/admin")}
          className="mx-auto mt-5 block font-semibold text-slate-700 underline"
        >
          Back to dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm font-semibold text-slate-600 transition hover:text-amber-700"
          >
            ← Back to dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-600">
          Content studio
        </p>
        <h1 className="mb-8 text-4xl font-semibold tracking-tight">
          Edit Post
        </h1>

        <form
          onSubmit={(event) => handleSave(event, "draft")}
          className="space-y-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Content
            </label>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={12}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-wait disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={(event) => handleSave(event, "publish")}
              disabled={saving}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-wait disabled:opacity-50"
            >
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EditPostPage;
