import type { Sale } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import Pagination from "./Pagination";

type SaleWithDetails = Sale & {
  product: { modelName: string; boxNumber: string | null };
  buyer: { id: string; name: string };
  returns: { quantity: number }[];
};

type Props = {
  sales: SaleWithDetails[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
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

function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

export default function SalesTable({
  sales,
  total,
  currentPage,
  totalPages,
  pageSize,
}: Props) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 border rounded-xl bg-white">
        <ShoppingCart className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No sales found</p>
        <p className="text-xs mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Count header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
          <h2 className="text-sm font-semibold text-slate-700">Transactions</h2>
          <span className="text-xs text-slate-400">
            {from}–{to} of {total} sales
          </span>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => {
              const due = Number(sale.dueAmount);
              const totalReturned = sale.returns.reduce(
                (acc, r) => acc + r.quantity,
                0,
              );
              // সব quantity return হয়ে গেলে আর return করা যাবে না
              const canReturn = totalReturned < sale.quantity;

              return (
                <TableRow key={sale.id}>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(sale.saleTime)}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/buyers/${sale.buyer.id}`}
                      className="font-medium text-slate-800 hover:text-blue-600 hover:underline"
                    >
                      {sale.buyer.name}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-800">
                        {sale.product.modelName}
                      </p>
                      {sale.product.boxNumber && (
                        <p className="text-xs text-slate-400">
                          #{sale.product.boxNumber}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>{sale.quantity}</span>
                      {totalReturned > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1 py-0 border-yellow-300 bg-yellow-50 text-yellow-700"
                        >
                          -{totalReturned} returned
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-medium">
                    {formatAmount(Number(sale.totalAmount))}
                  </TableCell>

                  <TableCell className="text-right text-green-700 font-medium">
                    {formatAmount(Number(sale.paidAmount))}
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={`font-bold ${due > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatAmount(due)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    {canReturn ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8"
                        asChild
                      >
                        <Link href={`/sales/${sale.id}/return`}>Return</Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 pr-2">
                        Fully returned
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
