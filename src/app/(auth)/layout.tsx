import { redirect } from "next/navigation";
import { Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/user";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user) redirect("/decks");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-2 text-foreground">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Layers className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Flashcards</span>
      </div>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm animate-in">{children}</div>
    </main>
  );
}
