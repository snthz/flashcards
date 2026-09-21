import { requireUser } from "@/lib/auth/user";
import { BottomNav, TopNav } from "@/components/layout/nav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav name={user.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-12 md:pt-8">{children}</main>
      <BottomNav />
    </div>
  );
}
