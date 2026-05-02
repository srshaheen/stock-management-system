"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addBuyer(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  await prisma.buyer.create({
    data: {
      name,
      phone,
      address,
    },
  });

  revalidatePath("/buyers");
  revalidatePath("/sales/new"); // Jate sales form-e dropdown update hoy
  redirect("/buyers");
}
