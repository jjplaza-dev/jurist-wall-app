import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wall",
  description: "A 2008-style wall. Write something and share it.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
