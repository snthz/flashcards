import { Skeleton } from "@/components/ui/skeleton";

export function DeckListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between rounded-xl border bg-card px-4 py-4">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <DeckListSkeleton />
    </div>
  );
}
