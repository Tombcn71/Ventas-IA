import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentasIA - Copiloto de Ventas IA",
  description: "Encuentra clientes que aún no venden tu producto. IA convierte datos en oportunidades reales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased">
          {children}
      </body>
    </html>
  );
}

