"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type Product = {
  id: string;
  modelName: string;
  boxNumber: string | null;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
};

type SortKey = "modelName" | "stockQuantity" | "sellingPrice" | "margin";
type SortDir = "asc" | "desc";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function margin(p: Product) {
  if (p.costPrice === 0) return 0;
  return ((p.sellingPrice - p.costPrice) / p.costPrice) * 100;
}

function stockBadge(qty: number) {
  if (qty === 0)
    return {
      cls: "bg-red-100 text-red-700 ring-1 ring-red-200",
      label: "Out of Stock",
    };
  if (qty < 5)
    return {
      cls: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
      label: String(qty),
    };
  if (qty < 15)
    return {
      cls: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
      label: String(qty),
    };
  return {
    cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    label: String(qty),
  };
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Stat Card
// ────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${accent ?? "bg-slate-100"}`}>
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
        <p className="text-xl font-bold text-slate-800 leading-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sort Header
// ────────────────────────────────────────────────────────────
function SortHead({
  col,
  label,
  current,
  dir,
  onSort,
  className,
}: {
  col: SortKey;
  label: string;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = current === col;
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(col)}
        className={`flex items-center gap-1 group transition-colors hover:text-slate-900 ${
          active ? "text-slate-900 font-semibold" : "text-slate-500"
        }`}
      >
        {label}
        <Icon
          className={`w-3 h-3 transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
        />
      </button>
    </TableHead>
  );
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────
export function InventoryClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("modelName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Keyboard shortcut: Ctrl+K / Cmd+K ──────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape") {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Sort handler ────────────────────────────────────────
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  // ── Filtered + sorted products ──────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? products.filter(
          (p) =>
            p.modelName.toLowerCase().includes(q) ||
            (p.boxNumber ?? "").toLowerCase().includes(q),
        )
      : [...products];

    matched.sort((a, b) => {
      let av: number | string, bv: number | string;
      switch (sortKey) {
        case "modelName":
          av = a.modelName.toLowerCase();
          bv = b.modelName.toLowerCase();
          break;
        case "stockQuantity":
          av = a.stockQuantity;
          bv = b.stockQuantity;
          break;
        case "sellingPrice":
          av = a.sellingPrice;
          bv = b.sellingPrice;
          break;
        case "margin":
          av = margin(a);
          bv = margin(b);
          break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return matched;
  }, [query, products, sortKey, sortDir]);

  // ── Stats ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalValue = products.reduce(
      (s, p) => s + p.costPrice * p.stockQuantity,
      0,
    );
    const lowStock = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity < 5,
    ).length;
    const outOfStock = products.filter((p) => p.stockQuantity === 0).length;
    const avgMargin =
      products.length > 0
        ? products.reduce((s, p) => s + margin(p), 0) / products.length
        : 0;
    return { totalValue, lowStock, outOfStock, avgMargin };
  }, [products]);

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your products and stock levels.
          </p>
        </div>
        <Link href="/inventory/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Package}
          label="Total Products"
          value={products.length}
          sub="unique models"
          accent="bg-blue-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Margin"
          value={`${stats.avgMargin.toFixed(1)}%`}
          sub="across all items"
          accent="bg-emerald-50"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats.lowStock}
          sub={`${stats.outOfStock} out of stock`}
          accent="bg-orange-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Inventory Value"
          value={`৳${stats.totalValue.toLocaleString("en-BD")}`}
          sub="at cost price"
          accent="bg-violet-50"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model name or box number..."
            className="pl-10 pr-10 bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 font-mono whitespace-nowrap select-none">
          <span>⌘</span>
          <span>K</span>
        </div>

        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
          {filtered.length}
          <span className="text-slate-400">/{products.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-slate-50">
              <SortHead
                col="modelName"
                label="Model Name"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
                className="w-52 pl-4"
              />
              <TableHead className="text-slate-500 text-xs font-medium">
                Box No.
              </TableHead>
              <TableHead className="text-slate-500 text-xs font-medium">
                Cost Price
              </TableHead>
              <SortHead
                col="sellingPrice"
                label="Sell Price"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortHead
                col="margin"
                label="Margin"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortHead
                col="stockQuantity"
                label="Stock"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
                className="text-center"
              />
              <TableHead className="text-right pr-4 text-slate-500 text-xs font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-10 h-10 text-slate-300" />
                    <p className="text-slate-500 font-medium">
                      {query
                        ? `No products matched "${query}"`
                        : "No products found"}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {query ? (
                        <button
                          onClick={() => setQuery("")}
                          className="text-blue-500 hover:underline"
                        >
                          Clear search
                        </button>
                      ) : (
                        <Link
                          href="/inventory/new"
                          className="text-blue-500 hover:underline"
                        >
                          Add your first product
                        </Link>
                      )}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => {
                const badge = stockBadge(product.stockQuantity);
                const mgn = margin(product);
                const profit = product.sellingPrice - product.costPrice;

                return (
                  <TableRow
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Model Name */}
                    <TableCell className="font-semibold text-slate-800 pl-4">
                      {highlight(product.modelName, query)}
                    </TableCell>

                    {/* Box Number */}
                    <TableCell>
                      {product.boxNumber ? (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200 font-mono">
                          {highlight(product.boxNumber, query)}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Cost Price */}
                    <TableCell className="text-slate-500 text-sm">
                      ৳{product.costPrice.toLocaleString("en-BD")}
                    </TableCell>

                    {/* Sell Price */}
                    <TableCell className="font-medium text-slate-800">
                      ৳{product.sellingPrice.toLocaleString("en-BD")}
                    </TableCell>

                    {/* Margin */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold ${
                            mgn >= 20
                              ? "text-emerald-600"
                              : mgn >= 10
                                ? "text-yellow-600"
                                : "text-red-500"
                          }`}
                        >
                          {mgn.toFixed(1)}%
                        </span>
                        <span className="text-slate-400 text-xs hidden sm:inline">
                          (৳{profit.toLocaleString("en-BD")})
                        </span>
                      </div>
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={`/inventory/${product.id}/edit`}>
                          Edit
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-600">
                {products.length}
              </span>{" "}
              products
            </p>
            {stats.lowStock > 0 && (
              <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {stats.lowStock} item{stats.lowStock !== 1 ? "s" : ""} running
                low
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
