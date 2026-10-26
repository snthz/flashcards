import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Brand } from "./brand";
import { Credits } from "./credits";

function FooterLinks({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <h3 className="font-medium">{title}</h3>
      <ul className="flex flex-col gap-2 text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="link-sweep transition-colors hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const l = (await getMessages()).landing;
  return (
    <footer className="relative overflow-hidden border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-10 pt-16 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-4 sm:col-span-2 lg:col-span-1">
            <Brand />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{l.footerTagline}</p>
            <LanguageSwitcher label={l.language} size="sm" />
          </div>
          <FooterLinks
            title={l.footerProduct}
            links={[
              { href: "#how", label: l.nav.how },
              { href: "#features", label: l.nav.features },
              { href: "#install", label: l.nav.install },
              { href: "#faq", label: l.nav.faq },
            ]}
          />
          <FooterLinks
            title={l.footerAccount}
            links={[
              { href: "/login", label: l.login },
              { href: "/register", label: l.signup },
            ]}
          />
        </div>
        <Credits />
        <div className="flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Flashcards</span>
          <span>{l.footerNote}</span>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="-mb-[0.2em] bg-linear-to-b from-foreground/10 to-transparent to-80% bg-clip-text text-center text-[clamp(4.5rem,17vw,15rem)] font-semibold leading-none tracking-[-0.06em] text-transparent">
          Flashcards
        </p>
      </div>
    </footer>
  );
}
