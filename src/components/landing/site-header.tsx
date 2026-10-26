import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import { buttonStyles } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Brand } from "./brand";

export async function SiteHeader() {
  const l = (await getMessages()).landing;
  const sections = [
    { href: "#how", label: l.nav.how },
    { href: "#features", label: l.nav.features },
    { href: "#install", label: l.nav.install },
    { href: "#faq", label: l.nav.faq },
  ];
  return (
    <header className="landing-header safe-top sticky top-0 z-30">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Brand />
        <nav aria-label={l.nav.label} className="hidden items-center gap-1 lg:flex">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="mr-1 hidden sm:block">
            <LanguageSwitcher label={l.language} size="sm" />
          </div>
          <Link href="/login" className={buttonStyles("ghost", "sm", "whitespace-nowrap")}>
            {l.login}
          </Link>
          <Link href="/register" className={buttonStyles("primary", "sm", "whitespace-nowrap")}>
            {l.signup}
          </Link>
        </div>
      </div>
    </header>
  );
}
