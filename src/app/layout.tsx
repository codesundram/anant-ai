import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Inter_Tight } from "next/font/google";
import { BRAND, TAGLINE } from "@/lib/constants";
import "./globals.css";

const display = Inter_Tight({ subsets: ["latin"], weight: "600", variable: "--font-display" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: BRAND, template: `%s · ${BRAND}` },
  description: `${TAGLINE}. Five parts, a 30-word note and a quick quiz. Education only.`,
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E0D0C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${serif.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
