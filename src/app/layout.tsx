import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Satyam Creations Jaipur | Premium Kurti Catalog",
  description: "Explore the luxury collection of handcrafted designer Kurtis. View our exclusive ethnic wear catalogue designed with precision and elegance.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Satyam Creations Jaipur | Premium Kurti Catalog",
    description: "Explore the luxury collection of handcrafted designer Kurtis. View our exclusive ethnic wear catalogue designed with precision and elegance.",
    type: "website",
    locale: "en_US",
    siteName: "Satyam Creations Jaipur",
  },
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased selection:bg-gold/30 selection:text-maroon">
        {children}
      </body>
    </html>
  );
}
