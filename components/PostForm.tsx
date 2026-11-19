"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { MAX_LENGTH } from "@/lib/config";

type Props = {
  onShare: (body: string) => Promise<void>;
};

export default function PostForm({ onShare }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = text.trim();
  const remaining = MAX_LENGTH - text.length;
  const canShare = trimmed.length > 0 && remaining >= 0 && !sending;

  async function share() {
    if (!canShare) return;
    setSending(true);
    setError(null);
    try {
      await onShare(trimmed);
      setText("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void share();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void share();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#d8dfea] bg-[#eceff5] p-3"
    >
      <label htmlFor="post-body" className="mb-1 block font-bold text-[#333]">
        Write something…
      </label>
      <textarea
        id="post-body"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={MAX_LENGTH}
        rows={3}
        disabled={sending}
        aria-describedby="post-counter"
        className="block w-full resize-y border border-[#bdc7d8] bg-white p-2 text-[13px] focus:border-[#3b5998] disabled:bg-[#f2f2f2]"
      />

      {error && (
        <p
          role="alert"
          className="mt-2 border border-[#dd3c10] bg-[#ffebe8] px-2 py-1 text-[#333]"
        >
          Your post wasn’t shared. {error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span
          id="post-counter"
          className={remaining <= 20 ? "text-[#dd3c10]" : "text-[#777]"}
        >
          {remaining} characters left
        </span>
        <button
          type="submit"
          disabled={!canShare}
          className="cursor-pointer border border-[#29447e] bg-[#5b74a8] px-4 py-1 text-[13px] font-bold text-white shadow-[inset_0_1px_0_#8a9cc2] hover:bg-[#4f6aa3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sharing…" : "Share"}
        </button>
      </div>
    </form>
  );
}
