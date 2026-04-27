import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ColorGenius — AI-Powered Hair Color Formulation for Professional Stylists",
  description:
    "Snap a photo. Get a precise color formula. ColorGenius digitizes 100+ years of color science into an AI engine that works across 10+ professional color lines. Save time, eliminate guesswork, wow every client.",
  keywords: [
    "hair color formulation",
    "AI color matching",
    "professional stylist tools",
    "salon software",
    "color genius",
    "Redken",
    "Wella",
    "Schwarzkopf",
  ],
  openGraph: {
    title: "ColorGenius — AI Hair Color Formulation",
    description:
      "Professional color formulation powered by AI. Snap a photo, get a precise formula across 10+ brands.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}