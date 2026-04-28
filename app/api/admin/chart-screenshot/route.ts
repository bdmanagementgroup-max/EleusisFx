import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { symbol = "FX:EURUSD", interval = "D" } = await req.json();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const previewUrl = `${siteUrl}/admin/tools/chart/preview?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`;

  let browser: import("puppeteer-core").Browser | null = null;

  try {
    // Dynamic imports to avoid bundling issues in non-server environments
    const puppeteer = (await import("puppeteer-core")).default;
    const isProduction = process.env.NODE_ENV === "production";

    let executablePath: string;
    let launchArgs: string[];

    if (isProduction) {
      const chromium = (await import("@sparticuz/chromium")).default;
      executablePath = await chromium.executablePath();
      launchArgs = chromium.args;
    } else {
      // macOS Chrome path — override with CHROME_PATH env var if needed
      executablePath =
        process.env.CHROME_PATH ??
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      launchArgs = [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ];
    }

    browser = await puppeteer.launch({
      args: launchArgs,
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Block unnecessary resources to speed up chart load
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const type = request.resourceType();
      if (type === "font") {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(previewUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for TradingView iframe to appear, then allow chart to render
    await page
      .waitForSelector(".tradingview-widget-container__widget iframe", {
        timeout: 25000,
      })
      .catch(() => {
        // Proceed even if selector isn't found — fixed wait covers it
      });

    // Additional render time for chart candlesticks / data to paint
    await new Promise((r) => setTimeout(r, 6000));

    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 720 },
    });

    // Upload to Supabase Storage
    const adminSupabase = await getSupabaseAdminClient();
    const safePair = symbol.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safePair}_${interval}_${Date.now()}.png`;

    const { error: uploadError } = await adminSupabase.storage
      .from("chart-snapshots")
      .upload(fileName, screenshotBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from("chart-snapshots").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, fileName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Screenshot failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
