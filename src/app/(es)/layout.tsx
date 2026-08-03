import type { Metadata } from "next";
import "../globals.css";
import RootShell from "@/components/RootShell";
import { rootMetadata } from "@/lib/metadata";

export const metadata: Metadata = rootMetadata("es");

/**
 * Root layout for the Spanish site, which lives at the bare paths.
 *
 * <p>Two root layouts exist because `<html lang>` is per document and the two
 * locales are two documents. A single shared layout could only ever declare one
 * language for both.
 */
export default function EsRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="es">{children}</RootShell>;
}
