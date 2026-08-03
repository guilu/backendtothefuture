import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookiesPolicy from "@/components/CookiesPolicy";
import { LangProvider } from "@/context/LangContext";
import { alternatesFor } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — Backend to the Future",
  description:
    "How Backend to the Future uses cookies and Google Analytics, and how to withdraw your consent.",
  alternates: alternatesFor("/cookies/", "en"),
  robots: { index: true, follow: true },
};

export default function EnCookiesPage() {
  return (
    <LangProvider lang="en">
      <Header />
      <CookiesPolicy />
      <Footer />
    </LangProvider>
  );
}
