import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mac/GSA Summer Softball League",
  description:
    "League dashboard prototype featuring announcements, schedule, and admin controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
