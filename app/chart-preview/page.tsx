import ChartPreviewWidget, { type StudyConfig } from "./ChartPreviewWidget";

// No auth guard, no admin shell — this page only renders a TradingView chart
// embed. It is loaded headlessly by chart-screenshot/chart-analysis to
// capture chart images, so it must render nothing but the widget itself.
export default async function ChartPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; interval?: string; studies?: string }>;
}) {
  const params = await searchParams;
  const symbol = params.symbol ?? "FX:EURUSD";
  const interval = params.interval ?? "D";

  let studies: StudyConfig[] | undefined;
  if (params.studies) {
    try {
      studies = JSON.parse(params.studies);
    } catch {
      // Fall back to plain comma-separated study IDs with default inputs
      studies = params.studies.split(",").map((id) => ({ id }));
    }
  }

  return <ChartPreviewWidget symbol={symbol} interval={interval} studies={studies} />;
}
