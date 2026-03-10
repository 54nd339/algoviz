"use client";

import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Info } from "lucide-react";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

import { ComplexityBadge } from "./complexity-badge";
import { MisconceptionCards } from "./misconception-cards";

interface AlgorithmInfoDrawerProps {
  className?: string;
}

export function AlgorithmInfoDrawer({ className }: AlgorithmInfoDrawerProps) {
  const { algorithmMeta } = useVisualizer();
  const [open, setOpen] = useState(false);

  useHotkeys("i", () => setOpen((p) => !p));

  if (!algorithmMeta) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(className)}
          aria-label="Algorithm info"
        >
          <Info size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">{algorithmMeta.name}</DialogTitle>
          <DialogDescription>{algorithmMeta.description}</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase">
              Complexity
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <span className="text-text-muted">Best: </span>
                <span className="text-text-primary">
                  {algorithmMeta.timeComplexity.best}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Average: </span>
                <span className="text-text-primary">
                  {algorithmMeta.timeComplexity.average}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Worst: </span>
                <span className="text-text-primary">
                  {algorithmMeta.timeComplexity.worst}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Space: </span>
                <span className="text-text-primary">
                  {algorithmMeta.spaceComplexity}
                </span>
              </div>
            </div>
            <ComplexityBadge meta={algorithmMeta} />
          </div>

          {(algorithmMeta.stable !== undefined ||
            algorithmMeta.inPlace !== undefined) && (
            <div className="flex gap-2">
              {algorithmMeta.stable !== undefined && (
                <Badge variant={algorithmMeta.stable ? "green" : "amber"}>
                  {algorithmMeta.stable ? "Stable" : "Unstable"}
                </Badge>
              )}
              {algorithmMeta.inPlace !== undefined && (
                <Badge variant={algorithmMeta.inPlace ? "green" : "cyan"}>
                  {algorithmMeta.inPlace ? "In-Place" : "Out-of-Place"}
                </Badge>
              )}
            </div>
          )}

          {algorithmMeta.relatedAlgorithms &&
            algorithmMeta.relatedAlgorithms.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase">
                  Related
                </h4>
                <div className="flex flex-wrap gap-1">
                  {algorithmMeta.relatedAlgorithms.map((id) => (
                    <Badge key={id} variant="default">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {algorithmMeta.misconceptions &&
            algorithmMeta.misconceptions.length > 0 && (
              <MisconceptionCards
                misconceptions={algorithmMeta.misconceptions}
              />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
