import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Demand Forecast",
  description: "Supply Chain Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50/50 dark:bg-slate-950`}>
        <Navbar />
        <main className="container mx-auto max-w-[1600px] p-6 space-y-8">
          {children}
        </main>
      </body>
    </html>
  );
}
