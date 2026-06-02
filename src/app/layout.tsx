import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DAILY SECR POSITION - Railway Telecom Operations Dashboard",
  description: "South East Central Railway Telecom Operations and Circuit Monitoring Console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#F8FAFC] antialiased">
        {children}
      </body>
    </html>
  );
}
