import { callAgentLLM } from "./llmClient";
import { fetchMarketTA } from "@/lib/trading/indicators";
import type { Instrument } from "./instruments";
import {
  marketAnalystPrompt,
  sentimentAnalystPrompt,
  newsAnalystPrompt,
  bullResearcherPrompt,
  bearResearcherPrompt,
  researchManagerPrompt,
  traderPrompt,
  riskDebatorPrompt,
  portfolioManagerPrompt,
  type AnalystReports,
  type RiskStance,
} from "./prompts";

export type Rating = "Buy" | "Overweight" | "Hold" | "Underweight" | "Sell";
export type TraderAction = "Buy" | "Hold" | "Sell";

export interface AgentBiasResult {
  rating: Rating;
  executiveSummary: string;
  bullCase: string;
  bearCase: string;
  traderAction: TraderAction;
  entryPrice: number | null;
  stopLoss: number | null;
  positionSizing: string | null;
  fullDebate: Record<string, string>;
}

const VALID_RATINGS: Rating[] = ["Buy", "Overweight", "Hold", "Underweight", "Sell"];
const VALID_ACTIONS: TraderAction[] = ["Buy", "Hold", "Sell"];

function parseTaggedField(text: string, tag: string): string | null {
  const re = new RegExp(`^${tag}:\\s*(.+)$`, "im");
  const match = text.match(re);
  return match ? match[1].trim() : null;
}

function parseRating(text: string): { rating: Rating; summary: string } {
  const ratingRaw = parseTaggedField(text, "RATING");
  const summaryRaw = parseTaggedField(text, "SUMMARY");
  const rating = VALID_RATINGS.find((r) => r.toLowerCase() === ratingRaw?.toLowerCase()) ?? "Hold";
  const summary = summaryRaw ?? text.trim().slice(0, 500);
  return { rating, summary };
}

function parseTraderProposal(text: string): {
  action: TraderAction;
  entryPrice: number | null;
  stopLoss: number | null;
  positionSizing: string | null;
} {
  const actionRaw = parseTaggedField(text, "ACTION");
  const action = VALID_ACTIONS.find((a) => a.toLowerCase() === actionRaw?.toLowerCase()) ?? "Hold";
  const entryRaw = parseTaggedField(text, "ENTRY");
  const stopRaw = parseTaggedField(text, "STOP");
  const sizingRaw = parseTaggedField(text, "SIZING");
  const toNumber = (v: string | null) => {
    if (!v || v.toLowerCase() === "n/a") return null;
    const n = Number(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  return {
    action,
    entryPrice: toNumber(entryRaw),
    stopLoss: toNumber(stopRaw),
    positionSizing: sizingRaw && sizingRaw.toLowerCase() !== "n/a" ? sizingRaw : null,
  };
}

export async function runAgentBiasPipeline(instrument: Instrument): Promise<AgentBiasResult> {
  const indicatorText = await fetchMarketTA([{ label: instrument.display, yahoo: instrument.yahoo }]);

  const marketPrompt = marketAnalystPrompt(instrument, indicatorText);
  const sentimentPrompt = sentimentAnalystPrompt(instrument);
  const newsPrompt = newsAnalystPrompt(instrument);

  const [marketRes, sentimentRes, newsRes] = await Promise.all([
    callAgentLLM(marketPrompt.system, marketPrompt.user),
    callAgentLLM(sentimentPrompt.system, sentimentPrompt.user),
    callAgentLLM(newsPrompt.system, newsPrompt.user),
  ]);

  const reports: AnalystReports = {
    market: marketRes.content,
    sentiment: sentimentRes.content,
    news: newsRes.content,
  };

  const bullPrompt = bullResearcherPrompt(instrument, reports);
  const bearPrompt = bearResearcherPrompt(instrument, reports);
  const [bullRes, bearRes] = await Promise.all([
    callAgentLLM(bullPrompt.system, bullPrompt.user),
    callAgentLLM(bearPrompt.system, bearPrompt.user),
  ]);

  const managerPrompt = researchManagerPrompt(instrument, bullRes.content, bearRes.content);
  const managerRes = await callAgentLLM(managerPrompt.system, managerPrompt.user);

  const traderPromptPair = traderPrompt(instrument, managerRes.content);
  const traderRes = await callAgentLLM(traderPromptPair.system, traderPromptPair.user);
  const traderProposal = parseTraderProposal(traderRes.content);

  const stances: RiskStance[] = ["aggressive", "conservative", "neutral"];
  const riskResults = await Promise.all(
    stances.map((stance) => {
      const p = riskDebatorPrompt(stance, instrument, traderRes.content);
      return callAgentLLM(p.system, p.user);
    })
  );
  const riskDebateText = stances
    .map((stance, i) => `${stance.toUpperCase()}:\n${riskResults[i].content}`)
    .join("\n\n");

  const pmPrompt = portfolioManagerPrompt(instrument, traderRes.content, riskDebateText);
  const pmRes = await callAgentLLM(pmPrompt.system, pmPrompt.user);
  const { rating, summary } = parseRating(pmRes.content);

  return {
    rating,
    executiveSummary: summary,
    bullCase: bullRes.content,
    bearCase: bearRes.content,
    traderAction: traderProposal.action,
    entryPrice: traderProposal.entryPrice,
    stopLoss: traderProposal.stopLoss,
    positionSizing: traderProposal.positionSizing,
    fullDebate: {
      marketAnalyst: reports.market,
      sentimentAnalyst: reports.sentiment,
      newsAnalyst: reports.news,
      bullCase: bullRes.content,
      bearCase: bearRes.content,
      investmentPlan: managerRes.content,
      traderPlan: traderRes.content,
      riskDebate: riskDebateText,
      portfolioManager: pmRes.content,
    },
  };
}
