import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ImportForm } from "@/components/import/import-form";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.importer.title };
}

export default async function ImportPage() {
  const t = await getMessages();
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={t.importer.heading} description={t.importer.description} backHref="/decks" />
      <ImportForm />
      <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{t.importer.howTo}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {t.importer.howToSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
