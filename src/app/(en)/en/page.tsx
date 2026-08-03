import type { Metadata } from "next";
import { LangProvider } from "@/context/LangContext";
import { alternatesFor } from "@/lib/metadata";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { homeJsonLd, SITE_URL } from "@/lib/site";

const structuredData = homeJsonLd(`${SITE_URL}/en/`);

export const metadata: Metadata = {
  alternates: alternatesFor("/", "en"),
};

export default function EnHome() {
  return (
    <LangProvider lang="en">
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
