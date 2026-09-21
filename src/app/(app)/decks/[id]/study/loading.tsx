import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col md:min-h-0" aria-busy>
      <div className="flex items-center justify-between pb-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="min-h-72 flex-1 rounded-2xl" />
      <div className="pt-3">
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
