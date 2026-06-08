import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "McMaster GSA Softball League",
  description:
    "League dashboard prototype featuring announcements, schedule, and admin controls.",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  icons: {
    icon: "/msl-logo.png",
    shortcut: "/msl-logo.png",
    apple: "/msl-logo.png",
  },
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
