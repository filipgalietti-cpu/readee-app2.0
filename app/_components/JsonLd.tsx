export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Readee",
    url: "https://learn.readee.app",
    description:
      "Fun, science-backed reading for K–4th grade.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      suggestedMinAge: 5,
      suggestedMaxAge: 10,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
