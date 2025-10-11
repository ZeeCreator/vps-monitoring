import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VPS Monitoring System",
  description: "Monitor your VPS resources in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">VPS Monitor</Link>
            <div className="flex space-x-4">
              <Link href="/" className="hover:text-gray-300">Home</Link>
              <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              <Link href="/login" className="hover:text-gray-300">Login</Link>
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
