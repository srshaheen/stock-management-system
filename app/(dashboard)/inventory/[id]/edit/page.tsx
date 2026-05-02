import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Inventory</h1>
        <p className="text-slate-500 text-sm">
          Update prices or adjust stock levels.
        </p>
      </div>

      {/* Component a data pass kora holo */}
      <EditForm product={product} />
    </div>
  );
}
