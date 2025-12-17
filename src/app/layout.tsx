import "./globals.css";
import React from "react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Contractor Edge (MVP)",
  description: "Estimate + BOM + profitability for contractors"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-zinc-50 text-zinc-900")}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
