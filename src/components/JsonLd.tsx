/**
 * Renders a JSON-LD structured-data block. Search engines read this to
 * understand who/what the page is about (rich results, knowledge panel).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
