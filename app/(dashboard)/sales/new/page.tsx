import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createSale } from "../action";

export default async function NewSalePage() {
  // Fetching data for dropdowns
  const products = await prisma.product.findMany({
    where: { stockQuantity: { gt: 0 } }, // Shudhu stock-e thaka mal dekhabo
    orderBy: { modelName: "asc" },
  });

  const buyers = await prisma.buyer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Create New Sale Transaction</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form action={createSale as any} className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Select Product (Model)</Label>
                <select
                  name="productId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Choose Model...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.modelName} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Select Buyer</Label>
                <select
                  name="buyerId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Choose Buyer...</option>
                  {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input name="quantity" type="number" min="1" required />
              </div>
              <div className="grid gap-2">
                <Label>Unit Price (৳)</Label>
                <Input name="unitPrice" type="number" step="0.01" required />
              </div>
              <div className="grid gap-2">
                <Label>Paid Amount (৳)</Label>
                <Input
                  name="paidAmount"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
              <p className="text-sm text-slate-500 italic">
                * Due amount will be automatically calculated and added to
                buyers profile.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Complete Sale</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
