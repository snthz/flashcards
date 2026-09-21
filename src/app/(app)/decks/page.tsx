import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Mazos" };

export default function DecksPage() {
  return <PageHeader title="Mazos" />;
}
