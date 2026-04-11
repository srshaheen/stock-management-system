import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

function fmtTime(date: Date): string {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

function dayBoundary() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function monthBoundary() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { start: todayStart, end: todayEnd } = dayBoundary();
  const { start: monthStart, end: monthEnd } = monthBoundary();

  const [
    todaySales,
    monthSales,
    totalDues,
    lowStockProducts,
    totalProducts,
    totalBuyers,
    recentSales,
    topDebtors,
  ] = await Promise.all([
    // Today summary
    prisma.sale.aggregate({
      where: { saleTime: { gte: todayStart, lte: todayEnd } },
      _sum: { totalAmount: true, paidAmount: true, dueAmount: true },
      _count: { id: true },
    }),

    // This month summary — comparison এর জন্য
    prisma.sale.aggregate({
      where: { saleTime: { gte: monthStart, lte: monthEnd } },
      _sum: { totalAmount: true, paidAmount: true, dueAmount: true },
      _count: { id: true },
    }),

    // Total outstanding due
    prisma.buyer.aggregate({
      _sum: { totalDue: true },
    }),

    // Low stock (< 5)
    prisma.product.findMany({
      where: { stockQuantity: { lt: 5 } },
      orderBy: { stockQuantity: "asc" },
      take: 6,
    }),

    // Total products
    prisma.product.count(),

    // Total buyers
    prisma.buyer.count(),

    // Recent 8 sales
    prisma.sale.findMany({
      orderBy: { saleTime: "desc" },
      take: 8,
      include: {
        product: { select: { modelName: true } },
        buyer: { select: { name: true, id: true } },
      },
    }),

    // Top 5 buyers by due
    prisma.buyer.findMany({
      where: { totalDue: { gt: 0 } },
      orderBy: { totalDue: "desc" },
      take: 5,
      select: { id: true, name: true, phone: true, totalDue: true },
    }),
  ]);

  // Computed values
  const todayTotal = Number(todaySales._sum.totalAmount ?? 0);
  const todayPaid = Number(todaySales._sum.paidAmount ?? 0);
  const todayDue = Number(todaySales._sum.dueAmount ?? 0);
  const todayCount = todaySales._count.id;

  const monthTotal = Number(monthSales._sum.totalAmount ?? 0);
  const monthCount = monthSales._count.id;

  const totalOutstanding = Number(totalDues._sum.totalDue ?? 0);

  // Today's collection rate
  const collectionRate =
    todayTotal > 0 ? Math.round((todayPaid / todayTotal) * 100) : 0;

  const stats = [
    {
      title: "Today's Sales",
      value: fmt(todayTotal),
      sub: `${todayCount} transactions`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      badge: `This month: ${fmt(monthTotal)}`,
      badgeVariant: "secondary" as const,
    },
    {
      title: "Today's Collection",
      value: fmt(todayPaid),
      sub: `${collectionRate}% collection rate`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      badge: todayDue > 0 ? `Due: ${fmt(todayDue)}` : "Fully collected",
      badgeVariant: "outline" as const,
    },
    {
      title: "Total Outstanding",
      value: fmt(totalOutstanding),
      sub: `Across ${topDebtors.length} buyers with due`,
      icon: Wallet,
      color: "text-red-600",
      bg: "bg-red-50",
      badge: totalOutstanding > 0 ? "Needs attention" : "All clear",
      badgeVariant: "destructive" as const,
    },
    {
      title: "Inventory",
      value: totalProducts.toString(),
      sub: `${totalBuyers} registered buyers`,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      badge:
        lowStockProducts.length > 0
          ? `${lowStockProducts.length} low stock`
          : "Stock healthy",
      badgeVariant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Business Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Intl.DateTimeFormat("en-BD", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">This month</p>
          <p className="text-lg font-bold text-slate-800">{monthCount} sales</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">
                {stat.value}
              </div>
              <p className="text-xs text-slate-500">{stat.sub}</p>
              <Badge variant={stat.badgeVariant} className="text-xs">
                {stat.badge}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Sales */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Sales
            </CardTitle>
            <Link
              href="/sales"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No sales today yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => {
                  const due = Number(sale.dueAmount);
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {sale.product.modelName}
                        </p>
                        <p className="text-xs text-slate-400">
                          <Link
                            href={`/buyers/${sale.buyer.id}`}
                            className="hover:underline hover:text-blue-500"
                          >
                            {sale.buyer.name}
                          </Link>{" "}
                          · {fmtTime(sale.saleTime)}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-slate-800">
                          {fmt(Number(sale.totalAmount))}
                        </p>
                        {due > 0 ? (
                          <p className="text-xs text-red-500 flex items-center justify-end gap-1">
                            <ArrowDownRight className="w-3 h-3" />
                            {fmt(due)} due
                          </p>
                        ) : (
                          <p className="text-xs text-green-600">Paid</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Debtors */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              Top Outstanding Buyers
            </CardTitle>
            <Link
              href="/buyers"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {topDebtors.length === 0 ? (
              <p className="text-sm text-green-600 text-center py-6">
                🎉 No outstanding dues!
              </p>
            ) : (
              <div className="space-y-3">
                {topDebtors.map((buyer, index) => {
                  const due = Number(buyer.totalDue);
                  const pct =
                    totalOutstanding > 0
                      ? Math.round((due / totalOutstanding) * 100)
                      : 0;
                  return (
                    <div key={buyer.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-slate-400 w-4 shrink-0">
                            {index + 1}.
                          </span>
                          <Link
                            href={`/buyers/${buyer.id}`}
                            className="text-sm font-medium text-slate-800 hover:text-blue-600 hover:underline truncate"
                          >
                            {buyer.name}
                          </Link>
                        </div>
                        <span className="text-sm font-bold text-red-600 shrink-0 ml-2">
                          {fmt(due)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <Link
              href="/inventory"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-green-600 text-center py-6">
                ✓ All products are well stocked!
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {p.modelName}
                      </p>
                      {p.boxNumber && (
                        <p className="text-xs text-slate-400 font-mono">
                          #{p.boxNumber}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold ${
                        p.stockQuantity === 0
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-orange-300 bg-orange-50 text-orange-700"
                      }`}
                    >
                      {p.stockQuantity === 0
                        ? "Out of stock"
                        : `Only ${p.stockQuantity} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Health */}
        <Card className="bg-slate-900 text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Business Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Collection rate bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Today&apos;s Collection Rate</span>
                <span className="font-bold text-white">{collectionRate}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    collectionRate >= 80
                      ? "bg-green-400"
                      : collectionRate >= 50
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/10">
                <p className="text-xs text-white/60">Collected Today</p>
                <p className="text-sm font-bold text-green-400">
                  {fmt(todayPaid)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/10">
                <p className="text-xs text-white/60">Due Today</p>
                <p className="text-sm font-bold text-red-400">
                  {fmt(todayDue)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/10">
                <p className="text-xs text-white/60">Month Sales</p>
                <p className="text-sm font-bold text-blue-400">
                  {fmt(monthTotal)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/10">
                <p className="text-xs text-white/60">Total Market Due</p>
                <p className="text-sm font-bold text-orange-400">
                  {fmt(totalOutstanding)}
                </p>
              </div>
            </div>

            <p className="text-xs text-white/30 pt-1">
              Updated:{" "}
              {new Intl.DateTimeFormat("en-BD", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }).format(new Date())}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
