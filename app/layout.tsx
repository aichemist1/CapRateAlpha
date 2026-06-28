import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapRateAlpha",
  description:
    "AI leasing and marketing software for retail landlords with broker-grade vacancy marketing."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
