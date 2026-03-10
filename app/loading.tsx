export default function Loading() {
  return (
    <div className="flex min-h-[calc(100dvh-4.75rem)] items-center justify-center p-6">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full border border-accent-green/25" />
        <div className="absolute h-24 w-24 animate-spin rounded-full border-2 border-transparent border-t-accent-green border-r-accent-cyan" />
        <div className="absolute h-14 w-14 animate-[spin_1.6s_linear_infinite_reverse] rounded-full border border-transparent border-b-accent-amber border-l-accent-cyan/80" />
        <div className="grid grid-cols-2 gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-cyan [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-amber [animation-delay:240ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green [animation-delay:360ms]" />
        </div>
      </div>
    </div>
  );
}
