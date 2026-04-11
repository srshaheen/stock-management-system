"use client";

import { useState, useTransition } from "react";
import { updateProduct } from "../../edit-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Prisma, Product } from "@prisma/client";

export default function EditForm({ product }: { product: Product }) {
  // Prisma Decimal object ke number e convert kora — DB theke asle Decimal instance hoy
  const originalStock = product.stockQuantity; // Int, already number

  const [stockInput, setStockInput] = useState<number>(originalStock);
  const [isPending, startTransition] = useTransition();

  const isStockChanged = stockInput !== originalStock;

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    // NaN hole original e ফিরে না গিয়ে empty রাখা — browser validation handle করবে
    if (!isNaN(parsed)) {
      setStockInput(Math.max(0, parsed));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Extra client-side guard — JS bypass er jonno
    if (isStockChanged) {
      const reason = (formData.get("reason") as string)?.trim();
      if (!reason) return;
    }

    startTransition(async () => {
      await updateProduct(formData);
    });
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b">
        <CardTitle className="text-xl">
          Edit Product: {product.modelName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <input type="hidden" name="id" value={product.id} />

          <div className="grid gap-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              name="modelName"
              defaultValue={product.modelName}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="boxNumber">Box Number</Label>
              <Input
                id="boxNumber"
                name="boxNumber"
                // boxNumber String? — null hote pare, ?? diye empty string fallback
                defaultValue={product.boxNumber ?? ""}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockQuantity">Current Stock</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min={0} // StockLog e negative thakle stockQuantity 0 er niche jawa uchit na
                value={stockInput}
                onChange={handleStockChange}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="costPrice">Cost Price (৳)</Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.01"
                min={0}
                // Prisma Decimal → number convert: .toNumber() is the correct method
                defaultValue={new Prisma.Decimal(product.costPrice).toNumber()}
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sellingPrice">Selling Price (৳)</Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.01"
                min={0}
                defaultValue={new Prisma.Decimal(
                  product.sellingPrice,
                ).toNumber()}
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* StockLog er jonno — isStockChanged true hole audit trail create hobe */}
          {isStockChanged && (
            <div className="grid gap-2 bg-orange-50 p-4 rounded-lg border border-orange-200 animate-in fade-in zoom-in duration-300">
              <Label htmlFor="reason" className="text-orange-800 font-bold">
                Reason for Stock Change (Mandatory)
              </Label>
              <Input
                id="reason"
                name="reason"
                placeholder='e.g. "New stock arrived", "2 units damaged"'
                required
                disabled={isPending}
                className="border-orange-300 focus-visible:ring-orange-500"
              />
              <p className="text-xs text-orange-600">
                Stock changing from {originalStock} → {stockInput}. A{" "}
                <code className="font-mono">MANUAL_ADJUSTMENT</code> StockLog
                will be created.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              asChild
              className="w-24"
              disabled={isPending}
            >
              <Link href="/inventory">Cancel</Link>
            </Button>
            <Button type="submit" className="w-32" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
