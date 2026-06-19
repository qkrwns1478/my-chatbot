import "./globals.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistMono = localFont({
  src: "../public/fonts/GeistMono-Regular.ttf",
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Neon Character Chat",
  description: "Character chatbot using Gemini via OpenRouter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${geistMono.variable} font-sans bg-page-bg text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  );
}
