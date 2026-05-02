"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProduct(formData: FormData) {
  const modelName = formData.get("modelName") as string;
  const boxNumber = formData.get("boxNumber") as string;
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const stockQuantity = parseInt(formData.get("stockQuantity") as string);

  // Database transaction: Product create hobe + StockLog e record thakbe
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        modelName,
        boxNumber,
        costPrice,
        sellingPrice,
        stockQuantity,
      },
    });

    // Initial stock entry logic
    await tx.stockLog.create({
      data: {
        productId: product.id,
        changeType: "RESTOCK", // Prothom bar add kora mane restock
        quantity: stockQuantity,
        reason: "Initial stock entry",
      },
    });
  });

  revalidatePath("/inventory"); // Data update hole list refresh korbe
  redirect("/inventory"); // List page-e niye jabe
}
