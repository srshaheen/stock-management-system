import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // লগিন পেজটি পাবলিক
  const isPublicPath = path === "/login";

  // কুকি চেক করা হচ্ছে
  const token = request.cookies.get("admin_session")?.value;

  // যদি লগিন না থাকে এবং অন্য পেজে যেতে চায়, তাহলে লগিন পেজে পাঠাও
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // যদি লগিন থাকে এবং ভুল করে লগিন পেজে আসে, তাহলে ড্যাশবোর্ডে পাঠাও
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/sales", request.url));
  }

  return NextResponse.next();
}

// কোন কোন পাথে এই মিডলওয়্যারটি কাজ করবে তা ঠিক করে দেওয়া
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
