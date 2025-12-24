import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DashLeads - Sales Intelligence Platform",
  description: "Intelligent lead generation and route planning for sales teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}

