"use client";

import { useEffect, useId, useRef, useTransition, type PointerEvent, type ReactNode, type RefObject } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/i18n/client";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  role?: "dialog" | "alertdialog";
  labelledBy?: string;
  describedBy?: string;
  locked?: boolean;
  sheet?: boolean;
  onDismiss?: () => void;
}

const DISMISS_DISTANCE = 110;

function useSheetDrag(ref: RefObject<HTMLDialogElement | null>, enabled: boolean, onDismiss: () => void) {
  const drag = useRef<{ start: number; delta: number; pointer: number } | null>(null);
  const onPointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    if (!enabled || !(event.target as HTMLElement).closest("[data-sheet-handle]")) return;
    if (!window.matchMedia("(max-width: 47.99rem)").matches) return;
    drag.current = { start: event.clientY, delta: 0, pointer: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.transition = "none";
  };
  const onPointerMove = (event: PointerEvent<HTMLDialogElement>) => {
    if (!drag.current || drag.current.pointer !== event.pointerId) return;
    drag.current.delta = Math.max(0, event.clientY - drag.current.start);
    event.currentTarget.style.transform = `translateY(${drag.current.delta}px)`;
  };
  const onPointerEnd = () => {
    if (!drag.current) return;
    const { delta } = drag.current;
    drag.current = null;
    const dialog = ref.current;
    if (!dialog) return;
    dialog.style.transition = "";
    dialog.style.transform = "";
    if (delta > DISMISS_DISTANCE) onDismiss();
  };
  return { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd };
}

export function SheetHandle({ className }: { className?: string }) {
  return (
    <div data-sheet-handle aria-hidden className={cn("flex cursor-grab touch-none justify-center pb-1 pt-2.5 md:hidden", className)}>
      <span className="h-1 w-10 rounded-full bg-border" />
    </div>
  );
}

export function Modal({ open, onClose, children, className, role, labelledBy, describedBy, locked = false, sheet = false, onDismiss }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const dismiss = onDismiss ?? onClose;
  const drag = useSheetDrag(ref, sheet && !locked, dismiss);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role === "alertdialog" ? "alertdialog" : undefined}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        if (!locked && !onDismiss) return;
        event.preventDefault();
        if (!locked) dismiss();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current && !locked) dismiss();
      }}
      {...drag}
      className={cn(
        "modal m-auto w-[calc(100%-2rem)] rounded-2xl border bg-card p-0 text-foreground shadow-2xl",
        !/(^|\s)max-w-/.test(className ?? "") && "max-w-md",
        sheet && "modal-sheet",
        className,
      )}
    >
      {children}
    </dialog>
  );
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  sheet?: boolean;
}

export function Dialog({ open, onClose, title, description, children, className, sheet = false }: DialogProps) {
  const t = useMessages();
  const id = useId();
  return (
    <Modal open={open} onClose={onClose} sheet={sheet} className={className} labelledBy={`${id}-title`} describedBy={description ? `${id}-description` : undefined}>
      {sheet ? <SheetHandle /> : null}
      <div className={cn("flex flex-col gap-4 p-5", sheet && "max-md:pt-2")} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={`${id}-title`} className="text-base font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={`${id}-description`} className="text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </Modal>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<unknown>;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  icon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  icon,
  children,
  disabled = false,
}: ConfirmDialogProps) {
  const t = useMessages();
  const id = useId();
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    if (disabled) return;
    startTransition(async () => {
      await onConfirm();
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => !pending && onClose()}
      locked={pending}
      role="alertdialog"
      labelledBy={`${id}-title`}
      describedBy={description ? `${id}-description` : undefined}
      className="max-w-[27rem]"
    >
      <div
        className="flex flex-col gap-6 p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) return;
          event.preventDefault();
          confirm();
        }}
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full [&>svg]:size-[18px]",
              tone === "danger" ? "bg-danger-soft text-danger" : "bg-muted text-foreground",
            )}
          >
            {icon ?? (tone === "danger" ? <Trash2 /> : <AlertTriangle />)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
            <h2 id={`${id}-title`} className="text-base font-semibold leading-snug">
              {title}
            </h2>
            {description ? (
              <div id={`${id}-description`} className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            ) : null}
            {children ? <div className="mt-2">{children}</div> : null}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" autoFocus onClick={onClose} disabled={pending}>
            {cancelLabel ?? t.common.cancel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} loading={pending} disabled={disabled} onClick={confirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
