"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSale(formData: FormData) {
  const productId = formData.get("productId") as string;
  const buyerId = formData.get("buyerId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const unitPrice = parseFloat(formData.get("unitPrice") as string);
  const paidAmount = parseFloat(formData.get("paidAmount") as string);

  const totalAmount = quantity * unitPrice;
  const dueAmount = totalAmount - paidAmount;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Check current stock
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.stockQuantity < quantity) {
        throw new Error("Insufficient stock!");
      }

      // 2. Create Sale Record
      await tx.sale.create({
        data: {
          productId,
          buyerId,
          quantity,
          unitPrice,
          totalAmount,
          paidAmount,
          dueAmount,
        },
      });

      // 3. Update Product Stock
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: { decrement: quantity },
        },
      });

      // 4. Update Buyer Due
      await tx.buyer.update({
        where: { id: buyerId },
        data: {
          totalDue: { increment: dueAmount },
        },
      });

      // 5. Add to Stock Log (History)
      await tx.stockLog.create({
        data: {
          productId,
          changeType: "SALE",
          quantity: -quantity, // Negative value for sales
          reason: `Sold to buyer`,
        },
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/sales");
    revalidatePath("/buyers");
  } catch (error: any) {
    return { error: error.message };
  }

  redirect("/sales");
}
