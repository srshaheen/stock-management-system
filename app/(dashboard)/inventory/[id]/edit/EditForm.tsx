"use client";

import { useState, useTransition } from "react";
import { updateProduct } from "../../edit-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { Product } from "@prisma/client"; // শুধু type ইমপোর্ট করা হলো

// Client-এ পাঠানোর জন্য Decimal ফিল্ডগুলোকে number/string হিসেবে ডিক্লেয়ার করা হলো
type ClientProduct = Omit<Product, "costPrice" | "sellingPrice"> & {
  costPrice: number | string;
  sellingPrice: number | string;
};

export default function EditForm({ product }: { product: ClientProduct }) {
  const originalStock = product.stockQuantity;

  const [stockInput, setStockInput] = useState<number>(originalStock);
  const [isPending, startTransition] = useTransition();

  const isStockChanged = stockInput !== originalStock;

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      setStockInput(Math.max(0, parsed));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

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
                min={0}
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
                // Prisma-র বদলে সরাসরি Number() ব্যবহার করা হলো
                defaultValue={Number(product.costPrice)}
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
                // Prisma-র বদলে সরাসরি Number() ব্যবহার করা হলো
                defaultValue={Number(product.sellingPrice)}
                required
                disabled={isPending}
              />
            </div>
          </div>

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
