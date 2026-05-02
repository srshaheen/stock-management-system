// app/inventory/page.tsx
import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./_components/InventoryClient";

export const dynamic = "force-dynamic"; // Always fresh data

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { modelName: "asc" },
  });

  // Prisma Decimal → plain number/string convert (serialization safe)
  const serialized = products.map((p) => ({
    ...p,
    costPrice: Number(p.costPrice),
    sellingPrice: Number(p.sellingPrice),
  }));

  return <InventoryClient products={serialized} />;
}
