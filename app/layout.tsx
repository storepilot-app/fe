import type { Metadata } from "next";
import { AuthSessionProvider } from "@/components/features/auth/auth-session-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://storepilot-three.vercel.app"),
  title: "StorePilot | 쇼핑몰 카테고리·키워드 자동 추천",
  description:
    "상품 엑셀을 업로드하면 학습된 상품 데이터를 기반으로 적합한 마이카테고리와 검색 키워드를 자동으로 추천합니다.",
  openGraph: {
    title: "StorePilot",
    description:
      "상품 엑셀을 업로드하면 적합한 마이카테고리와 검색 키워드를 자동으로 추천합니다.",
    url: "/",
    siteName: "StorePilot",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
