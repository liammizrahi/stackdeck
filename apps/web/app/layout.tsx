import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const amazonEmber = localFont({
  src: [
    { path: "./fonts/amazon-ember/AmazonEmber-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-amazon-ember",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StackDeck",
  description: "Local AWS console for LocalStack/MiniStack",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={amazonEmber.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
