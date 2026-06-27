import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ScrollProvider from "./components/ScrollProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kunalshill.com"),
  title: "Kunal Shill — Official Actor & Model Portfolio",
  description: "Explore the official portfolio of Kunal Shill: Indian television actor and model. Discover highlights from Geeta L.L.B., upcoming serial Ghurni, brand ads, and music videos.",
  keywords: ["Kunal Shill", "Kunal Shil", "Geeta LLB Swastik", "Ghurni Star Jalsha", "Bengali Actor", "Bengali Model"],
  openGraph: {
    title: "Kunal Shill — Official Actor Portfolio",
    description: "Official website of Bengali actor Kunal Shill. Discover his projects, gallery, awards, and showreel.",
    images: [{ url: "/01.jpg" }],
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0b0b0c] text-[#f5f5f7] flex flex-col font-sans selection:bg-gold/30 selection:text-white">
        <ScrollProvider>
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}

