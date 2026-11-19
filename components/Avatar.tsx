// The grey silhouette every profile started with.
export default function Avatar({ size = 50 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      aria-hidden="true"
      className="shrink-0 border border-[#ccc] bg-[#eceff5]"
    >
      <circle cx="25" cy="19" r="9" fill="#b4bfd6" />
      <path d="M6 50c0-12 8-19 19-19s19 7 19 19z" fill="#b4bfd6" />
    </svg>
  );
}
