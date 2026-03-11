import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign in — Magnova",
  description: "Sign in to your Magnova account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
