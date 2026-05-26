import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { RootWrapper } from "@/components/layout/RootWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kardexia | Del caos al kárdex en 3 segundos",
  description: "Plataforma inteligente de gestión escolar y administración docente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-50 overflow-hidden`}>
        <AuthProvider>
          <AppProvider>
            <RootWrapper>{children}</RootWrapper>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
