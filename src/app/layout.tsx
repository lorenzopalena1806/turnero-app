import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turnero Multi-Tenant",
  description: "Sistema de reservas y turnos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
