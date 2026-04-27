import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkMai",
  description: "律师 AI 工作平台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
