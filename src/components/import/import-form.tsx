"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, FileUp, UploadCloud } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { cn, formatNumber } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import type { ImportSummary } from "@/lib/anki/import";

type Phase = "idle" | "uploading" | "processing" | "done" | "error";

export function ImportForm() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (candidate: File | null | undefined) => {
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith(".apkg")) {
      setError(t.importer.errors.notApkg);
      return;
    }
    setError(null);
    setSummary(null);
    setPhase("idle");
    setFile(candidate);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files?.[0]);
  };

  const upload = () => {
    if (!file) return;
    setPhase("uploading");
    setProgress(0);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/import");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.upload.onload = () => setPhase("processing");
    xhr.onerror = () => {
      setPhase("error");
      setError(t.importer.errors.uploadFailed);
    };
    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText) as { ok?: boolean; summary?: ImportSummary; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && payload.summary) {
          setSummary(payload.summary);
          setPhase("done");
          router.refresh();
        } else {
          setPhase("error");
          setError(payload.error ?? t.importer.errors.failed);
        }
      } catch {
        setPhase("error");
        setError(t.importer.errors.unexpectedResponse);
      }
    };
    xhr.send(body);
  };

  const busy = phase === "uploading" || phase === "processing";

  if (phase === "done" && summary) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center animate-in">
        <CheckCircle2 className="size-10 text-success" />
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold">{t.importer.done}</p>
          <p className="text-sm text-muted-foreground">{file?.name}</p>
        </div>
        <dl className="grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Stat label={t.importer.summary.decks} value={summary.decks} />
          <Stat label={t.importer.summary.noteTypes} value={summary.noteTypes} />
          <Stat label={t.importer.summary.notes} value={summary.notes} />
          <Stat label={t.importer.summary.updatedNotes} value={summary.updatedNotes} />
          <Stat label={t.importer.summary.cards} value={summary.cards} />
          <Stat label={t.importer.summary.media} value={summary.media} />
          {summary.skippedCards > 0 ? <Stat label={t.importer.summary.skippedCards} value={summary.skippedCards} /> : null}
        </dl>
        <div className="flex gap-2">
          <Link href="/decks" className={buttonStyles("primary")}>
            {t.importer.viewDecks}
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setSummary(null);
              setPhase("idle");
            }}
          >
            {t.importer.importAnother}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FormError message={error} />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          dragging ? "border-accent bg-accent-soft/50" : "hover:border-accent/60 hover:bg-muted/50",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".apkg"
          className="sr-only"
          onChange={(event) => pick(event.target.files?.[0])}
        />
        {file ? <FileUp className="size-8 text-accent" /> : <UploadCloud className="size-8 text-muted-foreground" />}
        <div className="flex flex-col gap-1">
          <p className="font-medium">{file ? file.name : t.importer.dropzone}</p>
          <p className="text-sm text-muted-foreground">
            {file ? `${new Intl.NumberFormat(intlLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(file.size / 1024 / 1024)} MB` : t.importer.dropzoneHint}
          </p>
        </div>
      </div>
      {busy ? (
        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full bg-accent transition-all", phase === "processing" && "animate-pulse")}
              style={{ width: `${phase === "processing" ? 100 : progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {phase === "uploading" ? t.importer.uploading(progress) : t.importer.processing}
          </p>
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button onClick={upload} disabled={!file} loading={busy}>
          {t.importer.submit}
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { locale } = useI18n();
  return (
    <>
      <dt className="text-left text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{formatNumber(value, locale)}</dd>
    </>
  );
}
