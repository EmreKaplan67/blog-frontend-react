import { Link } from "react-router-dom";
import type { Post } from "../types";

type PostCardProps = {
  post: Post;
};

function PostCard({ post }: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-amber-900/15 bg-[#fffaf0]/90 shadow-sm shadow-amber-950/5 transition duration-300 hover:-translate-y-1 hover:border-amber-700/45 hover:shadow-xl hover:shadow-amber-950/10">
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}

      <div className="p-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
          Field notes
        </p>
        <h2 className="text-2xl font-semibold leading-tight">{post.title}</h2>

        <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-stone-700">
          {post.content.slice(0, 150)}...
        </p>

        <Link
          to={`/posts/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-900 no-underline transition hover:gap-3 hover:text-amber-700"
        >
          Read story <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export default PostCard;