"use client";

import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Code } from "lucide-react";

import { CollapsiblePanel } from "@/components/visualizers/shared/collapsible-panel";
import { useVisualizer } from "@/hooks";

interface CodePanelProps {
  className?: string;
}

export function CodePanel({ className }: CodePanelProps) {
  const { algorithmMeta, currentStep } = useVisualizer();
  const [collapsed, setCollapsed] = useState(false);
  const [html, setHtml] = useState("");

  const pseudocode = algorithmMeta?.pseudocode ?? "";
  const activeLine = currentStep?.codeLine;

  useHotkeys("c", () => setCollapsed((p) => !p));

  const highlight = useCallback(async () => {
    if (!pseudocode) {
      setHtml("");
      return;
    }
    const { highlightCode } = await import("@/lib/utils/highlighter");
    const result = await highlightCode(pseudocode, activeLine);
    setHtml(result);
  }, [pseudocode, activeLine]);

  useEffect(() => {
    highlight();
  }, [highlight]);

  if (!pseudocode) return null;

  return (
    <CollapsiblePanel
      data-tour="code"
      title="Pseudocode"
      icon={<Code size={14} />}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      className={className}
      maxHeight="max-h-64"
      contentClassName="px-1 text-sm [&_.active-line]:border-l-2 [&_.active-line]:border-accent-green [&_.active-line]:bg-accent-green/10 [&_code]:!bg-transparent [&_pre]:!bg-transparent"
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </CollapsiblePanel>
  );
}
