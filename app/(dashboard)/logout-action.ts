"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  // সার্ভার থেকে admin_session কুকি ডিলিট করা হচ্ছে
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  // লগআউট করার পর লগিন পেজে পাঠিয়ে দেওয়া
  redirect("/login");
}
