import { cn } from "@/lib/utils";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded border border-border bg-bg-elevated px-1.5 font-mono text-[10px] font-medium text-text-muted select-none",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
