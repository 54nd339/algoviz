"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, PanelLeft, PanelLeftClose } from "lucide-react";

import {
  Button,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useImmersiveMode, useSidebarOpen, useToggleSidebar } from "@/stores";

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useSidebarOpen();
  const toggleSidebar = useToggleSidebar();
  const immersive = useImmersiveMode();

  if (immersive) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 hidden h-screen flex-col border-r border-border bg-bg-surface transition-all duration-200 sm:flex",
        sidebarOpen ? "w-56" : "w-14",
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border px-3">
        {sidebarOpen && (
          <Link
            href="/"
            className="font-mono text-sm font-bold tracking-wider text-accent-green"
          >
            ALGOVIZ
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={cn(!sidebarOpen && "mx-auto")}
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-0.5 px-2">
            {CATEGORIES.map(({ slug, label, icon: Icon }) => {
              const href = `/${slug}`;
              const active = pathname === href;

              return sidebarOpen ? (
                <Link
                  key={slug}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-bg-elevated text-accent-green"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                  )}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ) : (
                <Tooltip key={slug}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center justify-center rounded-md p-2 transition-colors",
                        active
                          ? "bg-bg-elevated text-accent-green"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                      )}
                    >
                      <Icon size={16} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      <Separator />
      <div className="px-2 py-2">
        {sidebarOpen ? (
          <p className="flex flex-wrap items-center gap-1 px-3 font-mono text-[10px] text-text-muted">
            <span>built with</span>
            <Heart
              size={10}
              className="inline fill-accent-red text-accent-red"
              aria-hidden
            />
            <span>by</span>
            <Link
              href="https://sandeepswain.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-green hover:underline"
            >
              Sandeep
            </Link>
          </p>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="https://sandeepswain.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-md p-1.5 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="https://sandeepswain.dev/logo.svg"
                    alt="Sandeep Swain"
                    width={24}
                    height={24}
                    className="rounded-sm"
                    unoptimized
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">sandeepswain.dev</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
}
