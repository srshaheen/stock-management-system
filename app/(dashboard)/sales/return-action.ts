"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processReturn(formData: FormData) {
  const saleId = formData.get("saleId") as string;
  const returnQuantity = parseInt(formData.get("quantity") as string);
  const reason = formData.get("reason") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Sale details খুঁজে বের করা
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { product: true, buyer: true },
      });

      if (!sale || returnQuantity > sale.quantity) {
        throw new Error("Invalid return quantity!");
      }

      // 2. Return record ক্রিয়েট করা
      await tx.return.create({
        data: {
          saleId,
          quantity: returnQuantity,
          reason: reason || "Direct return from table",
        },
      });

      // 3. Product stock বাড়ানো (Auto Stock Update)
      await tx.product.update({
        where: { id: sale.productId },
        data: {
          stockQuantity: { increment: returnQuantity },
        },
      });

      // 4. Refund এবং Due অ্যাডজাস্টমেন্ট লজিক
      const refundValue = returnQuantity * Number(sale.unitPrice);
      let currentDue = Number(sale.dueAmount);
      let currentPaid = Number(sale.paidAmount);

      let dueReduction = 0;

      if (refundValue <= currentDue) {
        // যদি রিটার্ন ভ্যালু ডিউ-এর চেয়ে কম বা সমান হয় (শুধু ডিউ কমবে)
        dueReduction = refundValue;
        currentDue -= refundValue;
      } else {
        // যদি রিটার্ন ভ্যালু ডিউ-এর চেয়ে বেশি হয় (পুরো ডিউ জিরো হবে এবং বাকিটা Paid থেকে ফেরত যাবে)
        dueReduction = currentDue;
        const amountToRefundFromPaid = refundValue - currentDue;
        currentDue = 0;
        currentPaid -= amountToRefundFromPaid;
      }

      // 5. স্পেসিফিক Sale রেকর্ড আপডেট করা (টেবিলে আপডেট দেখানোর জন্য)
      await tx.sale.update({
        where: { id: saleId },
        data: {
          totalAmount: { decrement: refundValue },
          dueAmount: currentDue,
          paidAmount: currentPaid,
        },
      });

      // 6. Buyer-এর Overall Due কমানো
      if (dueReduction > 0) {
        await tx.buyer.update({
          where: { id: sale.buyerId },
          data: {
            totalDue: { decrement: dueReduction },
          },
        });
      }

      // 7. Stock Log-এ রিফান্ড অ্যামাউন্টসহ এন্ট্রি দেওয়া
      await tx.stockLog.create({
        data: {
          productId: sale.productId,
          changeType: "RETURN",
          quantity: returnQuantity,
          reason: `Return from ${sale.buyer.name}. Refunded: ৳${refundValue}. Reason: ${reason || "Direct return"}`,
        },
      });
    });

    // 8. UI আপডেট করার জন্য প্যাথগুলো রিভ্যালিডেট করা
    revalidatePath("/inventory");
    revalidatePath("/buyers");
    revalidatePath("/sales");

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unexpected error occurred" };
  }
}
