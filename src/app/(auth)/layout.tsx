import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/user";
import { CardPreview } from "@/components/landing/card-preview";
import { StatusBarScrim } from "@/components/layout/status-bar-scrim";

const highlights = [
  "Importa tus mazos .apkg con multimedia y progreso",
  "SM-2 y FSRS, los mismos algoritmos de Anki",
  "Sincronizado entre móvil y escritorio",
];

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user) redirect("/decks");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <StatusBarScrim />
      <aside className="relative hidden overflow-hidden border-r bg-muted/50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--accent-soft),transparent_60%)]"
        />
        <Link href="/" className="relative flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
            <Layers className="size-4" />
          </span>
          Flashcards
        </Link>
        <div className="relative flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="max-w-md text-3xl font-semibold tracking-tight">Repasa como en Anki, desde donde quieras.</h2>
            <p className="max-w-md text-muted-foreground">Tu cuenta guarda mazos, historial y estadísticas para que continúes en cualquier dispositivo.</p>
          </div>
          <CardPreview className="max-w-sm" />
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground">Gratis, sin anuncios, sin tienda de aplicaciones.</p>
      </aside>

      <main className="flex flex-col px-5 pb-6 pt-[calc(1.5rem_+_var(--safe-top))] sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Inicio
          </Link>
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
              <Layers className="size-4" />
            </span>
            Flashcards
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
