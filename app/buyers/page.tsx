import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone } from "lucide-react";
import Link from "next/link";

export default async function BuyersPage() {
  const buyers = await prisma.buyer.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { sales: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buyers Ledger</h1>
          <p className="text-slate-500 text-sm">
            Track customer dues and contact info.
          </p>
        </div>
        <Link href="/buyers/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add New Buyer
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Buyer Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Total Sales</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-400"
                >
                  No buyers yet. Add your first buyer.
                </TableCell>
              </TableRow>
            )}
            {buyers.map((buyer) => {
              const due = Number(buyer.totalDue);
              return (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium">{buyer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3 h-3" />
                      {buyer.phone ?? "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {buyer.address ?? "---"}
                  </TableCell>
                  <TableCell className="text-right text-slate-500 text-sm">
                    {buyer._count.sales} sales
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        due > 0
                          ? "border-red-200 bg-red-50 text-red-700 font-bold"
                          : "border-green-200 bg-green-50 text-green-700 font-bold"
                      }
                    >
                      ৳
                      {due.toLocaleString("en-BD", {
                        minimumFractionDigits: 2,
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/buyers/${buyer.id}`}>View History</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
