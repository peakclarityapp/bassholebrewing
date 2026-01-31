import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bass Hole Brewing | Riverside, IL",
  description: "Basement brews with attitude. See what's on tap at Bass Hole Brewing.",
  keywords: ["homebrew", "craft beer", "IPA", "Riverside IL"],
  openGraph: {
    title: "Bass Hole Brewing",
    description: "Basement brews with attitude",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
