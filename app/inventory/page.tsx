// app/inventory/page.tsx
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  // Database theke search query onujayi data ana
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { modelName: { contains: query, mode: "insensitive" } },
        { boxNumber: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { modelName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-slate-500 text-sm">
            Manage your products and stock levels.
          </p>
        </div>
        <Link href="/inventory/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Search Bar Section */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <form method="GET">
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search model name or box number..."
              className="pl-10 bg-slate-50 border-none focus-visible:ring-1"
            />
          </form>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Total Products: {products.length}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-50">Model Name</TableHead>
              <TableHead>Box No.</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Sell Price</TableHead>
              <TableHead className="text-center font-bold">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-400"
                >
                  No products found. Add some to get started!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.modelName}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs border font-mono">
                      {product.boxNumber || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>৳{Number(product.costPrice)}</TableCell>
                  <TableCell>৳{Number(product.sellingPrice)}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stockQuantity < 5
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/inventory/${product.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
