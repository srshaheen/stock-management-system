"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function processReturn(formData: FormData) {
  const saleId = formData.get("saleId") as string;
  const returnQuantity = parseInt(formData.get("quantity") as string);
  const reason = formData.get("reason") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Sale details khuje ber kora
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { product: true, buyer: true },
      });

      if (!sale || returnQuantity > sale.quantity) {
        throw new Error("Invalid return quantity!");
      }

      // 2. Return record create kora
      await tx.return.create({
        data: {
          saleId,
          quantity: returnQuantity,
          reason: reason,
        },
      });

      // 3. Product stock barano (Auto Stock Update)
      await tx.product.update({
        where: { id: sale.productId },
        data: {
          stockQuantity: { increment: returnQuantity },
        },
      });

      // 4. Buyer Due Adjust kora
      // Return kora maler daam: quantity * sale unit price
      const refundValue = returnQuantity * Number(sale.unitPrice);

      await tx.buyer.update({
        where: { id: sale.buyerId },
        data: {
          totalDue: { decrement: refundValue },
        },
      });

      // 5. Stock Log-e reason shoho entry dewa
      await tx.stockLog.create({
        data: {
          productId: sale.productId,
          changeType: "RETURN",
          quantity: returnQuantity,
          reason: `Return from ${sale.buyer.name}. Reason: ${reason}`,
        },
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/buyers");
    revalidatePath("/sales");
  } catch (error: any) {
    return { error: error.message };
  }

  redirect("/sales");
}
