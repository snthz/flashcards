import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart3, Brain, Layers, MonitorSmartphone, Smartphone, Upload } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/user";
import { buttonStyles } from "@/components/ui/button";
import { CardPreview } from "@/components/landing/card-preview";

export const metadata: Metadata = {
  title: "Flashcards · Repaso espaciado compatible con Anki",
  description: "Importa tus mazos de Anki, estudia con SM-2 o FSRS y sincroniza tu progreso entre iPhone, Android y escritorio. Gratis y sin instalar nada.",
};

const features = [
  {
    icon: Upload,
    title: "Importa tus mazos .apkg",
    description: "Trae tus mazos desde Anki con plantillas, multimedia y el progreso de cada tarjeta intacto.",
  },
  {
    icon: Brain,
    title: "El mismo algoritmo",
    description: "SM-2 clásico de Anki o FSRS, configurables por mazo con los mismos parámetros que ya conoces.",
  },
  {
    icon: MonitorSmartphone,
    title: "Progreso sincronizado",
    description: "Empieza en el ordenador y continúa en el móvil. Tu cuenta guarda mazos, repasos y estadísticas.",
  },
  {
    icon: Smartphone,
    title: "Instalable en iOS y Android",
    description: "Es una PWA: añádela a la pantalla de inicio y úsala a pantalla completa, sin tienda ni pagos.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas claras",
    description: "Repasos por día, previsión, retención, racha y mapa de actividad para ver cómo avanzas.",
  },
  {
    icon: Layers,
    title: "Mazos, notas y etiquetas",
    description: "Submazos, tipos de nota con cloze, explorador con búsqueda y acciones masivas.",
  },
];

const steps = [
  { number: "1", title: "Crea tu cuenta", description: "Solo necesitas un correo y una contraseña." },
  { number: "2", title: "Importa o crea mazos", description: "Sube tus .apkg de Anki o añade notas desde cero." },
  { number: "3", title: "Repasa cada día", description: "Cuatro botones, intervalos previstos y deshacer, como en Anki." },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/decks");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
              <Layers className="size-4" />
            </span>
            Flashcards
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonStyles("ghost", "sm")}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={buttonStyles("primary", "sm")}>
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              Compatible con Anki · Gratis en iOS
            </span>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Tus mazos de Anki, en cualquier dispositivo.
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Importa tus .apkg, estudia con el mismo repaso espaciado y sigue tu progreso desde el móvil o el ordenador, sin
              perder nada por el camino.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={buttonStyles("primary", "lg")}>
                Empezar gratis
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className={buttonStyles("outline", "lg")}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          <CardPreview className="mx-auto" />
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 md:px-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Todo lo que esperas de Anki</h2>
              <p className="max-w-xl text-muted-foreground">Sin instalar programas ni pagar la app de iPhone.</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 md:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {step.number}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-col items-start gap-4 rounded-2xl border bg-card p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">Listo para retomar tus repasos</p>
              <p className="text-sm text-muted-foreground">Crea tu cuenta e importa tu primer mazo en menos de un minuto.</p>
            </div>
            <Link href="/register" className={buttonStyles("primary", "lg")}>
              Crear cuenta
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <span>Flashcards · repaso espaciado compatible con Anki</span>
          <span>Anki es una marca de sus respectivos autores. Este proyecto no está afiliado.</span>
        </div>
      </footer>
    </div>
  );
}
