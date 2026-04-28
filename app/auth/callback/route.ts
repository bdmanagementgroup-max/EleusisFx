import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/reset-password";

  if (code) {
    const cookieStore = await cookies();

    // Capture cookies that Supabase wants to set so we can apply them to the redirect response
    const outgoingCookies: ResponseCookie[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              outgoingCookies.push({ name, value, ...options } as ResponseCookie);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Write the session cookies onto the redirect response so the browser receives them
      outgoingCookies.forEach((cookie) => {
        response.cookies.set(cookie);
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`);
}
