"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validUser = process.env.ADMIN_USERNAME || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === validUser && password === validPass) {
    // লগিন সাকসেস হলে কুকি সেট করা
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authorized", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // ৩০ দিন লগিন থাকবে
      path: "/",
    });

    // লগিনের পর যেখানে রিডাইরেক্ট করতে চান (যেমন /sales বা /)
    redirect("/sales");
  }

  // ভুল হলে এরর রিটার্ন করবে
  return { error: "Invalid username or password!" };
}
