import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

// App routes that require a signed-in user. "/" (login) and "/about" stay public.
const PROTECTED = ["/search", "/c/", "/notebook", "/progress"];

export async function middleware(request: NextRequest) {
  // Before the Supabase keys are set, don't gate anything — the app stays usable
  // during setup and the login page shows a notice.
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });

  // Never let an auth error take down the whole site: on any failure, treat the
  // visitor as signed out (public routes still render; protected ones redirect).
  let user = null;
  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    });
    // Refresh the session (must run before any redirect) and read the user.
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // A signed-in user landing on the login page goes straight to the app.
  if (path === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/search";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/).*)"],
};
