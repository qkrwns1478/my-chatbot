import "./globals.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ConfirmProvider } from "@/context/ConfirmContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const pyeojinGothic = localFont({
  src: "../public/fonts/PyeojinGothic-Regular.ttf",
  variable: "--font-pyeojin-gothic",
});

export const metadata = {
  title: "Neon Character Chat",
  description: "Character chatbot using Gemini via OpenRouter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${pyeojinGothic.variable} font-sans bg-page-bg text-text-primary antialiased`}
      >
        <ConfirmProvider>{children}</ConfirmProvider>
      </body>
    </html>
  );
}
