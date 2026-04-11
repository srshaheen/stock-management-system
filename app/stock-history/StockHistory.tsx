import type { StockLog, StockChangeType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Undo2,
  SlidersHorizontal,
  PackagePlus,
  History,
} from "lucide-react";
import type { ComponentType } from "react";
import Pagination from "./Pagination";

type StockLogWithProduct = StockLog & {
  product: {
    modelName: string;
    boxNumber: string | null;
  };
};

type Props = {
  logs: StockLogWithProduct[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

type ChangeTypeConfig = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  badgeClass: string;
  dotClass: string;
};

const CHANGE_TYPE_CONFIG: Record<StockChangeType, ChangeTypeConfig> = {
  SALE: {
    label: "Sale",
    icon: ShoppingCart,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  RETURN: {
    label: "Return",
    icon: Undo2,
    badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dotClass: "bg-yellow-500",
  },
  MANUAL_ADJUSTMENT: {
    label: "Adjustment",
    icon: SlidersHorizontal,
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    dotClass: "bg-orange-500",
  },
  RESTOCK: {
    label: "Restock",
    icon: PackagePlus,
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    dotClass: "bg-green-500",
  },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

function formatQuantity(qty: number): string {
  return qty > 0 ? `+${qty}` : `${qty}`;
}

function getQuantityClass(
  changeType: StockChangeType,
  quantity: number,
): string {
  if (changeType === "SALE") return "text-red-600";
  if (changeType === "RETURN" || changeType === "RESTOCK")
    return "text-green-600";
  return quantity > 0 ? "text-green-600" : "text-red-600";
}

export default function StockHistory({
  logs,
  total,
  currentPage,
  totalPages,
  pageSize,
}: Props) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  if (logs.length === 0) {
    return (
      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <History className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs mt-1">Try adjusting your filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            Stock History
          </CardTitle>
          {/* Showing X-Y of Z */}
          <span className="text-xs text-slate-400">
            {from}–{to} of {total} entries
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          <div className="absolute left-1.75 top-2 bottom-2 w-px bg-slate-200" />

          {logs.map((log) => {
            const config = CHANGE_TYPE_CONFIG[log.changeType];
            const Icon = config.icon;
            const quantityClass = getQuantityClass(
              log.changeType,
              log.quantity,
            );

            return (
              <div key={log.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div
                  className={`relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${config.dotClass}`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {log.product.modelName}
                      </span>
                      {log.product.boxNumber && (
                        <span className="text-xs text-slate-400">
                          #{log.product.boxNumber}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums shrink-0 ${quantityClass}`}
                    >
                      {formatQuantity(log.quantity)} units
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2 py-0.5 flex items-center gap-1 ${config.badgeClass}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                    <p className="text-sm text-slate-500 truncate">
                      {log.reason}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t">
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
