import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, backHref, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        {backHref ? (
          <Link href={backHref} className="-ml-1 inline-flex w-fit items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" />
            Volver
          </Link>
        ) : null}
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
