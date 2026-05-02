"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
] as const;

function getPresetDates(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];

  if (preset === "today") {
    return { from: to, to };
  }
  if (preset === "week") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return { from: from.toISOString().split("T")[0], to };
  }
  // month
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: from.toISOString().split("T")[0], to };
}

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL update helper — page reset হয়ে যাবে filter change এ
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page"); // Filter change হলে page 1 এ ফিরে যাবে

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const hasFilters =
    searchParams.has("type") ||
    searchParams.has("q") ||
    searchParams.has("from") ||
    searchParams.has("to");

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1 — Search + Type filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by product name..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => {
              // Debounce ছাড়াই — Enter এ search
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ q: e.currentTarget.value });
              }
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={searchParams.get("type") ?? "ALL"}
          onValueChange={(value) =>
            updateParams({ type: value === "ALL" ? null : value })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="SALE">Sale</SelectItem>
            <SelectItem value="RETURN">Return</SelectItem>
            <SelectItem value="MANUAL_ADJUSTMENT">Adjustment</SelectItem>
            <SelectItem value="RESTOCK">Restock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 2 — Date presets + custom range */}
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

        {/* Clear all filters */}
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
    </div>
  );
}
