import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookiesPolicy from "@/components/CookiesPolicy";
import { LangProvider } from "@/context/LangContext";
import type { Metadata } from "next";
import { alternatesFor } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Cookie Policy — Backend to the Future",
  description:
    "How Backend to the Future uses cookies and Google Analytics, and how to withdraw your consent.",
  alternates: alternatesFor("/cookies/", "es"),
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LangProvider lang="es">
      <Header />
      <CookiesPolicy />
      <Footer />
    </LangProvider>
  );
}
