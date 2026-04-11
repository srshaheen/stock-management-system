import { prisma } from "@/lib/prisma";
import type { StockChangeType } from "@prisma/client";
import StockHistory from "./StockHistory";
import Filters from "./Filters";

const PAGE_SIZE = 20;

const VALID_CHANGE_TYPES = new Set<string>([
  "SALE",
  "RETURN",
  "MANUAL_ADJUSTMENT",
  "RESTOCK",
]);

function isValidChangeType(value: string): value is StockChangeType {
  return VALID_CHANGE_TYPES.has(value);
}

// Next.js 15 — searchParams is a Promise
type SearchParams = Promise<{
  type?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

export default async function StockHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { type, q, from, to, page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * PAGE_SIZE;

  // Prisma where clause dynamically build করা হচ্ছে
  const where = {
    ...(type && isValidChangeType(type) && { changeType: type }),
    ...(q && {
      product: {
        modelName: { contains: q, mode: "insensitive" as const },
      },
    }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        // to date এর শেষ মুহূর্ত পর্যন্ত include করা
        ...(to && { lte: new Date(`${to}T23:59:59.999Z`) }),
      },
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.stockLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        product: {
          select: { modelName: true, boxNumber: true },
        },
      },
    }),
    prisma.stockLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock History</h1>
        <p className="text-slate-500 text-sm">
          Audit trail of all stock changes across inventory.
        </p>
      </div>

      <Filters />

      <StockHistory
        logs={logs}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
