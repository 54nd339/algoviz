"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button, Card } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100dvh-4.75rem)] items-center justify-center p-6">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-md border-accent-amber/30 bg-bg-surface/80"
      >
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent-amber/20" />
            <AlertTriangle size={20} className="relative text-accent-amber" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="font-mono text-base font-semibold text-text-primary">
                Runtime fault detected
              </h2>
              <p className="mt-1 font-mono text-xs tracking-wider text-accent-amber/90 uppercase">
                Render pipeline interrupted
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Recover the view by re-initializing the current route state.
              </p>
            </div>

            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="h-1 w-5 animate-pulse rounded-full bg-accent-green/80" />
              <span className="h-1 w-3 animate-pulse rounded-full bg-accent-cyan/80 [animation-delay:120ms]" />
              <span className="h-1 w-4 animate-pulse rounded-full bg-accent-amber/80 [animation-delay:240ms]" />
            </div>

            <Button
              onClick={reset}
              variant="recovery"
              className="inline-flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Reboot Route
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
