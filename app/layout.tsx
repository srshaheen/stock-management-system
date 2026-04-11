import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Management System",
  description: "Advanced stock and sales tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 ml-64 bg-slate-50/30">
            <header className="h-16 border-b bg-white flex items-center px-8 justify-between sticky top-0 z-10">
              <h2 className="text-sm font-medium text-slate-500">
                Welcome back, Shahin!
              </h2>
              {/* Apni ekhane Search bar ba Notification icon add korte paren */}
            </header>

            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
