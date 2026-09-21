import { Skeleton } from "@/components/ui/skeleton";

export function BrowseTableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3" aria-busy>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-1.5">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-full" />
      <BrowseTableSkeleton />
    </div>
  );
}
