import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <WifiOff className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Sin conexión</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Necesitas conexión para sincronizar tu progreso. Cuando vuelvas a estar en línea, recarga la página.
      </p>
    </main>
  );
}
