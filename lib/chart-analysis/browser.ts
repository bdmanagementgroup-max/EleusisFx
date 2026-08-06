/**
 * Chart Analysis Browser Automation
 * Uses puppeteer-core + @sparticuz/chromium (Vercel-compatible headless Chrome —
 * same pattern as /api/admin/chart-screenshot) to navigate TradingView,
 * apply indicators/drawings, and capture screenshots.
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
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
  timeout: 90000,
};

/**
 * Convert Yahoo symbol to TradingView symbol format
 */
export function getTradingViewUrl(symbol: string, timeframe: TimeframeValue = '1D'): string {
  // TradingView public chart URL format
  // For forex: TVC:EURUSD, for crypto: BINANCE:BTCUSDT
  const tvSymbol = symbol
    .replace('=X', '')
    .replace('-USD', 'USDT');

  let prefix = 'TVC:';
  if (['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT'].includes(tvSymbol)) {
    prefix = 'BINANCE:';
  }

  // Timeframe mapping for TradingView
  const tfMap: Record<TimeframeValue, string> = {
    '4H': '240',
    '1D': 'D',
    '1W': 'W',
  };

  return `https://www.tradingview.com/chart/?symbol=${prefix}${tvSymbol}&interval=${tfMap[timeframe]}`;
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
 * Wait for TradingView chart to fully load
 */
async function waitForChartLoad(page: Page): Promise<void> {
  await page.waitForSelector('[data-name="chart-widget"]', { timeout: 60000 });
  await page.waitForNetworkIdle({ idleTime: 1000, timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 3000));
}

/**
 * Apply indicators via TradingView UI
 */
async function applyIndicators(page: Page): Promise<void> {
  try {
    const indicatorsButton = page.locator(
      '[data-name="indicator-button"], [title*="Indicator" i], button ::-p-text(Indicators)'
    );
    await indicatorsButton.setTimeout(10000).click();

    await page.waitForSelector('[data-name="indicators-dialog"], [role="dialog"]', { timeout: 10000 });

    await addIndicator(page, 'Moving Average Exponential', '20');
    await addIndicator(page, 'Moving Average Exponential', '50');
    await addIndicator(page, 'Moving Average Exponential', '200');
    await addIndicator(page, 'Relative Strength Index', '14');
    await addIndicator(page, 'MACD', '12,26,9');
    // Volume is usually shown by default

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 1000));
  } catch (err) {
    console.warn('Failed to apply some indicators:', err);
    await page.keyboard.press('Escape').catch(() => {});
  }
}

async function addIndicator(page: Page, name: string, params: string): Promise<void> {
  try {
    const searchInput = page.locator('[data-name="indicator-search-input"], input[placeholder*="Search" i]');
    await searchInput.setTimeout(5000).fill(name);
    await new Promise((r) => setTimeout(r, 500));

    const indicatorItem = page.locator(`[data-name="indicator-item"] ::-p-text(${name})`);
    await indicatorItem.setTimeout(5000).click();
    await new Promise((r) => setTimeout(r, 500));

    if (params && name.includes('Moving Average')) {
      const lengthInput = page.locator('input[data-name="input-length"], input[placeholder*="Length" i]');
      await lengthInput.setTimeout(2000).fill(params).catch(() => {});
      await page.keyboard.press('Enter').catch(() => {});
    }
  } catch (err) {
    console.warn(`Failed to add indicator ${name}:`, err);
  }
}

/**
 * Support/resistance levels are computed for reference only — automated
 * drawing via TradingView's toolbar isn't reliable enough to script, so the
 * LLM vision pass identifies levels visually from the rendered chart instead.
 */
function calculateKeyLevels(ohlcv: { high: number[]; low: number[]; close: number[] }): void {
  const highs = ohlcv.high;
  const lows = ohlcv.low;
  const n = ohlcv.close.length;

  const swingHighs: number[] = [];
  const swingLows: number[] = [];

  for (let i = 2; i < n - 2; i++) {
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      swingHighs.push(highs[i]);
    }
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      swingLows.push(lows[i]);
    }
  }

  const recentResistance = swingHighs.slice(-3).reverse();
  const recentSupport = swingLows.slice(-3).reverse();

  console.log('Calculated S/R levels (for reference):', { recentResistance, recentSupport });
}

/**
 * Capture high-resolution screenshot of the chart area
 */
async function captureChartScreenshot(page: Page): Promise<Uint8Array> {
  const chartContainer = await page.$('[data-name="chart-widget"], .chart-container, .chart-widget');

  if (chartContainer) {
    return new Uint8Array(await chartContainer.screenshot({ type: 'png' }));
  }

  return new Uint8Array(
    await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    })
  );
}

/**
 * Main function to generate chart screenshot from TradingView
 */
export async function generateChartScreenshot(
  symbol: string,
  timeframes: TimeframeValue[],
  ohlcvData: { high: number[]; low: number[]; close: number[] },
  config: BrowserConfig = {}
): Promise<Uint8Array> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser(cfg);
    const page = await browser.newPage();
    page.setDefaultTimeout(cfg.timeout);
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const primaryTf = timeframes[0] || '1D';
    const url = getTradingViewUrl(symbol, primaryTf);

    console.log(`[ChartAnalysis] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await waitForChartLoad(page);

    console.log('[ChartAnalysis] Applying indicators...');
    await applyIndicators(page);
    await new Promise((r) => setTimeout(r, 3000));

    calculateKeyLevels(ohlcvData);

    console.log('[ChartAnalysis] Capturing screenshot...');
    const screenshot = await captureChartScreenshot(page);

    console.log(`[ChartAnalysis] Screenshot captured: ${screenshot.length} bytes`);
    return screenshot;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate screenshots for multiple timeframes
 */
export async function generateMultiTimeframeScreenshots(
  symbol: string,
  timeframes: TimeframeValue[],
  ohlcvByTimeframe: Record<TimeframeValue, { high: number[]; low: number[]; close: number[] }>,
  config: BrowserConfig = {}
): Promise<Map<TimeframeValue, Uint8Array>> {
  const results = new Map<TimeframeValue, Uint8Array>();

  for (const tf of timeframes) {
    try {
      const ohlcv = ohlcvByTimeframe[tf];
      if (!ohlcv) {
        console.warn(`[ChartAnalysis] No OHLCV data for ${tf}, skipping`);
        continue;
      }

      const screenshot = await generateChartScreenshot(symbol, [tf], ohlcv, config);
      results.set(tf, screenshot);
    } catch (err) {
      console.error(`[ChartAnalysis] Failed to generate ${tf} screenshot:`, err);
    }
  }

  return results;
}
