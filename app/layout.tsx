import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "GameVault - 精品游戏分享平台",
  description: "分享最新、最热的单机游戏资源，支持多种网盘下载方式",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Noto+Sans+SC:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#FAFAF9' }}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
