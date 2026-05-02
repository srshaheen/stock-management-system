"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const modelName = formData.get("modelName") as string;
  const boxNumber = formData.get("boxNumber") as string;
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const newStockQuantity = parseInt(formData.get("stockQuantity") as string);
  const reason = formData.get("reason") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Prothome check kori puraton data ki chilo
      const existingProduct = await tx.product.findUnique({
        where: { id },
      });

      if (!existingProduct) throw new Error("Product not found");

      const stockDifference = newStockQuantity - existingProduct.stockQuantity;

      // 2. Product update kora
      await tx.product.update({
        where: { id },
        data: {
          modelName,
          boxNumber,
          costPrice,
          sellingPrice,
          stockQuantity: newStockQuantity,
        },
      });

      // 3. Jodi stock quantity change hoy, tobe oboshshoi Log rakhte hobe
      if (stockDifference !== 0) {
        if (!reason || reason.trim() === "") {
          throw new Error("Reason is mandatory when changing stock quantity!");
        }

        await tx.stockLog.create({
          data: {
            productId: id,
            changeType: stockDifference > 0 ? "RESTOCK" : "MANUAL_ADJUSTMENT",
            quantity: stockDifference,
            reason: `Edit Update: ${reason}`,
          },
        });
      }
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/logs");
  } catch (error: any) {
    // Real app e ekhane error handle korben
    console.error(error.message);
    return { error: error.message };
  }

  redirect("/inventory");
}
