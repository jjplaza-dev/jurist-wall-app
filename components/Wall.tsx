"use client";

import { useCallback, useEffect, useState } from "react";
import Avatar from "./Avatar";
import PostFeed from "./PostFeed";
import PostForm from "./PostForm";
import { FEED_LIMIT } from "@/lib/config";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";

type LiveStatus = "connecting" | "live" | "offline";

const MISSING_KEYS =
  "This wall isn’t connected to Supabase yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart.";

// Combine lists without duplicates, newest first, capped at the feed limit.
function mergePosts(...lists: Post[][]): Post[] {
  const byId = new Map<string, Post>();
  for (const list of lists) for (const p of list) byId.set(p.id, p);
  return [...byId.values()]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, FEED_LIMIT);
}

const STATUS_LABEL: Record<LiveStatus, string> = {
  connecting: "Connecting…",
  live: "Live",
  offline: "Offline",
};

const STATUS_COLOR: Record<LiveStatus, string> = {
  connecting: "bg-[#f0ad00]",
  live: "bg-[#6cc04a]",
  offline: "bg-[#dd3c10]",
};

export default function Wall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [live, setLive] = useState<LiveStatus>("connecting");
  const [now, setNow] = useState<number>(0);

  // Add one post (from our own insert or from Realtime) if we don't have it yet.
  const addPost = useCallback((post: Post) => {
    setFreshIds((ids) => new Set(ids).add(post.id));
    setPosts((prev) =>
      prev.some((p) => p.id === post.id) ? prev : mergePosts([post], prev),
    );
  }, []);

  const loadPosts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadError(MISSING_KEYS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(FEED_LIMIT);
    if (error) {
      setLoadError(error.message);
    } else {
      setPosts((prev) => mergePosts(data as Post[], prev));
    }
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  // Realtime: new rows appear without a refresh
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLive("offline");
      return;
    }

    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);

    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => addPost(payload.new as Post),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLive("live");
        else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          setLive("offline");
        else setLive("connecting");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [addPost]);

  // Keep "3 minutes ago" labels fresh
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  async function handleShare(body: string) {
    if (!isSupabaseConfigured) throw new Error(MISSING_KEYS);
    const { data, error } = await supabase
      .from("posts")
      .insert({ body })
      .select()
      .single();
    if (error) throw new Error(error.message);
    addPost(data as Post);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#133783] bg-[#3b5998]">
        <div className="mx-auto flex h-[42px] max-w-[760px] items-center justify-between px-3">
          <span className="text-[22px] font-bold tracking-tight text-white lowercase">
            wall
          </span>
          <span
            className="flex items-center gap-2 text-[12px] text-white"
            role="status"
          >
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${STATUS_COLOR[live]}`}
            />
            {STATUS_LABEL[live]}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[760px] gap-4 px-3 py-4 md:grid-cols-[170px_1fr]">
        <aside className="hidden md:block">
          <Avatar size={170} />
          <p className="mt-2 text-[15px] font-bold text-[#3b5998]">The Wall</p>
          <p className="mt-1 text-[#777]">
            Anyone can write here. New posts show up for everyone right away.
          </p>
          <div className="mt-3 border-l-4 border-[#3b5998] bg-[#eceff5] px-2 py-1 font-bold text-[#3b5998]">
            Wall
          </div>
        </aside>

        <section className="min-w-0">
          <h1 className="mb-3 border-b-2 border-[#3b5998] pb-1 text-[15px] font-bold text-[#333]">
            Wall
          </h1>
          <PostForm onShare={handleShare} />
          <div className="mt-4">
            <PostFeed
              posts={posts}
              freshIds={freshIds}
              now={now}
              loading={loading}
              error={loadError}
              onRetry={() => void loadPosts()}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
