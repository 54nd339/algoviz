"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  ScrollArea,
} from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function MobileSheet() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation menu"
        className="fixed top-3 left-3 z-50 sm:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left top-0 left-0 h-full max-w-xs -translate-x-0 -translate-y-0 rounded-none border-t-0 border-b-0 border-l-0">
          <DialogTitle className="font-mono text-sm font-bold tracking-wider text-accent-green">
            ALGOVIZ
          </DialogTitle>
          <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-0.5">
              {CATEGORIES.map(({ slug, label, icon: Icon }) => {
                const href = `/${slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={slug}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-bg-elevated text-accent-green"
                        : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                    )}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
