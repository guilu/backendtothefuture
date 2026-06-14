import { LangProvider } from "@/context/LangContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

const BASE = "https://backendtothefuture.com";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Diego Barrio",
      url: "https://diegobarrioh.dev",
      jobTitle: "Senior Backend Engineer",
      description:
        "Senior Backend Engineer crafting scalable platforms with Java & Spring.",
      address: { "@type": "PostalAddress", addressLocality: "Alicante", addressCountry: "ES" },
      sameAs: ["https://github.com/guilu", "https://www.linkedin.com/in/diegobarrioh"],
    },
    {
      "@type": "WebSite",
      name: "Backend to the Future",
      url: BASE,
      author: { "@type": "Person", name: "Diego Barrio" },
      inLanguage: ["es", "en"],
    },
  ],
};

export default function Home() {
  return (
    <LangProvider>
      <JsonLd data={structuredData} />
      <Header />
      <main>
        <Hero />
        <Projects />
        <TechStack />
        <Contact />
      </main>
      <Footer />
    </LangProvider>
  );
}
