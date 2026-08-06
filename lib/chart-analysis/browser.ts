/**
 * Chart Analysis Browser Automation
 * Uses Playwright to navigate TradingView, apply indicators/drawings, and capture screenshots
 */

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
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
  timeout: 300000, // 5 minutes
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

/**
 * Wait for TradingView chart to fully load
 */
async function waitForChartLoad(page: Page): Promise<void> {
  // Wait for the chart widget to be present
  await page.waitForSelector('[data-name="chart-widget"]', { timeout: 60000 });

  // Wait for network to be idle (chart data loaded)
  await page.waitForLoadState('networkidle', { timeout: 60000 });

  // Additional wait for chart rendering
  await page.waitForTimeout(3000);
}

/**
 * Apply indicators via TradingView UI
 */
async function applyIndicators(page: Page): Promise<void> {
  try {
    // Click the "Indicators" button (fx icon in toolbar)
    const indicatorsButton = page.locator('[data-name="indicator-button"], [title*="Indicator" i], button:has-text("Indicators")').first();
    await indicatorsButton.waitFor({ state: 'visible', timeout: 10000 });
    await indicatorsButton.click();

    // Wait for indicators dialog
    await page.waitForSelector('[data-name="indicators-dialog"], [role="dialog"]:has-text("Indicators")', { timeout: 10000 });

    // Add EMA 20
    await addIndicator(page, 'Moving Average Exponential', '20');
    // Add EMA 50
    await addIndicator(page, 'Moving Average Exponential', '50');
    // Add EMA 200
    await addIndicator(page, 'Moving Average Exponential', '200');
    // Add RSI
    await addIndicator(page, 'Relative Strength Index', '14');
    // Add MACD
    await addIndicator(page, 'MACD', '12,26,9');
    // Add Volume (usually built-in)

    // Close dialog - press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch (err) {
    console.warn('Failed to apply some indicators:', err);
    // Try to close any open dialog
    await page.keyboard.press('Escape').catch(() => {});
  }
}

async function addIndicator(page: Page, name: string, params: string): Promise<void> {
  try {
    // Search for indicator
    const searchInput = page.locator('[data-name="indicator-search-input"], input[placeholder*="Search" i]').first();
    await searchInput.fill(name);
    await page.waitForTimeout(500);

    // Click the indicator result
    const indicatorItem = page.locator(`[data-name="indicator-item"]:has-text("${name}"), [role="option"]:has-text("${name}")`).first();
    await indicatorItem.waitFor({ state: 'visible', timeout: 5000 });
    await indicatorItem.click();
    await page.waitForTimeout(500);

    // If parameters needed, set them (for EMA length)
    if (params && name.includes('Moving Average')) {
      const lengthInput = page.locator('input[data-name="input-length"], input[placeholder*="Length" i]').first();
      if (await lengthInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lengthInput.fill(params);
        await page.keyboard.press('Enter');
      }
    }

    // For MACD, set fast/slow/signal
    if (name === 'MACD') {
      await page.waitForTimeout(300);
    }
  } catch (err) {
    console.warn(`Failed to add indicator ${name}:`, err);
  }
}

/**
 * Draw support/resistance lines and trend lines
 * This is complex with TradingView's drawing toolbar - we'll use keyboard shortcuts
 */
async function drawKeyLevels(page: Page, ohlcv: { high: number[]; low: number[]; close: number[] }): Promise<void> {
  try {
    // Calculate recent swing highs/lows for S/R levels
    const highs = ohlcv.high;
    const lows = ohlcv.low;
    const closes = ohlcv.close;
    const n = closes.length;

    // Find recent swing highs (peak higher than neighbors)
    const swingHighs: number[] = [];
    const swingLows: number[] = [];

    for (let i = 2; i < n - 2; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
        swingHighs.push(highs[i]);
      }
      if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
        swingLows.push(lows[i]);
      }
    }

    // Get most recent 3-4 levels
    const recentResistance = swingHighs.slice(-3).reverse();
    const recentSupport = swingLows.slice(-3).reverse();

    // Use drawing tools - horizontal line tool (shortcut: H)
    // This is very brittle - TradingView's drawing API isn't exposed
    // We'll skip automated drawing and rely on LLM vision to identify levels

    console.log('Calculated S/R levels (for reference):', { recentResistance, recentSupport });
  } catch (err) {
    console.warn('Failed to calculate/draw key levels:', err);
  }
}

/**
 * Capture high-resolution screenshot of the chart area
 */
async function captureChartScreenshot(page: Page): Promise<Uint8Array> {
  // Try to find the chart container
  const chartContainer = page.locator('[data-name="chart-widget"], .chart-container, .chart-widget').first();

  if (await chartContainer.isVisible({ timeout: 5000 }).catch(() => false)) {
    return await chartContainer.screenshot({ type: 'png', animations: 'disabled' });
  }

  // Fallback: full page screenshot
  return await page.screenshot({
    type: 'png',
    fullPage: false,
    animations: 'disabled',
    clip: { x: 0, y: 0, width: 1920, height: 1080 },
  });
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
    browser = await chromium.launch({
      headless: cfg.headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    const context: BrowserContext = await browser.newContext({
      viewport: cfg.viewport,
      deviceScaleFactor: cfg.deviceScaleFactor,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page: Page = await context.newPage();
    page.setDefaultTimeout(cfg.timeout);

    // Navigate to primary timeframe (usually daily)
    const primaryTf = timeframes[0] || '1D';
    const url = getTradingViewUrl(symbol, primaryTf);

    console.log(`[ChartAnalysis] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for chart to load
    await waitForChartLoad(page);

    // Apply indicators
    console.log('[ChartAnalysis] Applying indicators...');
    await applyIndicators(page);

    // Wait for indicators to render
    await page.waitForTimeout(3000);

    // Draw key levels (best effort)
    await drawKeyLevels(page, ohlcvData);

    // Wait for drawings to render
    await page.waitForTimeout(2000);

    // Capture screenshot
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