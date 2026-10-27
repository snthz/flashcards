import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, Check, X } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { findTopic, neighbors } from "@/lib/grammar";
import { InlineMarkdown, RichText } from "@/components/grammar/rich-text";
import { DoneToggle, GrammarQuiz, ListenButton } from "@/components/grammar/topic-parts";

export async function generateMetadata({ params }: PageProps<"/grammar/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const topic = findTopic(slug);
  return { title: topic ? `${topic.title} · ${topic.level}` : (await getMessages()).grammar.title };
}

function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-lg font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export default async function GrammarTopicPage({ params }: PageProps<"/grammar/[slug]">) {
  const [, t, { slug }] = await Promise.all([requireUser(), getMessages(), params]);
  const topic = findTopic(slug);
  if (!topic) notFound();
  const g = t.grammar;
  const { previous, next } = neighbors(topic.slug);
  const toc = [
    ...topic.sections.map((section, index) => ({ id: `section-${index + 1}`, label: section.heading })),
    ...(topic.tables.length > 0 ? [{ id: "forms", label: g.forms }] : []),
    { id: "examples", label: g.examples },
    ...(topic.mistakes.length > 0 ? [{ id: "mistakes", label: g.mistakes }] : []),
    { id: "quiz", label: g.quiz },
  ];

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="flex min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Link href={`/grammar?level=${topic.level}`} className="-ml-1 inline-flex w-fit items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" />
            {g.back}
          </Link>
          <span className="w-fit rounded-md bg-foreground px-2 py-0.5 text-xs font-semibold text-background">
            {topic.level} · {g.levels[topic.level]}
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{topic.title}</h1>
            <p className="text-sm font-medium text-muted-foreground" lang="en">
              {topic.english}
            </p>
          </div>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{topic.summary}</p>
          <div>
            <DoneToggle slug={topic.slug} />
          </div>
        </header>

        {topic.sections.map((section, index) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <Heading id={`section-${index + 1}`}>{section.heading}</Heading>
            <RichText text={section.body} />
          </section>
        ))}

        {topic.tables.length > 0 ? (
          <section className="flex flex-col gap-4">
            <Heading id="forms">{g.forms}</Heading>
            {topic.tables.map((table, index) => (
              <figure key={index} className="flex flex-col gap-2">
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full min-w-max text-sm">
                    <thead className="bg-muted/60 text-left text-xs font-semibold text-muted-foreground">
                      <tr>
                        {table.columns.map((column) => (
                          <th key={column} className="px-3.5 py-2.5 font-semibold">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className={cellIndex === 0 ? "px-3.5 py-2.5 font-medium" : "px-3.5 py-2.5 text-muted-foreground"} lang={cellIndex === 0 ? undefined : "en"}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {table.caption ? <figcaption className="text-xs text-muted-foreground">{table.caption}</figcaption> : null}
              </figure>
            ))}
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <Heading id="examples">{g.examples}</Heading>
          <ul className="flex flex-col divide-y rounded-xl border bg-card">
            {topic.examples.map(([english, spanish]) => (
              <li key={english} className="flex items-start gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-[15px] font-medium" lang="en">
                    {english}
                  </p>
                  <p className="text-sm text-muted-foreground">{spanish}</p>
                </div>
                <ListenButton text={english} />
              </li>
            ))}
          </ul>
        </section>

        {topic.mistakes.length > 0 ? (
          <section className="flex flex-col gap-3">
            <Heading id="mistakes">{g.mistakes}</Heading>
            <ul className="grid gap-3 sm:grid-cols-2">
              {topic.mistakes.map(([wrong, right, why]) => (
                <li key={wrong} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                  <p className="flex items-start gap-2 text-sm text-danger" lang="en">
                    <X className="mt-0.5 size-4 shrink-0" />
                    <span className="line-through decoration-danger/50">{wrong}</span>
                  </p>
                  <p className="flex items-start gap-2 text-sm font-medium text-success" lang="en">
                    <Check className="mt-0.5 size-4 shrink-0" />
                    <span>{right}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <InlineMarkdown text={why} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <Heading id="quiz">{g.quiz}</Heading>
          <GrammarQuiz slug={topic.slug} questions={topic.quiz} />
        </section>

        <nav className="grid gap-3 border-t pt-6 sm:grid-cols-2">
          {previous ? (
            <Link href={`/grammar/${previous.slug}`} className="group flex flex-col gap-1 rounded-xl border px-4 py-3 transition-colors hover:border-foreground/30">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                {g.previous} · {previous.level}
              </span>
              <span className="font-medium">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/grammar/${next.slug}`} className="group flex flex-col items-end gap-1 rounded-xl border px-4 py-3 text-right transition-colors hover:border-foreground/30">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {g.next} · {next.level}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="font-medium">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </article>

      <aside className="hidden lg:block">
        <nav aria-label={g.onThisPage} className="sticky top-24 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.onThisPage}</p>
          <ul className="flex flex-col gap-1 border-l">
            {toc.map((entry) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                  {entry.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
