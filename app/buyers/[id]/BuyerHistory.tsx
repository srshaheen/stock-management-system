import type { Sale, Return } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

type SaleWithDetails = Sale & {
  product: { modelName: string; boxNumber: string | null };
  returns: Return[];
};

type Props = {
  sales: SaleWithDetails[];
  total: number;
  currentPage: number;
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

export default function BuyerHistory({
  sales,
  total,
  currentPage,
  pageSize,
}: Props) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 border rounded-xl bg-white">
        <ShoppingBag className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No sales found</p>
        <p className="text-xs mt-1">Try adjusting the date filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
        <h2 className="text-sm font-semibold text-slate-700">
          Purchase History
        </h2>
        <span className="text-xs text-slate-400">
          {from}–{to} of {total} sales
        </span>
      </div>

      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Due</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const due = Number(sale.dueAmount);
            const returnedQty = sale.returns.reduce(
              (acc, r) => acc + r.quantity,
              0,
            );

            return (
              <>
                <TableRow key={sale.id}>
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
                      {returnedQty > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1 py-0 border-yellow-300 bg-yellow-50 text-yellow-700"
                        >
                          -{returnedQty} returned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    {formatAmount(Number(sale.unitPrice))}
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
                  <TableCell className="text-right text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(sale.saleTime)}
                  </TableCell>
                </TableRow>

                {/* Returns inline — sale এর নিচে */}
                {sale.returns.map((ret) => (
                  <TableRow
                    key={ret.id}
                    className="bg-yellow-50/50 hover:bg-yellow-50"
                  >
                    <TableCell
                      colSpan={2}
                      className="pl-8 text-xs text-yellow-700"
                    >
                      ↩ Return: {ret.reason}
                    </TableCell>
                    <TableCell
                      colSpan={4}
                      className="text-xs text-yellow-700 text-right"
                    >
                      {ret.quantity} units returned
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-400">
                      {formatDate(ret.returnDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
