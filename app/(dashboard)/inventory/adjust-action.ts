"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function adjustStock(formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantityChange = parseInt(formData.get("quantity") as string); // e.g., +10 or -5
  const reason = formData.get("reason") as string;
  const type = quantityChange > 0 ? "RESTOCK" : "MANUAL_ADJUSTMENT";

  await prisma.$transaction(async (tx) => {
    // 1. Update Product Stock
    await tx.product.update({
      where: { id: productId },
      data: {
        stockQuantity: { increment: quantityChange },
      },
    });

    // 2. Create Audit Log with Reason
    await tx.stockLog.create({
      data: {
        productId,
        changeType: type as any,
        quantity: quantityChange,
        reason: reason, // Exact reason mandatory
      },
    });
  });

  revalidatePath("/inventory");
  revalidatePath("/inventory/logs");
  redirect("/inventory");
}
