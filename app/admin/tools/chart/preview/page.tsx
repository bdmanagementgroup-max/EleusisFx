import ChartPreviewWidget from "./ChartPreviewWidget";

// No auth guard — this page only renders a TradingView chart embed.
// It is loaded headlessly by the screenshot API to capture chart images.
export default async function ChartPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; interval?: string }>;
}) {
  const params = await searchParams;
  const symbol = params.symbol ?? "FX:EURUSD";
  const interval = params.interval ?? "D";

  return <ChartPreviewWidget symbol={symbol} interval={interval} />;
}
