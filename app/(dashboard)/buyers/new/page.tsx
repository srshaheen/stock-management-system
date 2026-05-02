import { addBuyer } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function NewBuyerPage() {
  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Buyer / Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addBuyer} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter buyer name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="017xxxxxxxx" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Shop name or location"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" className="w-full">
                Save Buyer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
