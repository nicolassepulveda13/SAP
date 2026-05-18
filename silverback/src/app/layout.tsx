import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SilverBack — El Camino del Gorila",
  description: "Plataforma de fitness gamificado. Entrená. Evolucioná. Dominá.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.variable} ${barlowCondensed.variable} h-full antialiased bg-[#181818] text-white`}>
        {children}
      </body>
    </html>
  );
}
