import type { Metadata } from "next";
import { Syne, Epilogue } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/layout/CustomCursor";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import RevealInit from "@/components/layout/RevealInit";

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
  title: "Prop Firm Evaluation Service UK — Eleusis FX",
  description:
    "We trade your prop firm evaluation on your behalf. 87% pass rate across FTMO, The5ers, FundedNext & more. UK-based. Guaranteed results or we re-trade it.",
  verification: {
    google: "jDgtfjHtql7jiX7IburnuH4C5tzsL3ixjSJNMD3FHYo",
  },
  openGraph: {
    title: "Prop Firm Evaluation Service UK — Eleusis FX",
    description:
      "We trade your prop firm evaluation on your behalf. 87% pass rate across FTMO, The5ers, FundedNext & more. UK-based.",
    url: "https://eleusisfx.uk",
    siteName: "Eleusis FX",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eleusis FX — Prop Firm Evaluation Service UK. We Pass Your Prop Challenge. 87% Pass Rate, 700+ Funded Traders.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prop Firm Evaluation Service UK — Eleusis FX",
    description: "87% pass rate. We trade your FTMO & prop firm evaluation — you get the funded account.",
    images: ["/og-image.png"],
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
        <RevealInit />
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
