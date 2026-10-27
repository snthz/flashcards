import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { GRAMMAR_TOPICS, isGrammarLevel } from "@/lib/grammar";
import { PageHeader } from "@/components/layout/page-header";
import { GrammarIndex } from "@/components/grammar/grammar-index";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.grammar.title };
}

export default async function GrammarPage({ searchParams }: PageProps<"/grammar">) {
  const [, t, params] = await Promise.all([requireUser(), getMessages(), searchParams]);
  const topics = GRAMMAR_TOPICS.map(({ slug, level, title, english, summary }) => ({ slug, level, title, english, summary }));
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <PageHeader
        title={t.grammar.title}
        description={
          <>
            {t.grammar.description}
            {t.grammar.spanishNote ? <span className="block text-xs">{t.grammar.spanishNote}</span> : null}
          </>
        }
      />
      <GrammarIndex topics={topics} initialLevel={isGrammarLevel(params.level) ? params.level : null} />
    </div>
  );
}
