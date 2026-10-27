import { requireUser } from "@/lib/auth/user";
import { BottomNav, TopNav } from "@/components/layout/nav";
import { StatusBarScrim } from "@/components/layout/status-bar-scrim";
import { OfflineSync } from "@/components/offline/offline-sync";
import { AssistantBubble } from "@/components/assistant/assistant-bubble";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <StatusBarScrim className="md:hidden" />
      <TopNav name={user.name} email={user.email} avatar={user.avatar} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-[calc(var(--dock-offset)+6rem)] pt-[calc(1rem_+_var(--safe-top))] md:px-6 md:pb-12 md:pt-8">{children}</main>
      <BottomNav />
      <AssistantBubble />
      <OfflineSync userId={user.id} />
    </div>
  );
}
