import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import "@/lib/amplify";  // Commented out for mock development
import { MockAuthProvider } from "@/components/auth/MockAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career.fm - 音声名刺プラットフォーム",
  description: "他己紹介風の音声名刺を生成・共有できるWebサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </body>
    </html>
  );
}
