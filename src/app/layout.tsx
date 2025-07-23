import type { Metadata } from "next";
import { Staatliches, Open_Sans } from "next/font/google";
import "./globals.css";

const staatliches = Staatliches({
  variable: "--font-staatliches",
  subsets: ["latin"],
  weight: "400",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "High Voltage Classifieds - Buy & Sell Surplus High Voltage Equipment",
  description: "A trusted platform for contractors, utilities, and solar providers to buy and sell surplus high voltage equipment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${staatliches.variable} ${openSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
