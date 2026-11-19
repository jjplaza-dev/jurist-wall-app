"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  MAX_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHOTO_BYTES,
} from "@/lib/config";

type Props = {
  onShare: (body: string, authorName: string, photo: File | null) => Promise<void>;
};

const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function PostForm({ onShare }: Props) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Preview URL lifecycle
  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const trimmed = text.trim();
  const remaining = MAX_LENGTH - text.length;
  const canShare =
      (trimmed.length > 0 || photo !== null) && remaining >= 0 && !sending;

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("Please choose a JPG, PNG, GIF or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("That photo is over 5 MB. Please choose a smaller one.");
      return;
    }
    setPhoto(file);
  }

  function clearPhoto() {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function share() {
    if (!canShare) return;
    setSending(true);
    setError(null);
    try {
      await onShare(trimmed, name.trim(), photo);
      setText("");
      clearPhoto();
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
        <label htmlFor="post-name" className="mb-1 block font-bold text-[#333]">
          Your name
        </label>
        <input
            id="post-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Wall Visitor"
            disabled={sending}
            className="mb-2 block w-full border border-[#bdc7d8] bg-white p-1 text-[13px] focus:border-[#3b5998] disabled:bg-[#f2f2f2]"
        />

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

        {preview && (
            <div className="mt-2 flex items-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                  src={preview}
                  alt="Selected photo preview"
                  className="max-h-[120px] border border-[#ccc] bg-white p-1"
              />
              <button
                  type="button"
                  onClick={clearPhoto}
                  disabled={sending}
                  className="cursor-pointer text-[#3b5998] underline"
              >
                Remove
              </button>
            </div>
        )}

        {error && (
            <p
                role="alert"
                className="mt-2 border border-[#dd3c10] bg-[#ffebe8] px-2 py-1 text-[#333]"
            >
              Your post wasn’t shared. {error}
            </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <input
                ref={fileRef}
                id="post-photo"
                type="file"
                accept={ALLOWED.join(",")}
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={sending}
                className="sr-only"
            />
            <label
                htmlFor="post-photo"
                className="cursor-pointer text-[#3b5998] underline"
            >
              📷 Add photo
            </label>
            <span
                id="post-counter"
                className={remaining <= 20 ? "text-[#dd3c10]" : "text-[#777]"}
            >
            {remaining} characters left
          </span>
          </div>
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