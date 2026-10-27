import { Fragment } from "react";
import { parseInline, parseMarkdown, type Inline } from "@/lib/assistant/markdown";
import { cn } from "@/lib/utils";

function InlineText({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "bold") return <strong key={index} className="font-semibold text-foreground">{part.text}</strong>;
        if (part.type === "italic") return <em key={index} lang="en" className="text-foreground">{part.text}</em>;
        if (part.type === "code") return <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{part.text}</code>;
        return <Fragment key={index}>{part.text}</Fragment>;
      })}
    </>
  );
}

export function InlineMarkdown({ text }: { text: string }) {
  return <InlineText parts={parseInline(text)} />;
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = parseMarkdown(text);
  return (
    <div className={cn("flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground", className)}>
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index}>
              {block.lines.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 ? <br /> : null}
                  <InlineText parts={line} />
                </Fragment>
              ))}
            </p>
          );
        }
        const List = block.ordered ? "ol" : "ul";
        return (
          <List key={index} start={block.ordered ? block.start : undefined} className={cn("flex flex-col gap-1.5 pl-5", block.ordered ? "list-decimal" : "list-disc")}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="pl-0.5 marker:text-muted-foreground/70">
                <InlineText parts={item} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
