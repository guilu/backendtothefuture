import { LangProvider } from "@/context/LangContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <LangProvider>
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
