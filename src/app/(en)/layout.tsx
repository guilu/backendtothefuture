import type { Metadata } from "next";
import "../globals.css";
import RootShell from "@/components/RootShell";
import { rootMetadata } from "@/lib/metadata";

export const metadata: Metadata = rootMetadata("en");

/** Root layout for the English site, served under `/en`. */
export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
