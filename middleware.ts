import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit tracking with simple cleanup
const rateLimitStore = new Map<string, Map<string, RateLimitEntry>>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(
  ip: string,
  endpoint: "applications" | "leads",
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  // Get or create endpoint store
  if (!rateLimitStore.has(endpoint)) {
    rateLimitStore.set(endpoint, new Map());
  }
  const endpointStore = rateLimitStore.get(endpoint)!;

  // Get or create IP entry
  if (!endpointStore.has(ip)) {
    endpointStore.set(ip, { count: 0, resetTime: now + windowMs });
  }

  const entry = endpointStore.get(ip)!;

  // Check if window has expired
  if (now >= entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counter
  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const ip = getClientIp(req);

  // Rate limit /api/applications: 5 requests per 10 minutes
  if (pathname === "/api/applications" && req.method === "POST") {
    const { allowed, retryAfter } = checkRateLimit(ip, "applications", 5, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Window": "10m",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Rate limit /api/leads: 10 requests per hour
  if (pathname === "/api/leads" && req.method === "POST") {
    const { allowed, retryAfter } = checkRateLimit(ip, "leads", 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Window": "1h",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/applications", "/api/leads"],
};
