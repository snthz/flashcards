"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, FileUp, UploadCloud } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { cn, formatNumber } from "@/lib/utils";
import type { ImportSummary } from "@/lib/anki/import";

type Phase = "idle" | "uploading" | "processing" | "done" | "error";

export function ImportForm() {
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
      setError("Selecciona un archivo .apkg exportado desde Anki");
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
      setError("No se pudo subir el archivo. Revisa tu conexión.");
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
          setError(payload.error ?? "No se pudo importar el archivo");
        }
      } catch {
        setPhase("error");
        setError("Respuesta inesperada del servidor");
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
          <p className="text-lg font-semibold">Importación completada</p>
          <p className="text-sm text-muted-foreground">{file?.name}</p>
        </div>
        <dl className="grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Stat label="Mazos nuevos" value={summary.decks} />
          <Stat label="Tipos de nota" value={summary.noteTypes} />
          <Stat label="Notas nuevas" value={summary.notes} />
          <Stat label="Notas actualizadas" value={summary.updatedNotes} />
          <Stat label="Tarjetas" value={summary.cards} />
          <Stat label="Archivos multimedia" value={summary.media} />
          {summary.skippedCards > 0 ? <Stat label="Tarjetas ya existentes" value={summary.skippedCards} /> : null}
        </dl>
        <div className="flex gap-2">
          <Link href="/decks" className={buttonStyles("primary")}>
            Ver mazos
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setSummary(null);
              setPhase("idle");
            }}
          >
            Importar otro
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
          <p className="font-medium">{file ? file.name : "Arrastra tu archivo .apkg o haz clic para elegirlo"}</p>
          <p className="text-sm text-muted-foreground">
            {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "Exporta un mazo desde Anki y súbelo aquí"}
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
            {phase === "uploading" ? `Subiendo… ${progress}%` : "Procesando el mazo, esto puede tardar unos segundos…"}
          </p>
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button onClick={upload} disabled={!file} loading={busy}>
          Importar
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <>
      <dt className="text-left text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{formatNumber(value)}</dd>
    </>
  );
}
