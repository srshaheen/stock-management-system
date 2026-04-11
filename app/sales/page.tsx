import { prisma } from "@/lib/prisma";
import SalesTable from "./SalesTable";
import SalesFilters from "./SalesFilters";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, TrendingUp, TrendingDown, Package } from "lucide-react";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  q?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, from, to, page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    ...(q && {
      buyer: { name: { contains: q, mode: "insensitive" as const } },
    }),
    ...((from || to) && {
      saleTime: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(`${to}T23:59:59.999Z`) }),
      },
    }),
  };

  const [sales, total, summary] = await Promise.all([
    prisma.sale.findMany({
      where,
      orderBy: { saleTime: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        product: { select: { modelName: true, boxNumber: true } },
        buyer: { select: { name: true, id: true } },
        returns: { select: { quantity: true } },
      },
    }),
    prisma.sale.count({ where }),
    prisma.sale.aggregate({
      where,
      _sum: {
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
        quantity: true,
      },
    }),
  ]);

  const totalAmount = Number(summary._sum.totalAmount ?? 0);
  const totalPaid = Number(summary._sum.paidAmount ?? 0);
  const totalDue = Number(summary._sum.dueAmount ?? 0);
  const totalUnits = summary._sum.quantity ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
          <p className="text-slate-500 text-sm">
            All transactions with exact timestamps.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <ShoppingCart className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Sales</p>
              <p className="text-lg font-bold text-slate-800">{total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Units Sold</p>
              <p className="text-lg font-bold text-blue-700">{totalUnits}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Collected</p>
              <p className="text-lg font-bold text-green-700">
                {formatAmount(totalPaid)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={totalDue > 0 ? "border-red-200" : "border-green-200"}>
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${totalDue > 0 ? "bg-red-50" : "bg-green-50"}`}
            >
              <TrendingDown
                className={`h-4 w-4 ${totalDue > 0 ? "text-red-600" : "text-green-600"}`}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500">Outstanding Due</p>
              <p
                className={`text-lg font-bold ${totalDue > 0 ? "text-red-700" : "text-green-700"}`}
              >
                {formatAmount(totalDue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <SalesFilters />

      {/* Table */}
      <SalesTable
        sales={sales}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
