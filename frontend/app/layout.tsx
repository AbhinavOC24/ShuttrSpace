import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import Link from "next/link";

const neueMontreal = localFont({
  src: [
    {
      path: "./fonts/NeueuMontreal/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NeueuMontreal/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

const helveticaNeue = localFont({
  src: [
    {
      path: "./fonts/HelveticaNeue/HelveticaNeue-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/HelveticaNeue/HelveticaNeue-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-helvetica",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShuttrSpace",
  description: "Your photography portfolio",
};

import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${neueMontreal.variable} 
          ${helveticaNeue.variable} 
          antialiased
          bg-black text-white
        `}
      >
        <AuthProvider>
          <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

function Navbar() {
  return (
    <nav className="bg-black border-b border-white/8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-xl font-bold text-white">
            ShuttrSpace
          </Link>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-200"
            >
              Home
            </Link>
            <Link
              href="/u"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-200"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
