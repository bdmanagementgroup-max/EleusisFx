const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Eleusis FX",
  "description": "UK-based prop firm evaluation service. We trade your FTMO, The5ers, and FundedNext challenges on your behalf. 87% pass rate, 700+ funded traders since 2019.",
  "url": "https://eleusisfx.uk",
  "logo": "https://eleusisfx.uk/og-image.png",
  "image": "https://eleusisfx.uk/og-image.png",
  "foundingDate": "2019",
  "areaServed": "GB",
  "serviceType": "Prop Firm Evaluation Service",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  },
  "sameAs": [
    "https://www.instagram.com/eleusisfx"
  ],
  "priceRange": "££",
  "knowsAbout": [
    "FTMO Challenge",
    "Prop Firm Evaluation",
    "The5ers",
    "FundedNext",
    "Forex Trading",
    "Funded Trading Accounts"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is using a prop firm evaluation service against FTMO's terms of service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We advise all clients to review their chosen prop firm's terms independently. We provide a professional trading service. All clients are responsible for understanding the terms of their accounts."
      }
    },
    {
      "@type": "Question",
      "name": "Which prop firms do you work with?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We primarily work with FTMO and comparable firms including True Forex Funds and The5ers. Reach out with your specific firm and we'll confirm whether we can accommodate it."
      }
    },
    {
      "@type": "Question",
      "name": "How long does a prop firm evaluation take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most challenges are completed in under 30 days. FTMO allows up to 60 days — we work efficiently to get you funded as quickly as possible while maintaining full compliance."
      }
    },
    {
      "@type": "Question",
      "name": "When and how do I pay for the prop firm evaluation service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Payment is confirmed before we begin trading. Full payment details and methods are shared after your application is reviewed and approved."
      }
    },
    {
      "@type": "Question",
      "name": "What happens once I'm funded after passing the prop firm evaluation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Once the evaluation is passed, the funded account is entirely yours. You trade it yourself and receive 100% of payouts from the prop firm under their standard payout terms."
      }
    },
    {
      "@type": "Question",
      "name": "How do I get started with Eleusis FX?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fill out the application form on our website or DM us on Instagram @eleusisfx. We respond to all genuine enquiries within 24 hours and confirm availability shortly after."
      }
    }
  ]
};

export default function SchemaOrg() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
