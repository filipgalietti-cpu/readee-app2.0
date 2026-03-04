export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Readee",
    url: "https://learn.readee.app",
    description:
      "Readee helps children in K through 4th grade build reading comprehension skills with standards-aligned practice and the Science of Reading.",
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
