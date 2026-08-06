/**
 * Chart Analysis Browser Automation
 * Renders TradingView's Advanced Chart embed widget (no login required) on an
 * internal preview page — /app/chart-preview — with indicators pre-loaded via
 * the widget's `studies` config, then captures a screenshot with puppeteer-core
 * + @sparticuz/chromium (Vercel-compatible headless Chrome, same pattern as
 * /api/admin/chart-screenshot).
 *
 * Earlier versions of this file drove TradingView's public, interactive
 * /chart/ app directly and tried to click through the Indicators dialog.
 * That approach cannot work: TradingView requires a logged-in account to add
 * ANY indicator (even a built-in EMA) via that UI — anonymous sessions hit a
 * "Join for free" paywall modal on the very first click, confirmed via a
 * live headless run. The embed widget has no such restriction.
 */

import type { Browser, Page } from 'puppeteer-core';
import type { TimeframeValue } from './types';

export interface BrowserConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  deviceScaleFactor?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: Required<BrowserConfig> = {
  headless: true,
  // Extra height so the price pane + RSI + MACD sub-panes all fit in one shot
  viewport: { width: 1920, height: 1600 },
  deviceScaleFactor: 2,
  timeout: 90000,
};

interface StudyConfig {
  id: string;
  inputs?: Record<string, number | string>;
}

/**
 * Convert Yahoo symbol to TradingView symbol format for the embed widget.
 * FX: works for forex without login; BINANCE: for crypto.
 */
export function getTradingViewSymbol(symbol: string): string {
  if (symbol.endsWith('=X')) {
    return `FX:${symbol.replace('=X', '')}`;
  }
  if (symbol.endsWith('-USD')) {
    return `BINANCE:${symbol.replace('-USD', 'USDT')}`;
  }
  return symbol;
}

const TIMEFRAME_TO_INTERVAL: Record<TimeframeValue, string> = {
  '4H': '240',
  '1D': 'D',
  '1W': 'W',
};

const DEFAULT_STUDIES: StudyConfig[] = [
  { id: 'MAExp@tv-basicstudies', inputs: { length: 20 } },
  { id: 'MAExp@tv-basicstudies', inputs: { length: 50 } },
  { id: 'MAExp@tv-basicstudies', inputs: { length: 200 } },
  { id: 'RSI@tv-basicstudies', inputs: { length: 14 } },
  { id: 'MACD@tv-basicstudies' },
  // Volume is rendered by default on the embed widget's main pane
];

function buildPreviewUrl(symbol: string, timeframe: TimeframeValue, siteUrl: string): string {
  const tvSymbol = getTradingViewSymbol(symbol);
  const interval = TIMEFRAME_TO_INTERVAL[timeframe];
  const studiesParam = encodeURIComponent(JSON.stringify(DEFAULT_STUDIES));
  return `${siteUrl}/chart-preview?symbol=${encodeURIComponent(tvSymbol)}&interval=${interval}&studies=${studiesParam}`;
}

async function launchBrowser(cfg: Required<BrowserConfig>): Promise<Browser> {
  const puppeteer = (await import('puppeteer-core')).default;
  const isProduction = process.env.NODE_ENV === 'production';

  let executablePath: string;
  let launchArgs: string[];

  if (isProduction) {
    const chromium = (await import('@sparticuz/chromium')).default;
    executablePath = await chromium.executablePath();
    launchArgs = [...chromium.args, '--disable-blink-features=AutomationControlled'];
  } else {
    executablePath =
      process.env.CHROME_PATH ??
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ];
  }

  return puppeteer.launch({
    args: launchArgs,
    executablePath,
    headless: cfg.headless,
    defaultViewport: {
      width: cfg.viewport.width,
      height: cfg.viewport.height,
      deviceScaleFactor: cfg.deviceScaleFactor,
    },
  });
}

/**
 * Poll the (cross-origin) chart iframe's rendered text until the MACD
 * legend — the last of DEFAULT_STUDIES to compute — shows real numeric
 * values rather than just its label. Falls back to a fixed settle time if
 * the values never appear (e.g. TradingView UI changes the legend format),
 * so a screenshot still gets taken rather than the job failing outright.
 */
async function waitForChartData(page: Page, timeout: number): Promise<void> {
  const start = Date.now();
  const pollInterval = 300;

  while (Date.now() - start < Math.min(timeout, 30000)) {
    const chartFrame = page.frames().find((f) => f.url().includes('advanced-chart'));
    if (chartFrame) {
      try {
        const text: string = await chartFrame.evaluate(() => document.body?.innerText ?? '');
        if (isChartDataLoaded(text)) {
          return;
        }
      } catch {
        // Frame may be mid-navigation between polls — retry
      }
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  console.warn('[ChartAnalysis] Chart data did not confirm loaded within timeout; capturing anyway');
  await new Promise((r) => setTimeout(r, 3000));
}

function isChartDataLoaded(text: string): boolean {
  const macdIdx = text.indexOf('MACD');
  if (macdIdx === -1) return false;
  const closeIdx = text.indexOf('close', macdIdx);
  if (closeIdx === -1) return false;
  const afterClose = text.slice(closeIdx + 'close'.length);
  // Legend renders as "MACD 12 26 close 9" immediately; the 3 computed
  // values (macd/signal/hist) — using TradingView's unicode minus (−) for
  // negatives — only appear once the study has actually calculated.
  return /^\n\d+\n[-−]?\d/.test(afterClose);
}

/**
 * Main function to generate chart screenshot from the TradingView embed widget
 */
export async function generateChartScreenshot(
  symbol: string,
  timeframes: TimeframeValue[],
  config: BrowserConfig = {}
): Promise<Uint8Array> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser(cfg);
    const page: Page = await browser.newPage();
    page.setDefaultTimeout(cfg.timeout);

    const primaryTf = timeframes[0] || '1D';
    const url = buildPreviewUrl(symbol, primaryTf, siteUrl);

    console.log(`[ChartAnalysis] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // The widget script empties the container and inserts the iframe as a
    // direct child (not nested under .tradingview-widget-container__widget —
    // that placeholder div gets wiped out first). Wait for the iframe itself.
    await page.waitForSelector('.tradingview-widget-container iframe', { timeout: 25000 });

    // The chart lives in a cross-origin iframe (tradingview-widget.com), so
    // we can read its rendered text via Puppeteer's frame API even though we
    // can't touch its DOM directly. Poll until the LAST study to render
    // (MACD, in DEFAULT_STUDIES order) has real numeric values next to its
    // legend — its label text appears well before the computed values do,
    // so checking for the label alone produces a chart with blank indicators.
    await waitForChartData(page, cfg.timeout);

    console.log('[ChartAnalysis] Capturing screenshot...');
    const screenshot = new Uint8Array(
      await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: cfg.viewport.width, height: cfg.viewport.height },
      })
    );

    console.log(`[ChartAnalysis] Screenshot captured: ${screenshot.length} bytes`);
    return screenshot;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
