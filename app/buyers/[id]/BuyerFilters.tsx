"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
] as const;

function getPresetDates(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  if (preset === "today") return { from: to, to };
  if (preset === "week") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return { from: from.toISOString().split("T")[0], to };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: from.toISOString().split("T")[0], to };
}

export default function BuyerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const hasFilters = searchParams.has("from") || searchParams.has("to");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            const { from, to } = getPresetDates(preset.value);
            updateParams({ from, to });
          }}
        >
          {preset.label}
        </Button>
      ))}

      <div className="flex items-center gap-2 ml-auto">
        <Input
          type="date"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => updateParams({ from: e.target.value })}
          className="h-8 text-xs w-36"
        />
        <span className="text-slate-400 text-xs">→</span>
        <Input
          type="date"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => updateParams({ to: e.target.value })}
          className="h-8 text-xs w-36"
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-slate-500"
          onClick={() => router.push(pathname)}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
