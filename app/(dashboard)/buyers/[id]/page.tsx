import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BuyerHistory from "./BuyerHistory";
import BuyerFilters from "./BuyerFilters";
import Pagination from "./Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, ShoppingBag } from "lucide-react";
import RecordPayment from "./RecordPayment";

const PAGE_SIZE = 15;

type SearchParams = Promise<{
  from?: string;
  to?: string;
  page?: string;
}>;

export default async function BuyerHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { from, to, page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const dateFilter = {
    ...((from || to) && {
      saleTime: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(`${to}T23:59:59.999Z`) }),
      },
    }),
  };

  const [buyer, sales, totalSales] = await Promise.all([
    prisma.buyer.findUnique({ where: { id } }),
    prisma.sale.findMany({
      where: { buyerId: id, ...dateFilter },
      orderBy: { saleTime: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        product: {
          select: { modelName: true, boxNumber: true },
        },
        returns: true,
      },
    }),
    prisma.sale.count({ where: { buyerId: id, ...dateFilter } }),
  ]);

  if (!buyer) notFound();

  // Summary stats — filtered range এ
  const summary = await prisma.sale.aggregate({
    where: { buyerId: id, ...dateFilter },
    _sum: {
      totalAmount: true,
      paidAmount: true,
      dueAmount: true,
    },
  });

  const totalAmount = Number(summary._sum.totalAmount ?? 0);
  const totalPaid = Number(summary._sum.paidAmount ?? 0);
  const totalDue = Number(summary._sum.dueAmount ?? 0);
  const totalPages = Math.ceil(totalSales / PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{buyer.name}</h1>
        <p className="text-slate-500 text-sm">
          {buyer.phone ?? "No phone"}{" "}
          {buyer.address ? `· ${buyer.address}` : ""}
        </p>
      </div>
      <RecordPayment
        buyerId={buyer.id}
        buyerName={buyer.name}
        totalDue={Number(buyer.totalDue)}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <ShoppingBag className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Billed</p>
              <p className="text-lg font-bold text-slate-800">
                ৳
                {totalAmount.toLocaleString("en-BD", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Paid</p>
              <p className="text-lg font-bold text-green-700">
                ৳
                {totalPaid.toLocaleString("en-BD", {
                  minimumFractionDigits: 2,
                })}
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
              <p className="text-xs text-slate-500">Total Due</p>
              <p
                className={`text-lg font-bold ${totalDue > 0 ? "text-red-700" : "text-green-700"}`}
              >
                ৳
                {totalDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <BuyerFilters />

      {/* History table */}
      <BuyerHistory
        sales={sales}
        total={totalSales}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
