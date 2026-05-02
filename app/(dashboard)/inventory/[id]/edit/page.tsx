import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ডাটাবেস থেকে র ডাটা আনা হচ্ছে
  const rawProduct = await prisma.product.findUnique({
    where: { id: id },
  });

  if (!rawProduct) {
    notFound();
  }

  // Decimal ফিল্ডগুলোকে Number-এ কনভার্ট করা হচ্ছে
  const product = {
    ...rawProduct,
    costPrice: Number(rawProduct.costPrice),
    sellingPrice: Number(rawProduct.sellingPrice),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Inventory</h1>
        <p className="text-slate-500 text-sm">
          Update prices or adjust stock levels.
        </p>
      </div>

      {/* এখন কনভার্ট করা ডাটা কম্পোনেন্টে পাস করা হলো */}
      <EditForm product={product} />
    </div>
  );
}
