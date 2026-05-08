"use client";

import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Hide on admin and dashboard pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER;
  if (!waNumber) return null;

  const waLink = `https://wa.me/${waNumber}?text=Hi%20Eleusis%20FX%20%E2%80%94%20I%27m%20interested%20in%20getting%20funded`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Contact us on WhatsApp"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-2.182 0-4.315.674-6.059 1.944L5.02 3.92 6.98 9.109c-1.336 1.925-2.041 4.153-2.041 6.48 0 6.627 5.373 12 12 12 2.641 0 5.122-.897 7.15-2.369l5.246 1.745-6.254-5.365c1.52-2.032 2.404-4.536 2.404-7.011 0-6.627-5.373-12-12-12" />
      </svg>
    </a>
  );
}
