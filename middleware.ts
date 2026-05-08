import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect dashboard and admin routes
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Redirect unauthenticated users to login
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role for admin routes
    if (pathname.startsWith("/admin")) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.app_metadata?.role !== "admin") {
        return NextResponse.redirect(req.nextUrl.clone().pathname = "/dashboard");
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
