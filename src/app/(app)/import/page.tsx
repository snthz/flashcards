import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ImportForm } from "@/components/import/import-form";

export const metadata: Metadata = { title: "Importar" };

export default function ImportPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="Importar desde Anki"
        description="Sube un archivo .apkg. Se conservan mazos, tipos de nota, multimedia y el progreso de cada tarjeta."
        backHref="/decks"
      />
      <ImportForm />
      <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Cómo exportar desde Anki</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>En Anki, haz clic en el engranaje del mazo y elige “Exportar”.</li>
          <li>Selecciona el formato “Paquete de mazo de Anki (*.apkg)”.</li>
          <li>Activa “Incluir información de programación” para conservar tu progreso y “Incluir multimedia”.</li>
        </ol>
      </div>
    </div>
  );
}
