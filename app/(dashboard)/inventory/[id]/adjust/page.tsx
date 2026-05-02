import { prisma } from "@/lib/prisma";
import { adjustStock } from "../../adjust-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function AdjustStockPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Adjust Stock: {product.modelName}</CardTitle>
          <p className="text-xs text-slate-500">
            Current Stock: {product.stockQuantity}
          </p>
        </CardHeader>
        <CardContent>
          <form action={adjustStock} className="grid gap-4">
            <input type="hidden" name="productId" value={product.id} />

            <div className="grid gap-2">
              <Label>Quantity to Add/Remove</Label>
              <Input
                name="quantity"
                type="number"
                placeholder="Use +10 to add, -5 to remove"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Reason for Change</Label>
              <textarea
                name="reason"
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. 2 items damaged, New shipment arrived"
                required
              ></textarea>
            </div>

            <Button type="submit" className="w-full">
              Update Stock & Log Reason
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
