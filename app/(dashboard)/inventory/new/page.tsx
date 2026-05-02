import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { addProduct } from "../action";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl">Add New Product</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form action={addProduct} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="modelName">Model Name / Product Name</Label>
              <Input
                id="modelName"
                name="modelName"
                placeholder="e.g. iPhone 15 Display"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="boxNumber">Box Number</Label>
                <Input
                  id="boxNumber"
                  name="boxNumber"
                  placeholder="e.g. B-05"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stockQuantity">Initial Stock</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  defaultValue="0"
                  required
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
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Selling Price (৳)</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" className="w-24">
                Cancel
              </Button>
              <Button type="submit" className="w-32">
                Save Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
