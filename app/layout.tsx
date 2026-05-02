import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        {/* এখানে কোনো সাইডবার থাকবে না, শুধু চিলড্রেন রেন্ডার হবে */}
        {children}
      </body>
    </html>
  );
}
