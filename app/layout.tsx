import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Captcha Testing",
  description: "Created for testing Captchas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Script
          strategy="beforeInteractive"
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}`}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
