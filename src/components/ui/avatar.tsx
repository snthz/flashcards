import Image from "next/image";
import type { ReactNode } from "react";
import { AVATAR_PIXELS, avatarUrl, parseAvatar, type AvatarPreset } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const INK = "#2a2622";
const CREAM = "#f3ede1";
const TERRACOTTA = "#d4623b";
const AMBER = "#e8b547";
const FOREST = "#3d6b52";

const PRESETS: Record<AvatarPreset, { background: string; art: ReactNode }> = {
  horizon: {
    background: "#e9dcc6",
    art: (
      <>
        <circle cx="32" cy="38" r="15" fill={TERRACOTTA} />
        <rect x="0" y="38" width="64" height="26" fill={INK} />
        <rect x="22" y="44" width="20" height="2.5" rx="1.25" fill={TERRACOTTA} opacity="0.7" />
        <rect x="26" y="50" width="12" height="2.5" rx="1.25" fill={TERRACOTTA} opacity="0.45" />
      </>
    ),
  },
  orbit: {
    background: "#24221f",
    art: (
      <>
        <circle cx="32" cy="32" r="14" fill="none" stroke={CREAM} strokeWidth="5" />
        <circle cx="44.5" cy="21.5" r="5.5" fill={AMBER} />
      </>
    ),
  },
  slope: {
    background: "#c8d6c0",
    art: (
      <>
        <polygon points="0,64 64,14 64,64" fill={FOREST} />
        <circle cx="24" cy="24" r="8" fill={CREAM} />
      </>
    ),
  },
  crescent: {
    background: "#2f4157",
    art: (
      <>
        <circle cx="30" cy="34" r="15" fill="#f2e6cc" />
        <circle cx="37" cy="28" r="13" fill="#2f4157" />
        <circle cx="46" cy="44" r="1.6" fill="#f2e6cc" />
        <circle cx="19" cy="19" r="1.2" fill="#f2e6cc" />
        <circle cx="47" cy="17" r="1" fill="#f2e6cc" />
      </>
    ),
  },
  tide: {
    background: "#d3e3f0",
    art: (
      <g fill="none" strokeWidth="4.5" strokeLinecap="round">
        <path d="M2 24q6.5-6 13 0t13 0t13 0t13 0t13 0" stroke="#2d5da6" />
        <path d="M-4 34q6.5-6 13 0t13 0t13 0t13 0t13 0" stroke="#4f7fc4" />
        <path d="M2 44q6.5-6 13 0t13 0t13 0t13 0t13 0" stroke="#8db0de" />
      </g>
    ),
  },
  dots: {
    background: "#f1eadd",
    art: (
      <g fill={INK}>
        {[20, 32, 44].flatMap((y) => [20, 32, 44].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.2" fill={x === 32 && y === 32 ? TERRACOTTA : undefined} />))}
      </g>
    ),
  },
  bloom: {
    background: "#f3d6c6",
    art: (
      <>
        <g fill="#e2694c" opacity="0.9">
          <circle cx="32" cy="22" r="9" />
          <circle cx="42" cy="32" r="9" />
          <circle cx="32" cy="42" r="9" />
          <circle cx="22" cy="32" r="9" />
        </g>
        <circle cx="32" cy="32" r="6" fill="#f8eadf" />
      </>
    ),
  },
  peaks: {
    background: "#dce3e7",
    art: (
      <>
        <circle cx="46" cy="18" r="5" fill={AMBER} />
        <polygon points="4,50 25,20 46,50" fill="#4a5b66" />
        <polygon points="24,50 42,27 60,50" fill="#7d8f99" />
        <rect x="0" y="49" width="64" height="15" fill="#36444d" />
      </>
    ),
  },
  rings: {
    background: AMBER,
    art: (
      <>
        <circle cx="32" cy="32" r="5" fill={INK} />
        <g fill="none" stroke={INK} strokeWidth="3.5">
          <circle cx="32" cy="32" r="12.5" />
          <circle cx="32" cy="32" r="20" />
          <circle cx="32" cy="32" r="27.5" />
        </g>
      </>
    ),
  },
  arch: {
    background: "#bedbd4",
    art: (
      <>
        <path d="M16 58V30a16 16 0 0 1 32 0v28Z" fill="#1f6a60" />
        <path d="M24 58V31a8 8 0 0 1 16 0v27Z" fill={CREAM} />
      </>
    ),
  },
  spark: {
    background: "#3a3631",
    art: (
      <>
        <path d="M32 12C34 26 38 30 52 32C38 34 34 38 32 52C30 38 26 34 12 32C26 30 30 26 32 12Z" fill={CREAM} />
        <path d="M46 12.5C46.6 16.6 47.4 17.4 51.5 18C47.4 18.6 46.6 19.4 46 23.5C45.4 19.4 44.6 18.6 40.5 18C44.6 17.4 45.4 16.6 46 12.5Z" fill={AMBER} />
      </>
    ),
  },
  tiles: {
    background: "#f1eadd",
    art: (
      <>
        <path d="M32 32H10A22 22 0 0 1 32 10Z" fill={TERRACOTTA} />
        <rect x="32" y="10" width="22" height="22" fill={INK} />
        <circle cx="43" cy="21" r="6.5" fill="#f1eadd" />
        <rect x="10" y="32" width="22" height="22" fill={AMBER} />
        <path d="M32 32H54A22 22 0 0 1 32 54Z" fill={FOREST} />
      </>
    ),
  },
};

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return `${parts[0][0]}${last[0] ?? ""}`.toUpperCase();
}

export function PresetAvatar({ preset, className }: { preset: AvatarPreset; className?: string }) {
  const { background, art } = PRESETS[preset];
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("shrink-0 overflow-hidden rounded-full", className)}>
      <rect width="64" height="64" fill={background} />
      {art}
    </svg>
  );
}

export function UserAvatar({ name, avatar, className }: { name: string; avatar?: string | null; className?: string }) {
  const value = parseAvatar(avatar);
  if (value?.kind === "upload") {
    return (
      <Image
        src={avatarUrl(value.file)}
        alt=""
        width={AVATAR_PIXELS}
        height={AVATAR_PIXELS}
        unoptimized
        className={cn("shrink-0 rounded-full bg-muted object-cover", className)}
      />
    );
  }
  if (value?.kind === "preset") return <PresetAvatar preset={value.preset} className={className} />;
  return (
    <span className={cn("flex shrink-0 select-none items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground", className)}>
      {initials(name)}
    </span>
  );
}
