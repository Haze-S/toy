import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: {
    default: "AION2 META — 아이온2 메타 분석",
    template: "%s | AION2 META",
  },
  description:
    "아이온2 한국 서버 랭킹 기반 직업별 메타 분석, 길드 점유율, Top 100 랭커 정보",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        {/* 상단 네비게이션 */}
        <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-black text-white">
                A2
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                AION2 META
              </span>
            </Link>
            <div className="flex gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
              >
                메타 분석
              </Link>
              <Link
                href="/rankings"
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
              >
                랭킹
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

        {/* 푸터 */}
        <footer className="border-t border-zinc-800/60 mt-16">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-zinc-600">
            AION2 META는 NC 공식 서비스가 아닙니다. 게임 데이터의 저작권은
            NCSOFT에 있습니다.
          </div>
        </footer>
      </body>
    </html>
  );
}
