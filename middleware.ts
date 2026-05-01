import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/inventory(.*)",
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth();

    // 1. User logged in kina check
    if (!userId) {
      return (await auth()).redirectToSignIn();
    }

    // 2. Only specific email access (Single User Logic)
    const userEmail = sessionClaims?.email as string;
    if (userEmail !== process.env.ADMIN_EMAIL) {
      return NextResponse.rewrite(new URL("/not-authorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
