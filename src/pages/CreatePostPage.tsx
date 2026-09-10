import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { supabase } from "../lib/supabase";

function CreatePostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      let finalImageUrl = imageMode === "url" ? imageUrl.trim() || null : null;

      if (imageMode === "upload" && imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          throw new Error("Please select an image file.");
        }

        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error("Images must be smaller than 5 MB.");
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        const fileExtension = imageFile.name.includes(".")
          ? `.${imageFile.name.split(".").pop()?.toLowerCase()}`
          : "";
        const fileName = `${session.user.id}/${crypto.randomUUID()}${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);

        finalImageUrl = data.publicUrl;
      }

      const response = await apiFetch("/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          image_url: finalImageUrl,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText || `Failed to create post (${response.status})`
        );
      }

      navigate("/admin");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm font-semibold text-slate-600 transition hover:text-amber-700"
          >
            ← Back to dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-600">Content studio</p>
        <h1 className="mb-8 text-4xl font-semibold tracking-tight">Create New Post</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Title</label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white"
              placeholder="My new post"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Content</label>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={12}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white"
              placeholder="Write your post..."
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-slate-700">Image</label>

            <div className="mb-4 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`flex-1 rounded px-4 py-2 text-sm font-medium ${
                  imageMode === "upload"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Upload
              </button>

              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`flex-1 rounded px-4 py-2 text-sm font-medium ${
                  imageMode === "url"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Image URL
              </button>
            </div>

            {imageMode === "upload" ? (
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setImageFile(event.target.files?.[0] ?? null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:font-semibold file:text-amber-800 focus:border-amber-400"
              />
            ) : (
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white"
                placeholder="https://example.com/image.jpg"
              />
            )}
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-900 px-4 py-3.5 font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-amber-600 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreatePostPage;
