import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poker Equity Calculator",
  description: "Fast and accurate poker hand equity calculator for Texas Hold'em, Omaha, and Super Hold'em. Calculate win percentages for multiple players on mobile or desktop.",
  keywords: ["poker", "equity", "calculator", "texas holdem", "omaha", "super holdem", "odds calculator", "poker odds"],
  authors: [
    { name: "Swit", url: "https://twitter.com/nomorebear" },
    { name: "Paul", url: "https://twitter.com/PNattapatsiri" }
  ],
  creator: "Orge Labs",
  publisher: "Orge Labs",
  metadataBase: new URL("https://poker-calculator.orge.xyz"),
  openGraph: {
    type: "website",
    title: "Poker Equity Calculator",
    description: "Fast and accurate poker hand equity calculator for Texas Hold'em, Omaha, and Super Hold'em. Calculate win percentages for multiple players instantly.",
    siteName: "Poker Equity Calculator",
    images: [
      {
        url: "/globe.svg",
        width: 100,
        height: 100,
        alt: "Poker Equity Calculator"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Poker Equity Calculator",
    description: "Calculate poker hand equity with this fast, mobile-friendly calculator. Support for Texas Hold'em, Omaha, and Super Hold'em.",
    creator: "@nomorebear",
    images: ["/globe.svg"]
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    title: "Poker Equity Calculator",
    statusBarStyle: "default"
  },
  applicationName: "Poker Equity Calculator",
  category: "Tool",
  icons: {
    icon: [
      { url: "/globe.svg" }
    ],
    apple: [
      { url: "/globe.svg" }
    ]
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/globe.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
