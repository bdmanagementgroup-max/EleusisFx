/**
 * Price Action Chart Screenshot
 * Renders the self-hosted /chart-preview-pa page (candles + volume +
 * trendline/fib/key-levels/long-short overlays via lightweight-charts) and
 * captures it with puppeteer-core + @sparticuz/chromium — same launch logic
 * as the TradingView-embed pipeline in browser.ts, shared via
 * browser-common.ts.
 */

import type { Browser, Page } from 'puppeteer-core';
import { launchBrowser, DEFAULT_BROWSER_CONFIG, type BrowserConfig } from './browser-common';
import type { PriceActionOHLCV } from './market-data';
import type { PriceActionSetup } from './price-action';

function buildPriceActionPreviewUrl(
  ohlcv: PriceActionOHLCV,
  setup: PriceActionSetup,
  siteUrl: string
): string {
  // Round to keep the query string well under Node's request-line size
  // limit — full trading precision isn't needed for a social chart image.
  const roundedOhlcv = {
    open: ohlcv.open.map((v) => Number(v.toFixed(5))),
    high: ohlcv.high.map((v) => Number(v.toFixed(5))),
    low: ohlcv.low.map((v) => Number(v.toFixed(5))),
    close: ohlcv.close.map((v) => Number(v.toFixed(5))),
    volume: ohlcv.volume.map((v) => Math.round(v)),
  };

  // Only send what the widget draws — swingHighs/swingLows/relativeVolume
  // are analysis inputs the LLM prompt uses (Task 9), not chart overlays.
  const renderSetup = {
    trend: setup.trend,
    keyLevels: setup.keyLevels,
    trendline: setup.trendline,
    fibRetracement: setup.fibRetracement,
    longShortBox: setup.longShortBox,
  };

  const ohlcvParam = encodeURIComponent(JSON.stringify(roundedOhlcv));
  const setupParam = encodeURIComponent(JSON.stringify(renderSetup));
  return `${siteUrl}/chart-preview-pa?ohlcv=${ohlcvParam}&setup=${setupParam}`;
}

export async function generatePriceActionScreenshot(
  ohlcv: PriceActionOHLCV,
  setup: PriceActionSetup,
  config: BrowserConfig = {}
): Promise<Uint8Array> {
  const cfg = { ...DEFAULT_BROWSER_CONFIG, ...config };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser(cfg);
    const page: Page = await browser.newPage();
    page.setDefaultTimeout(cfg.timeout);

    const url = buildPriceActionPreviewUrl(ohlcv, setup, siteUrl);
    console.log('[ChartAnalysis] Navigating to price-action preview');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForSelector('[data-chart-ready="true"]', { timeout: 15000 });
    // lightweight-charts paints synchronously on setData, but give the
    // browser one frame to flush the canvas before capturing.
    await new Promise((r) => setTimeout(r, 300));

    console.log('[ChartAnalysis] Capturing price-action screenshot...');
    const screenshot = new Uint8Array(
      await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: cfg.viewport.width, height: cfg.viewport.height },
      })
    );

    console.log(`[ChartAnalysis] Price-action screenshot captured: ${screenshot.length} bytes`);
    return screenshot;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
