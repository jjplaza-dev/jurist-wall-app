import Avatar from "./Avatar";
import { AUTHOR_NAME } from "@/lib/config";
import { formatFullTime, formatPostTime } from "@/lib/time";
import type { Post } from "@/lib/types";

type Props = {
  posts: Post[];
  freshIds: Set<string>;
  now: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export default function PostFeed({
  posts,
  freshIds,
  now,
  loading,
  error,
  onRetry,
}: Props) {
  if (error) {
    return (
      <div
        role="alert"
        className="border border-[#dd3c10] bg-[#ffebe8] p-3 text-[#333]"
      >
        <p className="font-bold">The wall couldn’t load.</p>
        <p className="mt-1 break-words">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 cursor-pointer border border-[#999] bg-[#f2f2f2] px-3 py-1 font-bold text-[#333] hover:bg-[#e6e6e6]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <ul aria-busy="true" aria-label="Loading posts">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex gap-3 border-b border-dotted border-[#d8dfea] py-3"
          >
            <div className="h-[50px] w-[50px] shrink-0 bg-[#eceff5] motion-safe:animate-pulse" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-3/4 bg-[#eceff5] motion-safe:animate-pulse" />
              <div className="h-3 w-1/3 bg-[#eceff5] motion-safe:animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-6 text-center text-[#777]">
        Nothing on the wall yet. Write something above to be the first.
      </p>
    );
  }

  return (
    <ul>
      {posts.map((post) => (
        <li
          key={post.id}
          className={`flex gap-3 border-b border-dotted border-[#d8dfea] px-1 py-3 ${
            freshIds.has(post.id) ? "post-new" : ""
          }`}
        >
          <Avatar size={50} />
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap break-words">
  <span className="font-bold text-[#3b5998]">
    {post.author_name || AUTHOR_NAME}
  </span>{" "}
              {post.body}
            </p>
            {post.image_url && (
                <a href={post.image_url} target="_blank" rel="noreferrer" className="mt-2 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                      src={post.image_url}
                      alt={`Photo posted by ${post.author_name || AUTHOR_NAME}`}
                      loading="lazy"
                      className="max-h-[360px] max-w-full border border-[#ccc] bg-white p-1"
                  />
                </a>
            )}
            <time
              dateTime={post.created_at}
              title={formatFullTime(post.created_at)}
              className="mt-1 block text-[12px] text-[#777]"
            >
              {formatPostTime(post.created_at, now)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
