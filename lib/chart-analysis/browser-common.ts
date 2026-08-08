/**
 * Shared puppeteer launch logic for both chart-analysis renderers
 * (the TradingView-embed pipeline in browser.ts and the self-hosted
 * price-action pipeline in browser-price-action.ts).
 */

import type { Browser } from 'puppeteer-core';

export interface BrowserConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  deviceScaleFactor?: number;
  timeout?: number;
}

export const DEFAULT_BROWSER_CONFIG: Required<BrowserConfig> = {
  headless: true,
  // Extra height so the price pane + any sub-panes fit in one shot
  viewport: { width: 1920, height: 1600 },
  deviceScaleFactor: 2,
  timeout: 90000,
};

export async function launchBrowser(cfg: Required<BrowserConfig>): Promise<Browser> {
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
