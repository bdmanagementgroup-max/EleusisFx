import ChartPreviewWidgetPA from "./ChartPreviewWidgetPA";

// No auth guard, no admin shell — this page only renders the price-action
// chart. It is loaded headlessly by browser-price-action.ts to capture chart
// images, so it must render nothing but the widget itself (same pattern as
// app/chart-preview/page.tsx for Config 1).
export default async function ChartPreviewPriceActionPage({
  searchParams,
}: {
  searchParams: Promise<{ ohlcv?: string; setup?: string }>;
}) {
  const params = await searchParams;

  if (!params.ohlcv || !params.setup) {
    throw new Error("chart-preview-pa requires both ohlcv and setup query params");
  }

  const ohlcv = JSON.parse(params.ohlcv);
  const setup = JSON.parse(params.setup);

  return <ChartPreviewWidgetPA ohlcv={ohlcv} setup={setup} />;
}
