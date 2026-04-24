import type { Metadata } from "next";
import { Syne, Epilogue } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/layout/CustomCursor";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-epilogue",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eleusis FX — Prop Firm Specialists",
  description:
    "Skip the failed attempts. Our expert traders handle your entire prop firm evaluation — you receive a funded $100,000 account. Proven. Professional. Guaranteed.",
  openGraph: {
    title: "Eleusis FX — Prop Firm Specialists",
    description:
      "Skip the failed attempts. Our expert traders handle your entire prop firm evaluation — you receive a funded $100,000 account.",
    url: "https://eleusisfx.uk",
    siteName: "Eleusis FX",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eleusis FX — Prop Firm Specialists",
    description: "Get your FTMO challenge passed by our expert traders.",
  },
  metadataBase: new URL("https://eleusisfx.uk"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${epilogue.variable}`}>
      <body>
        <CustomCursor />
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
