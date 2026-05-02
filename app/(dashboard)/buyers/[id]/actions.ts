"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordPayment(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;
  const amount = parseFloat(formData.get("amount") as string);

  if (!buyerId || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid payment data.");
  }

  await prisma.$transaction(async (tx) => {
    // Buyer exist করে কিনা এবং কতটুকু due আছে চেক করো
    const buyer = await tx.buyer.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new Error("Buyer not found.");

    const currentDue = Number(buyer.totalDue);
    if (amount > currentDue) {
      throw new Error(`Payment ৳${amount} exceeds total due ৳${currentDue}.`);
    }

    // FIFO — সবচেয়ে পুরোনো due গুলো আগে clear হবে
    const pendingSales = await tx.sale.findMany({
      where: { buyerId, dueAmount: { gt: 0 } },
      orderBy: { saleTime: "asc" },
    });

    let remaining = amount;

    for (const sale of pendingSales) {
      if (remaining <= 0) break;

      const saleDue = Number(sale.dueAmount);
      const toDeduct = Math.min(remaining, saleDue);

      await tx.sale.update({
        where: { id: sale.id },
        data: {
          paidAmount: { increment: toDeduct },
          dueAmount: { decrement: toDeduct },
        },
      });

      remaining -= toDeduct;
    }

    // Buyer এর totalDue update
    await tx.buyer.update({
      where: { id: buyerId },
      data: { totalDue: { decrement: amount } },
    });
  });

  revalidatePath(`/buyers/${buyerId}`);
  revalidatePath("/buyers");
}
