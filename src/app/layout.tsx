import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "@/styles/globals.css";

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  display: 'swap',
});

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  variable: "--font-dm-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Forge - Build Better Habits",
  description: "A mobile-first habit-building app based on Atomic Habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="font-sans min-h-screen bg-white text-gray-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
