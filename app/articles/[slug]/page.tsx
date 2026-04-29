import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const HARDCODED: Record<string, { tag: string; title: string; excerpt: string; date: string; readTime: string; content: string }> = {
  "what-is-an-ftmo-challenge": {
    tag: "Prop Firms",
    title: "What Is the FTMO Challenge? Complete Guide (2026)",
    excerpt: "Everything you need to know about the FTMO Challenge — phases, trailing drawdown rules, profit targets, and why 90% of traders fail. Updated 2026.",
    date: "June 2025",
    readTime: "8 min read",
    content: `<p>If you have spent any time in the forex or futures trading world, you have almost certainly heard of FTMO. Founded in Prague in 2014, it has grown into one of the largest and most recognised proprietary trading firms on the planet. Their evaluation model offers traders access to significant capital — up to $200,000 — without putting their own money at risk. But before you commit to a challenge, you need to understand exactly how the process works, what the rules are, and — critically — where traders most often go wrong.</p>

<p>This guide walks you through the entire FTMO evaluation process in detail. No marketing fluff, no vague summaries. Just the structure, the rules, and the nuances that matter when real money is on the line.</p>

<h2>What Is a Prop Firm Challenge?</h2>

<p>A <em>proprietary trading firm</em> provides capital to traders who can demonstrate consistent, rule-compliant profitability. Rather than hiring traders as employees, firms like FTMO use an evaluation model. You pay a one-time fee to access a demo trading account. You trade under real conditions. If you hit the profit targets without violating the risk rules, you receive access to a real funded account — typically worth ten to one hundred times the evaluation fee you paid.</p>

<p>Think of it as a skills-based audition with real consequences. The firm sets the parameters. You trade. Pass, and you access genuine capital. The firm keeps a cut of your profits — typically 10–20% — and you keep the rest. The economics are genuinely attractive for a trader with a proven, consistent strategy.</p>

<p>The fundamental appeal is leverage without personal liability. A trader who consistently returns 5–10% per month on a $100,000 funded account is earning $5,000–$10,000 per month while the firm absorbs all the downside risk beyond their own evaluation rules. That is a meaningfully different risk profile from trading your own capital.</p>

<h2>The FTMO Two-Phase Evaluation</h2>

<p>FTMO uses a structured two-phase process before granting access to a funded account. Both phases must be completed successfully. Each phase tests a different aspect of your trading — Phase 1 tests your ability to hit a target, Phase 2 tests whether you can do so consistently and not just by getting lucky once.</p>

<h3>Phase 1 — The FTMO Challenge</h3>

<p>In Phase 1 you must achieve a <strong>10% profit target</strong> on your account balance within a maximum of 30 calendar days. You must also trade on a minimum of 4 separate days — meaning you cannot simply get lucky on a single day, hit the target, and claim a pass. Minimum trading day requirements exist to demonstrate that your results reflect a consistent process, not a single fortunate session.</p>

<p>The risk limits in Phase 1 are firm and non-negotiable. Your account cannot lose more than <strong>5% in a single trading day</strong> (the daily loss limit), and your account can never fall more than <strong>10% below the initial starting balance</strong> (the maximum drawdown). Breach either limit at any point and the challenge ends immediately with no appeal.</p>

<h3>Phase 2 — The Verification</h3>

<p>Phase 2 has a lower profit target — <strong>5%</strong> — but a longer time window of 60 calendar days. The same 5% daily loss limit and 10% maximum drawdown rules apply identically to Phase 1. The minimum of 4 trading days still stands.</p>

<p>The lower target in Phase 2 is intentional. FTMO uses it to verify that Phase 1 was not a fluke. A trader who ran hot in Phase 1 and happened to catch a strong trend might struggle to replicate even 5% in Phase 2 with consistency. The firm is looking for evidence of a sustainable process, not a single lucky streak.</p>

<p>Once Phase 2 is complete and verified, FTMO reviews the account before activating your funded status. There is a mandatory review period between Phase 2 completion and the funded account going live. Once active, you are trading with FTMO's capital and keeping a percentage of every profit payout from that point forward.</p>

<h2>Account Sizes and Challenge Fees</h2>

<p>FTMO offers evaluation challenges across five account sizes, from $10,000 to $200,000. The fee you pay is for the evaluation itself — not a deposit, not a margin requirement. If you pass, the fee is refunded in full with your first profit payout from the funded account. If you fail, the fee is gone, and you need to purchase a new challenge to try again.</p>

<ul>
  <li><strong>$10,000 account</strong> — approximately €155 challenge fee</li>
  <li><strong>$25,000 account</strong> — approximately €250</li>
  <li><strong>$50,000 account</strong> — approximately €345</li>
  <li><strong>$100,000 account</strong> — approximately €540</li>
  <li><strong>$200,000 account</strong> — approximately €1,080</li>
</ul>

<p>Most traders target the $100,000 account as the optimal balance between cost and potential return. At 80% profit split, a single 10% profit month on a $100,000 account generates $8,000 in trader income — a meaningful return on a one-time €540 evaluation fee, provided you pass.</p>

<h2>The Rules in Detail — What Actually Catches Traders Out</h2>

<h3>The Trailing Maximum Drawdown</h3>

<p>This is the single most misunderstood rule in the FTMO evaluation, and it catches experienced traders off guard regularly. FTMO uses a <em>trailing maximum drawdown</em> — meaning the 10% drawdown floor is not fixed at the initial balance permanently. Instead, it rises with your equity peak.</p>

<p>Here is a concrete example. You start a $100,000 challenge. The initial drawdown floor is $90,000. Now suppose you trade well and your equity reaches $110,000. At this point, the drawdown floor rises to $99,000. Your maximum loss from peak is always capped at $10,000 — but that $10,000 is measured from your highest reached equity, not from the starting balance.</p>

<p>The consequence is significant. A trader who front-loads profits early in the challenge is actually narrowing their own margin for error as they go. The better you do, the higher the floor rises, and the less room you have for a losing stretch. This is counterintuitive and is why many traders who pass Phase 1 comfortably still fail Phase 2 — they have less room than they think. Use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to calculate your exact floor at any point in your challenge.</p>

<h3>The Daily Loss Limit — Calculated From Balance, Not Equity</h3>

<p>FTMO's 5% daily loss limit is calculated from your <strong>account balance at the start of the trading day</strong> — not your current floating equity. This distinction matters enormously when you have open positions.</p>

<p>Suppose your account balance is $100,000 at the start of a trading day. Your 5% daily limit is $5,000 — meaning your account cannot drop below $95,000 that day. Now suppose you open a trade that moves against you and sits at a $3,000 floating loss. You are already 60% through your daily limit with no closed trades. Open floating losses count toward the daily limit in real time. Many traders enter a session with open overnight positions without fully accounting for this, and find themselves violating the limit before they have placed a new trade.</p>

<h3>News Trading and Expert Advisors</h3>

<p>FTMO permits news trading — you can hold positions through high-impact releases like NFP, FOMC decisions, and CPI data. This is one of its advantages over firms that restrict news trading entirely. Expert Advisors are also permitted on a single account, provided the algorithm does not exploit latency or coordinate risk across multiple FTMO accounts simultaneously.</p>

<h2>Profit Split and Scaling</h2>

<p>On your funded account, FTMO starts you at an <strong>80% profit split</strong>. After your first payout, you become eligible for the 90% split — keeping $9,000 from every $10,000 in profits. The upgrade requires completing at least one payout cycle and meeting FTMO's consistency criteria.</p>

<p>FTMO also offers a scaling plan for consistently profitable traders. If you average at least 10% monthly return over any four-month period, your account size can be increased by 25%. This can be applied repeatedly, with the theoretical ceiling reaching $2,000,000 in funded capital.</p>

<h2>Why the Pass Rate Is Under 10%</h2>

<p>FTMO's own data, and third-party analysis of the broader prop firm industry, consistently puts the self-directed trader pass rate below 10%. The rules themselves are not the primary cause. A trader generating consistent 2–3% monthly returns with disciplined risk management can satisfy FTMO's requirements comfortably without pushing their strategy to its limits.</p>

<p>The real cause is psychological. When a real fee is on the line, traders abandon the process that made them profitable in the first place. They oversize positions early to build a buffer. They revenge trade after a losing day. They misread the trailing drawdown and believe they have more room than they do.</p>

<p>The evaluation context changes behaviour. That change in behaviour — not the rules — is what ends most challenges. The <a href="/articles/why-traders-fail-prop-firm-evaluation" style="color:#4f8ef7">five specific patterns responsible for most failures</a> are more predictable than most traders realise. For traders who recognise this in themselves, working with an experienced evaluation service is a rational alternative. The rules do not change, but the executor does — and removing emotional variables from a mechanical process produces measurably more consistent outcomes.</p>`,
  },
  "the-3-trade-rule": {
    tag: "Strategy",
    title: "The 3-Trade Rule: Why Overtrading Kills Prop Firm Evaluations",
    excerpt: "The 3-Trade Rule is the single most effective constraint you can put on your prop firm evaluation. Here's the logic behind it and exactly how to implement it. Updated 2026.",
    date: "April 2026",
    readTime: "7 min read",
    content: `<p>Overtrading is the single most common cause of prop firm evaluation failure — not a bad strategy, not bad market conditions, not bad luck. Traders who fail rarely lose in one catastrophic session. They lose incrementally: five trades on a day where their strategy produced two clean setups, positions taken in sessions outside their normal range, entries at slightly worse levels because they needed to be involved. The account drains trade by trade until the daily loss limit is hit or the drawdown floor is breached, and the challenge is over.</p>

<p>The 3-Trade Rule is a hard constraint that prevents this. It is simple, it is inflexible, and it is the most effective single change most traders can make to their evaluation approach. This article explains the logic behind it, the evidence for it, and exactly how to implement it so it actually holds under the conditions where overtrading pressure is highest.</p>

<h2>What the 3-Trade Rule Is</h2>

<p>The rule is exactly what it sounds like. During a prop firm evaluation, you take a maximum of three trades per day. Not three setups — three trades. If your third trade closes and the market offers what looks like a fourth compelling opportunity, you close the platform. The session is over.</p>

<p>Three is not a magic number derived from statistical analysis of optimal trade frequency. It is a ceiling that accounts for the practical reality of how most traders' strategies perform: the first two or three setups in any given session are typically the highest quality. The setups that emerge later in a session are increasingly products of boredom, FOMO, or the desire to recover a loss from an earlier trade. Capping at three eliminates the category of trades that produces the most damage while preserving the category that produces the most consistent results.</p>

<p>The rule applies regardless of session outcome. Whether your first three trades are all winners or all losers, the fourth trade of the day does not happen. The discipline of the rule is not in following it when things are going well. It is in following it when you are down on the day and the market appears to be offering you a chance to recover.</p>

<h2>Why Overtrading Kills Evaluations — The Math</h2>

<p>On a $100,000 FTMO account, the daily loss limit is $5,000. A trader risking 1% per trade risks $1,000 on each position. Five consecutive losing trades wipes the daily limit. That is a realistic scenario across ten trades in a single session — not an extreme edge case.</p>

<p>Now consider the same trader with the 3-Trade Rule in place. Maximum daily loss exposure is $3,000 — three losses at 1% risk each. That is 60% of the daily limit. Even a catastrophic day — all three trades losing — leaves the account alive and the challenge intact. The daily limit is not breached. The next day starts fresh.</p>

<p>The cumulative effect across a 30-day challenge is significant. A trader taking ten trades per day across 22 trading days takes 220 trades. A trader taking three trades per day across the same period takes 66 trades. Every additional trade beyond the optimal setup is a trade where the edge of the strategy is absent or diminished. More trades with lower average quality produces worse outcomes than fewer trades with higher average quality — a mathematical certainty for any strategy with a defined edge.</p>

<p>This compounds further because overtrading degrades the quality of the setups that follow. A trader who has taken six trades in a session and is searching for a seventh is not applying the same criteria they applied to the first trade of the day. Cognitive fatigue, anchoring to the session's P&L, and the desire to end the day on a particular note all distort judgment in ways that are difficult to detect in real time and obvious in retrospect.</p>

<h2>The Psychology Behind It</h2>

<p>Overtrading during a prop firm evaluation is almost never a strategy decision. It is an emotional response to one of three pressures, and understanding which pressure is driving it is essential to controlling it.</p>

<p><strong>Target anxiety.</strong> The profit target is visible and the clock is running. A trader who is behind schedule — whether that is day 8 with 1% profit or day 22 with 6% profit — feels the gap acutely. The impulse to close that gap through additional trades is powerful and largely unconscious. The problem is that taking more trades to catch up on a target is precisely backwards: the trades that close the gap fastest are the highest-risk ones, and high-risk trades under pressure produce the failures that end challenges.</p>

<p><strong>Loss recovery.</strong> A losing morning creates a specific kind of pressure — the desire to make it back before the session ends. This is revenge trading in its mildest form. The trader's original positions were sound, they lost for reasons beyond their control, and now they want the loss back. The trades that follow in this state are rarely at the quality of the trades that preceded them. They are selected not because the setup qualifies but because the trader needs to participate.</p>

<p><strong>Boredom.</strong> The least dramatic but genuinely common cause. A trader finishes two clean trades by 10am and has nothing to do for the rest of the day. The market is moving. There are setups that are close — not quite qualifying by their normal criteria, but close. The temptation to lower the bar slightly is significant when the alternative is watching a screen for hours without acting. These are the trades that cost most challenges the most damage, precisely because they feel so innocuous at the time.</p>

<p>The 3-Trade Rule addresses all three pressures through the same mechanism: it removes the decision. There is no judgment call about whether a fourth trade qualifies. The answer is already decided. This is the value of a hard rule over a soft intention — it functions under the conditions where willpower fails, which is exactly the conditions where overtrading occurs.</p>

<h2>How to Implement It</h2>

<p>The rule works only if it is non-negotiable before the session begins. Setting it as a firm commitment in advance — not as a guideline you will apply with judgment — is what gives it force under pressure. Write it down in your trading plan. State it explicitly before you open the platform each day. The 3-Trade Rule is today's ceiling and there are no exceptions.</p>

<p>Track your trade count visibly during the session. A simple tally on paper or a sticky note on your screen works. Some traders use a physical object — three coins on the desk, moved to the other side with each trade. The physical act of tracking makes the count real in a way that a mental note does not. When the third coin moves, the session ends.</p>

<p>This applies to all positions, not just directional trades. A hedge, a scale-in, a partial close that reopens — each of these counts toward the three. The rule is about trade events, not about the number of positions open simultaneously. Traders who try to find definitional loopholes in the rule are applying the same rationalising judgment that produces overtrading in the first place.</p>

<h2>When the Market Tempts You to Break It</h2>

<p>The moments where the rule is hardest to hold are predictable, and knowing them in advance makes them easier to navigate.</p>

<p><strong>After a winning third trade.</strong> You have had three clean wins and the market is offering what looks like a fourth high-quality setup. This is the most seductive version of the temptation — you are trading well, your judgment feels sharp, and there is no obvious reason to stop. The reason to stop is the rule. A winning third trade is the best possible outcome. Protecting it is more valuable than the marginal additional profit from a fourth.</p>

<p><strong>After two losses.</strong> You are down on the day, your third trade is approaching, and you need it to be a winner. This is where the rule is most important and most frequently broken. The third trade in this state carries the psychological weight of the two losses before it. It needs to be selected by the same criteria as the first trade of the day — not by the pressure of the session outcome. If the third trade loses, the session ends. The loss is absorbed. Tomorrow is a new account balance.</p>

<p><strong>During high-volatility sessions.</strong> NFP days, FOMC days, major earnings releases — sessions where the market moves sharply and opportunities appear abundant. These are the sessions where the daily loss limit is most dangerous and where discipline is most valuable. The 3-Trade Rule does not expand for volatile sessions. If anything, reducing to two trades on high-impact days is a refinement worth considering.</p>

<h2>The Connection to Your Drawdown</h2>

<p>The 3-Trade Rule and drawdown management are directly linked. Every trade you take beyond your optimal setup count increases your daily drawdown exposure without a proportional increase in expected return. Use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to see your exact floor before each session — when the gap between your current equity and your floor is narrow, the case for strict trade limiting becomes even stronger. <a href="/articles/how-to-pass-the-ftmo-challenge" style="color:#4f8ef7">The four-phase week-by-week system</a> already builds the 3-Trade Rule into the daily structure, but the underlying principle is the same regardless of which week of the challenge you are in.</p>

<p>Overtrading is not a separate failure mode from drawdown breaches. It is the mechanism that produces most drawdown breaches. Control the trade count and you control the primary variable that determines whether your challenge survives a bad day or ends on one.</p>

<p>Overtrading is the first of the five failure patterns that account for most evaluation losses. For the complete framework — including the Drawdown Buffer System, the No-Trade Zone Protocol, and the Recovery Protocol — download our free <a href="/eleusis-fx-5-fatal-mistakes.pdf" style="color:#4f8ef7">5 Fatal Mistakes guide</a>. It covers every pattern in the same depth as this article, with the specific rules and daily routines used across 700+ completed evaluations.</p>`,
  },
  "prop-firm-evaluation-service-uk": {
    tag: "Evaluation Service",
    title: "Prop Firm Evaluation Service UK: How It Works & What It Costs",
    excerpt: "How a UK prop firm evaluation service works, what it costs, and what to look for before committing — an honest breakdown of the industry. Updated 2026.",
    date: "April 2026",
    readTime: "8 min read",
    content: `<p>A prop firm evaluation service is a professional trading operation that completes your funded account challenge on your behalf. You purchase the challenge in your own name, share the account credentials with the service, and their traders execute the evaluation according to the firm's rules. When the challenge is passed, the funded account is issued in your name and you take full control from that point forward.</p>

<p>The industry exists because the self-directed pass rate for prop firm evaluations sits below 10% across FTMO and the broader market — a figure that has remained consistent for years regardless of market conditions or improvements in trader education. The reasons for this failure rate are <a href="/articles/why-traders-fail-prop-firm-evaluation" style="color:#4f8ef7">well documented</a> and almost entirely psychological rather than strategic. A professional evaluation service removes the psychological variables that cause traders to deviate from their own strategies under evaluation pressure. The rules do not change. The executor does.</p>

<p>This article covers exactly how the service works, what it costs, which firms it covers, and what separates a legitimate operation from a scam — so you can make a decision with complete information rather than marketing promises.</p>

<h2>What the Service Actually Does</h2>

<p>The mechanics are straightforward. A prop firm <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">evaluation challenge</a> is a demo account with specific profit targets and risk rules. You pay the prop firm a one-time fee to access the account. If you hit the targets without breaching the rules, you receive a real funded account. If you fail, the fee is gone.</p>

<p>A professional evaluation service takes over the execution of that demo account on your behalf. They manage the position sizing, the drawdown, the daily loss limits, the minimum trading day requirements, and the profit targets. The account remains registered in your name throughout. The funded account that results is issued to you — the service's involvement ends when the challenge is passed and the funded account is activated.</p>

<p>What you are paying the service for is professional execution under conditions where most traders' performance degrades. Their traders are not subject to the psychological pressure of the evaluation outcome. They trade the same process every day. That consistency — not a superior strategy — is the source of a meaningfully higher pass rate than the self-directed average.</p>

<h2>How It Works — Step by Step</h2>

<p>The process at a reputable UK evaluation service follows a consistent sequence.</p>

<p><strong>Step 1 — Application.</strong> You submit an enquiry specifying which prop firm and account size you want to pass. The service confirms availability and compatibility — not every firm or programme is equally suited to professional execution, and a legitimate service will tell you which options they can accommodate confidently.</p>

<p><strong>Step 2 — Purchase the challenge.</strong> You buy the evaluation challenge from the prop firm directly, in your own name. The challenge fee goes to the prop firm, not to the evaluation service. This matters: you are the account holder from the first moment.</p>

<p><strong>Step 3 — Payment to the service.</strong> Once the challenge is purchased, you pay the service fee. This is confirmed before trading begins. Reputable services are clear about their fee structure upfront — there are no hidden costs, and the fee does not vary based on the outcome.</p>

<p><strong>Step 4 — Trading.</strong> You share the account login credentials with the service. Their traders execute the evaluation, managing all positions according to the firm's rules. The timeline varies by firm and market conditions, but most challenges are completed well within the firm's maximum time allowance.</p>

<p><strong>Step 5 — Pass confirmation and handover.</strong> When the challenge is completed, you receive pass confirmation from the prop firm. The funded account is activated in your name. Credentials are returned, and the account is entirely yours from this point. You trade it yourself and receive payouts directly from the prop firm under their standard terms.</p>

<h2>What It Costs</h2>

<p>A prop firm evaluation service in the UK involves two separate costs: the prop firm's challenge fee and the service fee.</p>

<p>The challenge fee goes to the prop firm. For a $100,000 FTMO challenge, that is approximately £540. This fee is refunded in full with your first profit payout from the funded account — so if you pass, the challenge fee is effectively zero.</p>

<p>The service fee is what you pay the evaluation service for professional execution. For a $100,000 FTMO challenge, this typically ranges from £800 to £1,500 depending on the service and the specific firm being targeted. The combined cost — challenge fee plus service fee — for a $100,000 funded account is therefore approximately £1,100 to £2,000.</p>

<p>The economics are worth examining directly. A funded $100,000 account at 80% profit split generating 5% per month returns £3,200 in monthly income. The total cost of the evaluation service — including the challenge fee — is recovered in the first month of trading the funded account. Against a realistic baseline where self-directed traders have less than a 10% chance of passing, the service fee represents a meaningful expected-value improvement for anyone who intends to trade the funded account seriously.</p>

<p>A legitimate service also carries a re-trade guarantee: if the evaluation is not passed, they repeat it at no additional cost. This shifts the risk profile significantly. You are not paying for an attempt. You are paying for a pass.</p>

<h2>Which Prop Firms Does an Evaluation Service Cover?</h2>

<p>The most established UK evaluation services work primarily with FTMO, The5ers, and FundedNext — the three firms with the largest trader bases, the clearest rule structures, and the most consistent payout histories. Some services also cover E8 Funding, TopStep, and True Forex Funds, though availability varies.</p>

<p>Not every firm is equally suited to professional execution. Services typically have preferences based on their traders' experience with specific firm rules, platform infrastructure, and which firms' monitoring practices they have the most experience navigating. A reputable service will tell you clearly which firms they work with confidently and which they do not — rather than claiming to cover every firm indiscriminately.</p>

<p>See our <a href="/compare" style="color:#4f8ef7">full prop firm comparison table</a> for a breakdown of rules, fees, and payout structures across the five most popular firms.</p>

<h2>What Separates a Legitimate Service From a Scam</h2>

<p>The evaluation service market contains legitimate operators and fraudulent ones. The warning signs are consistent and identifiable before you commit any money.</p>

<p><strong>No verifiable track record.</strong> A service that has passed hundreds of evaluations will show you the evidence — pass confirmations, funded account notifications, client results with dates and firm references. These documents are not forgeable in any useful sense. Generic testimonials with no verifiable detail are not a substitute. Ask to see completed evaluations. A legitimate service produces them immediately.</p>

<p><strong>Unconditional pass guarantees.</strong> No service can guarantee a pass in an absolute sense. Market conditions, platform outages, and rule changes are outside anyone's control. A legitimate service offers a re-trade commitment if they fail — not a promise of a 100% success rate with no conditions.</p>

<p><strong>No re-trade policy.</strong> If a service takes your fee, fails the evaluation, and offers nothing in return, they are not operating in good faith. The standard model for credible services is a clear re-trade commitment — they absorb the cost of a failure rather than passing it to the client.</p>

<p><strong>Automated execution at scale.</strong> Some operations run algorithmic strategies across hundreds of simultaneous evaluation accounts. These are flagged quickly by prop firms and produce inconsistent outcomes when market conditions deviate from the algorithm's parameters. A professional service employs human traders executing with genuine discretion — their results look like skilled individual traders, not systematic patterns.</p>

<p><strong>Longevity and volume.</strong> Services that scam clients or fail at scale do not survive long in a market where reputation travels quickly. A service operating since 2019 with 700+ completed evaluations has a verifiable history across multiple market regimes, multiple firms, and multiple challenge types. That track record is the most reliable signal available.</p>

<h2>Who It Is For — and Who It Is Not For</h2>

<p>A prop firm evaluation service is not the right choice for every trader. If you are at an early stage of building a strategy and want to use the evaluation process to test it under realistic pressure, completing the challenge yourself — even if you fail — gives you information about your process and your psychology that has value beyond the funded account. Failure in a self-directed evaluation is expensive but educational.</p>

<p>The service is the right choice when the gap between your strategy's performance under normal conditions and its performance under evaluation pressure is the primary problem. If you have a working strategy, a track record on your own account, and a history of performing differently when a fee is on the line — that is exactly the situation a professional service resolves. The strategy is sound. The execution context is the problem.</p>

<p>It is also the rational choice for traders who simply want the funded account without the time cost of managing a live evaluation process. Your time has value. The combined cost of the challenge fee and service fee, compared against weeks of your own time at elevated psychological cost with a meaningful probability of failure, is often a straightforward calculation — particularly when the alternative is starting again from scratch.</p>

<p>Whether you decide to use a service or attempt the evaluation yourself, understanding <a href="/articles/can-someone-else-trade-your-prop-firm-evaluation" style="color:#4f8ef7">the legal position and what to look for in a legitimate service</a> is essential before committing money to either route.</p>`,
  },
  "ftmo-vs-the5ers": {
    tag: "Funding",
    title: "FTMO vs The5ers: Which Is Easier to Pass in 2026?",
    excerpt: "FTMO vs The5ers compared — profit targets, drawdown rules, time limits, and which prop firm is genuinely easier to pass for UK traders. Updated 2026.",
    date: "April 2026",
    readTime: "8 min read",
    content: `<p>FTMO and The5ers are two of the most established prop firms in the industry and they are frequently compared by traders trying to decide where to spend their evaluation fee. The question most people are actually asking is a simple one: which is easier to pass? The honest answer is more nuanced than either firm's marketing suggests — and it depends almost entirely on what kind of trader you are.</p>

<p>This comparison cuts through the surface-level numbers to focus on what actually determines whether you pass or fail: the drawdown methodology, the time pressure, the daily risk limits, and the trading restrictions that catch most traders off guard. By the end you will have a clear answer for your specific situation.</p>

<h2>Background</h2>

<p>FTMO was founded in Prague in 2014 and is the most recognised name in the prop firm evaluation industry. Over a decade of consistent payouts and a global trader base have given it a credibility that newer firms cannot replicate. Its <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">two-phase evaluation model</a> has become the template that most of the industry has copied.</p>

<p>The5ers was founded in 2016 in Israel and operates differently from most prop firms in one significant way: it started with a low-and-grow model, offering small initial accounts that scale aggressively on performance. It has since expanded its programme offering but retains a reputation for being structured around traders who want to build capital over time rather than access large sums immediately. Both firms are legitimate and have genuine payout track records — the choice between them is a strategic one, not a trust question.</p>

<h2>Profit Targets — The5ers Wins Clearly</h2>

<p>FTMO requires a <strong>10% profit target in Phase 1</strong> and <strong>5% in Phase 2</strong>. The5ers requires <strong>6% in Phase 1 and Phase 2</strong>. On a $100,000 account, that is the difference between needing $10,000 and needing $6,000 to clear the first phase.</p>

<p>The lower target has a compounding effect on strategy. A trader generating 1.5% per week needs roughly seven weeks of performance to hit FTMO's Phase 1 target. The same trader needs roughly four weeks to hit The5ers' target. Both firms allow Phase 1 to run for the same period — except FTMO gives you 30 days and The5ers gives you unlimited time. The5ers' lower target, combined with no time pressure, means the same trader with the same strategy has a structurally wider path to passing Phase 1 at The5ers than at FTMO.</p>

<h2>Time Limits — The5ers Wins Decisively</h2>

<p>FTMO gives you <strong>30 calendar days for Phase 1</strong> and <strong>60 days for Phase 2</strong>. The5ers has <strong>no time limit on either phase</strong>. This is one of the most underappreciated differences between the two firms, and it is probably the single biggest factor in pass rates.</p>

<p>The 30-day clock at FTMO creates pressure that does not exist in the evaluation rules themselves. A trader whose strategy generates consistent 1–2% weekly returns should pass the FTMO Challenge comfortably in 30 days. But the clock introduces urgency, and urgency produces the kind of decision-making — oversizing positions, trading outside your setup criteria, forcing trades in poor conditions — that ends challenges. The time limit is not a risk rule. It is a psychological variable that degrades performance.</p>

<p>The5ers' unlimited time window removes that variable entirely. If the market is not producing setups that fit your strategy, you wait. If you have a bad week, you absorb it without the compounding pressure of a shrinking clock. For traders whose strategy is less suited to generating returns on demand within a fixed window — swing traders, macro traders, traders who are selective about session timing — The5ers' structure is a materially better fit.</p>

<h2>Drawdown Rules — More Complex Than They Appear</h2>

<p>Both firms enforce a daily loss limit and a maximum drawdown, but the numbers and methodology differ in ways that matter significantly for how you trade.</p>

<h3>FTMO — Trailing Maximum Drawdown, Wider Daily Limit</h3>

<p>FTMO's daily loss limit is <strong>5%</strong> of your account balance at the start of each day. Its maximum drawdown is <strong>10%</strong> — but critically, this is a <em>trailing</em> drawdown. The floor rises with your equity peak. If your $100,000 account reaches $108,000, the floor moves up to $98,000. The better your early performance, the less room you have for a bad stretch. Use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to monitor your exact floor throughout the challenge.</p>

<h3>The5ers — Static Maximum Drawdown, Tighter Daily Limit</h3>

<p>The5ers uses a <strong>4% daily loss limit</strong> — one percentage point tighter than FTMO — and a <strong>5% maximum drawdown</strong> that is <em>static</em>, anchored to the initial account balance and never rising. If you start at $100,000, your floor is always $95,000, regardless of how high your equity goes.</p>

<p>The practical effect of these two approaches is significant. FTMO's trailing system means a strong start narrows your margin; The5ers' static system means a strong start leaves your margin untouched. However, The5ers' lower absolute drawdown limit (5% vs 10%) means there is less total room to absorb losses in the first place. A trader who loses 5% in a single bad stretch at The5ers has breached the limit and failed. The same loss at FTMO — assuming the daily limit was not breached — leaves the account still active with 5% of drawdown room remaining.</p>

<p>For conservative traders who rarely experience significant drawdown periods, The5ers' tighter limits are manageable. For traders whose equity curves involve natural retracements of 6–8% during normal strategy operation, The5ers' 5% maximum is a structural problem that no amount of skill can trade around. FTMO's 10% maximum — even with the trailing mechanism — accommodates a wider range of trading styles.</p>

<h2>Trading Restrictions</h2>

<p><strong>News trading:</strong> FTMO permits holding positions through high-impact economic releases — NFP, FOMC, CPI. The5ers does not. Positions must be closed before major scheduled releases. For traders whose strategy involves taking positions into macro events or holding through them as part of normal trade management, The5ers' restriction is a material compatibility issue.</p>

<p><strong>Minimum trading days:</strong> FTMO requires at least 4 days of trading across each phase. The5ers has no minimum trading day requirement. You could, theoretically, pass The5ers' evaluation in 2 sessions if the trades go well. This is a structural advantage for traders whose strategy involves concentrated, infrequent positioning.</p>

<p><strong>Expert Advisors:</strong> Both firms permit EAs on a single account. Both restrict coordinated strategies across multiple accounts simultaneously.</p>

<p><strong>Weekend holding:</strong> FTMO permits holding positions over weekends. The5ers also permits this, though gap risk remains the trader's responsibility at both firms.</p>

<h2>Profit Split and Account Scaling</h2>

<p>FTMO starts funded traders at an <strong>80% profit split</strong>, upgradeable to <strong>90%</strong> after the first payout cycle. Its scaling plan can take an account to $2,000,000 in funded capital over time, triggered by consistent 10% average monthly returns over four-month windows.</p>

<p>The5ers offers up to a <strong>100% profit split</strong> — the highest in the industry — though this applies to their specific programme tiers and is not universally available across all account sizes from day one. Their scaling structure is designed around lower initial capital with aggressive growth: a successful trader at The5ers can scale their account size rapidly through performance rather than paying for larger accounts upfront. The ceiling is lower than FTMO's ($400,000 vs $2,000,000) but the starting costs are also substantially lower.</p>

<h2>Challenge Fees — The5ers Is Significantly Cheaper</h2>

<p>FTMO's $100,000 challenge fee is approximately £540. The5ers' equivalent programme is approximately £95–£200 depending on the programme tier and account size. For traders who want to attempt an evaluation at lower cost — including those who have failed a previous attempt and are starting again — The5ers' lower entry point is a genuine advantage. Both firms refund the fee with the first profit payout from the funded account.</p>

<h2>Which Is Easier to Pass — The Direct Answer</h2>

<p>For the majority of retail traders, The5ers is structurally easier to pass. The lower profit target (6% vs 10%), the absence of a time limit, the no minimum trading day requirement, and the lower challenge fee all favour The5ers as the environment where a trader with a consistent but modest strategy is most likely to succeed.</p>

<p>The exceptions are meaningful. If your strategy involves significant retracements as part of normal operation, The5ers' 5% maximum drawdown is a hard constraint that FTMO's 10% limit accommodates much better. If you trade news events or use macro positioning as a core part of your approach, The5ers' restrictions make it an incompatible environment. And if your long-term goal is to access $500,000 or more in funded capital, FTMO's scaling ceiling is the only realistic path.</p>

<p>The question is not which firm is objectively better. It is which firm's structure is most compatible with how you actually trade. A swing trader with a low-frequency, low-drawdown strategy will find The5ers significantly more accommodating. A news trader with a strategy built around macro catalysts will find FTMO the only viable option. Everything else falls somewhere in between.</p>

<p>For a full side-by-side breakdown across five prop firms — including E8 Funding, FundedNext, and True Forex Funds — see our <a href="/compare" style="color:#4f8ef7">complete prop firm comparison table</a>.</p>`,
  },
  "how-to-pass-the-ftmo-challenge": {
    tag: "Strategy",
    title: "How to Pass the FTMO Challenge in 30 Days (Step-by-Step)",
    excerpt: "The exact week-by-week approach to passing the FTMO Challenge — position sizing, drawdown management, and the four-phase system that produces consistent results. Updated 2026.",
    date: "April 2026",
    readTime: "10 min read",
    content: `<p>The FTMO Challenge gives you 30 calendar days to hit a 10% profit target on a demo account without breaching a 5% daily loss limit or a 10% maximum drawdown. On paper that is not a difficult brief. A trader generating 0.5% per day — barely above break-even — clears the target comfortably with a week to spare. In practice, fewer than 10% of traders who attempt it receive a funded account.</p>

<p>The gap between what the rules require and what traders actually produce is not a strategy problem. Most traders who fail have a strategy that, under normal conditions, would satisfy FTMO's requirements without exceptional effort. The problem is that the evaluation context — real money, real deadline, real consequences — changes how people trade in ways that almost always make their performance worse. The fix is not a better strategy. It is a structured approach that removes the decisions that kill challenges before they even get started.</p>

<p>This is the week-by-week system. It is built on what works across hundreds of completed evaluations, not on theory. Follow the structure, and the target takes care of itself.</p>

<h2>What FTMO Is Actually Testing</h2>

<p>Before the week-by-week breakdown, it is worth being precise about what FTMO's evaluation is designed to measure. It is not testing whether you can generate 10% in a month. Any trader with a working strategy and a streak of good trades can do that. It is testing whether you can generate 10% <em>without breaching the risk rules</em> — which is a fundamentally different thing.</p>

<p>The daily loss limit and maximum drawdown rules are the actual test. The profit target is the carrot that gets traders into positions they would not otherwise take. The rules are what separate traders who have genuine risk discipline from traders who have been lucky on their personal account. Every week of a 30-day challenge is a test of whether your risk management holds under pressure — and pressure is highest in week one, when the emotional impulse to build a buffer early is at its strongest.</p>

<p>Understanding this reframes the whole approach. You are not trying to make as much money as possible in 30 days. You are trying to make enough money while not making any catastrophic decisions. Those are different goals, and they require a different mindset.</p>

<h2>The Week-by-Week Breakdown</h2>

<h3>Week 1 — Calibration (Days 1–7)</h3>

<p>The single most important week of the challenge. More challenges end in week one than in any other period — not because of bad luck, but because traders enter with the wrong objective. The instinct in week one is to build a buffer. Get to 4–5% quickly, then trade the rest of the challenge conservatively. The problem is that building a buffer requires taking larger positions or more frequent trades than your strategy normally calls for — and that is exactly how the daily loss limit gets breached before the challenge has properly started.</p>

<p>Week 1 protocol: maximum 2 trades per day, 1% risk per trade, no exceptions. Target 0–2% total profit across the week. This feels painfully slow. It is supposed to. The purpose of week 1 is calibration — you are re-establishing the habits and execution patterns that your strategy was built on, not chasing a target. Any profit in week 1 is a bonus. What matters is that you finish the week with your drawdown intact and your process intact.</p>

<p>The traders who pass consistently are the ones who enter week 2 slightly ahead of schedule rather than scrambling to recover from an early loss. Conservative week ones produce comfortable week twos. Aggressive week ones produce broken challenges.</p>

<h3>Week 2 — Execution (Days 8–16)</h3>

<p>By day 8 you should have a clear read on market conditions, your strategy is running at its normal tempo, and the pressure to perform is starting to build. This is the week where you step up — slightly. Maximum 3 trades per day, 1–1.5% risk per trade. Target 3–5% total profit across the week. If you hit 5% cumulative by the end of week 2, you are in an excellent position. If you are at 3%, you are still on track.</p>

<p>The discipline in week 2 is sticking to your trade selection criteria exactly. The market will offer setups that are close to what your strategy looks for but not quite there — lower timeframe entries, weaker confluences, pairs you do not normally trade. The pressure to participate is real. Resist it. Your strategy has an edge on specific setups. Trading outside those setups produces random outcomes, and random outcomes in week 2 can derail a challenge that was previously on track.</p>

<p>Review your trades at the end of each day in week 2. Not to judge the P&L — to judge the process. Did you enter on criteria, or on impatience? The answer to that question is a better leading indicator of how the challenge will end than the running profit figure.</p>

<h3>Week 3 — Push (Days 17–23)</h3>

<p>Week 3 is where the challenge is won or lost for most traders. If you have followed the week 1 and week 2 protocols, you should be somewhere between 4% and 7% in profit by day 17. The target is 10%. You have roughly 13 days left. The math is straightforward — you need 3–6% more, and you have nearly two weeks to produce it.</p>

<p>Raise your quality bar, not your position size. In week 3, only take setups that score a 9 or higher on your own criteria. Trade maximum 3 times per day. Risk stays at 1–1.5%. The difference between week 3 and week 2 is that you are now more selective, not more aggressive. When the market gives you a genuinely strong setup, take it with full conviction. When conditions are uncertain or your strategy is not producing clean signals, sit on your hands.</p>

<p>Target 7–8% cumulative profit by the end of week 3. If you hit that, week 4 becomes a formality. If you are at 5–6%, you are still in a strong position. What you do not want is to enter week 4 needing 4–5% in the final week — that pressure produces the kind of desperation trading that ends challenges on day 28.</p>

<h3>Week 4 — Protect and Cross the Line (Days 24–30)</h3>

<p>The objective in week 4 changes completely. You are no longer trying to grow the account. You are trying to not lose what you have built. Drop back to 2 trades per day maximum. Reduce your lot size by 25% from your week 3 standard. The profit target is close — your job is to cross the line cleanly, not to add a few extra percent you do not need.</p>

<p>The most common week 4 mistake is continuing to trade at week 3 intensity when the challenge is nearly won. Traders who are at 8% with six days left take unnecessary trades because they are bored, or because a setup looks good, or because they want to finish at 12% rather than 10%. Those unnecessary trades produce unnecessary risk, and unnecessary risk in week 4 is how traders blow challenges they had essentially already passed.</p>

<p>Once you hit 10%, stop trading for the day. Once the minimum trading day requirement is satisfied — FTMO requires at least 4 trading days — there is no rule that says you must continue. Protecting the pass is more valuable than adding marginally to the profit figure.</p>

<h2>The Three Numbers That End Most Challenges</h2>

<p>Regardless of which week you are in, three numbers govern everything. Know them precisely before every session.</p>

<p><strong>Your daily loss limit in pounds or dollars.</strong> On a $100,000 account, FTMO's 5% daily limit is $5,000. This resets from your account balance at the start of each day — not from your current equity. If you are holding an open position with a $2,000 floating loss, you have already consumed 40% of your daily limit before placing a new trade. Account for open positions before sizing any new entry.</p>

<p><strong>Your trailing drawdown floor.</strong> FTMO's maximum drawdown is not fixed at 10% below your starting balance. It trails upward with your equity peak. If your account has reached $107,000, your drawdown floor is now $97,000 — not the original $90,000. The better your first two weeks go, the more constrained your floor becomes. Use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to calculate your exact floor before every session. Many traders discover the <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">trailing drawdown rule</a> only when they have already breached it.</p>

<p><strong>Your minimum trading days count.</strong> FTMO requires at least 4 days of active trading across the challenge period. This catches traders who try to complete the challenge in two or three exceptional sessions. Track your day count from day one — you cannot pass without satisfying it, regardless of your profit figure.</p>

<h2>Position Sizing — The Only Number That Actually Matters</h2>

<p>Every mistake traders make during an FTMO challenge can be traced back to a single source: position sizes that are too large for the risk rules in play. Overleveraging in week one causes most early failures. Revenge trading after a loss is overleveraging by another name. Even strategy drift often manifests as taking a borderline setup at normal size rather than passing on it — one more expression of the same underlying problem.</p>

<p>The calculation is straightforward. On a $100,000 account with a 1% risk rule, you are risking $1,000 per trade. Five losing trades in a week costs you $5,000 — exactly your daily limit on a bad day. That is the boundary. Trade inside it with every position, every session, every day of the challenge. When in doubt, size down rather than up. A half-size trade on a borderline setup costs you half the loss if it fails. The upside difference is marginal. The downside difference is significant.</p>

<p>The <a href="/articles/why-traders-fail-prop-firm-evaluation" style="color:#4f8ef7">five patterns that end most challenges</a> all share a position sizing component. Overleveraging is the most obvious. But revenge trading is also a position sizing failure — it is the decision to risk more after a loss to recover faster. Strategy drift often leads to the same outcome via a different route. Controlling position size is not one element of passing the challenge. It is the central discipline that every other element depends on.</p>

<h2>What to Do After a Losing Day</h2>

<p>You will have a losing day during the challenge. Assume it. Plan for it now rather than improvising when it happens. A structured response to a losing day is the difference between a temporary setback and a challenge-ending spiral.</p>

<p>The protocol is simple. After a losing day — defined as any day where you close with a net loss — you do one thing before the next session: you reduce your maximum daily trade count by one. If you normally take three trades, take two tomorrow. If you normally take two, take one. This is not a punishment. It is a circuit breaker that forces you to be more selective on the session immediately following a loss, which is when the pressure to recover is highest and the judgment is least reliable.</p>

<p>You do not increase position size to recover. You do not trade pairs or sessions outside your normal range. You do not set a mental target of making back yesterday's loss before the week ends. The challenge has 30 days. One losing day, managed correctly, is a minor event. One losing day managed incorrectly — by revenge trading, oversizing, or trading outside your criteria — is frequently how challenges end.</p>

<h2>When to Stop Trading and Lock In the Pass</h2>

<p>The question traders rarely think about before starting a challenge: at what point do you stop? The instinctive answer is when you hit 10%. The correct answer is slightly more nuanced.</p>

<p>Once you hit 10%, stop trading for the remainder of that day. The following day, assess whether you still need more trading days to satisfy the 4-day minimum. If yes, trade one session with your smallest lot size, take one clean setup, and close. If your minimum days are already satisfied and you are at 10% or above, the challenge is done. Close the platform.</p>

<p>The psychological pull to keep trading once a target is hit is well-documented. It feels like leaving money on the table. What it actually is is taking on risk you do not need to take. A challenge passed at 10.1% is identical in value to one passed at 14%. There is no prize for margin. Once the target is crossed and the rules are satisfied, every additional trade is pure downside risk with no meaningful upside. The correct decision is always to stop.</p>

<p>If you want the full day-by-day structure — including the exact metrics, position sizing tables, and the protocol for handling every type of setback — download our free <a href="/eleusis-fx-30-day-blueprint.pdf" style="color:#4f8ef7">30-Day Evaluation Blueprint</a>. It covers the same framework used across every challenge we have passed for 700+ clients since 2019.</p>`,
  },
  "why-traders-fail-prop-firm-evaluation": {
    tag: "Strategy",
    title: "Why 90% of Traders Fail Their Prop Firm Evaluation",
    excerpt: "The 5 failure patterns that account for most prop firm evaluation failures — and why most have nothing to do with your strategy. Updated 2026.",
    date: "May 2025",
    readTime: "7 min read",
    content: `<p>The statistics around prop firm evaluations are sobering. Across FTMO and the broader industry, fewer than 10% of traders who start a challenge ever receive a funded account. That number has remained stubbornly consistent for years, through bull markets and bear markets, through the explosion in prop firm popularity, and through improvements in trader education. Nine out of ten people who pay for an evaluation walk away with nothing.</p>

<p>What is striking about this figure is not just its scale — it is the consistency of the reasons behind it. The same five failure patterns show up again and again. And most of them have very little to do with whether the trader has a genuinely profitable strategy.</p>

<h2>Failure Pattern 1 — Overleveraging in the Opening Days</h2>

<p>The most common single cause of challenge failure. A trader starts their evaluation, wants to build a comfortable buffer before anything goes wrong, and takes positions that are too large relative to what their strategy normally calls for. The logic is understandable: if they can get to 5% profit quickly, they have breathing room for the rest of the challenge. The problem is that the same trade that might generate 5% also has the potential to generate a 5% loss — and that is the daily limit gone in a single session.</p>

<p>On a $100,000 account, the FTMO daily loss limit is $5,000. For a trader using conservative 1% risk per trade, that is five simultaneous losses before the day ends the challenge. For a trader who has sized up to chase the target quickly, it might be one. The asymmetry is brutal: the upside of a lucky day is that you are ahead of schedule. The downside of an unlucky day is that the challenge is over.</p>

<p>Experienced traders treat the first week of a challenge the same way they would treat a new live account — conservatively, mechanically, with no concessions to impatience. The profit target is achievable over 30 days with modest consistent returns. Treating it like a sprint is the most reliable way to fail it.</p>

<h2>Failure Pattern 2 — Revenge Trading After a Loss</h2>

<p>The second pattern emerges later in the challenge. A trader has a losing day — not a rule-breaking loss, just a normal drawdown that any strategy encounters. In a regular week on a personal account, they would accept the loss and return the next day. But in a challenge, the losing day creates a new problem: the clock is still running, the profit target is still ahead, and the gap feels bigger than it did yesterday.</p>

<p>So the trader adjusts. They enter trades they would not normally take. They increase their position size to recover the ground faster. They stay in trades past their normal exit criteria. This is revenge trading — and it ends challenges at a rate second only to the initial overleveraging mistake.</p>

<p>The cruel irony is that the trader's original strategy is usually still valid. One normal losing day has been compounded into a challenge-ending sequence of emotional decisions. Research on decision-making under pressure consistently shows that high-stakes environments cause people to revert to instinctive, fast-thinking behaviour — and for most traders, that instinct is to trade more, trade bigger, and recover the loss immediately. This is precisely the opposite of what a prop firm evaluation rewards.</p>

<h2>Failure Pattern 3 — Misunderstanding the Drawdown Calculation</h2>

<p>The third failure pattern is the most avoidable, because it stems from a factual misunderstanding rather than a psychological one. Many traders incorrectly believe that the 5% daily loss limit resets each morning from their current equity. It does not. It resets from their <em>account balance</em> as it stood at the start of that day.</p>

<p>In practice this means that open floating losses count toward the daily limit in real time. A trader who holds a position running at a $2,000 floating loss has already consumed 40% of their daily limit before placing a single new trade. If the position moves another $3,000 against them, the challenge ends — not because they made a new trade mistake, but because they did not account correctly for the position they were already holding.</p>

<p>For FTMO specifically, there is an additional layer: the <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">trailing maximum drawdown</a>. The 10% maximum drawdown floor rises as your equity peak rises. A trader who has built their account from $100,000 to $108,000 now has a drawdown floor of $98,000 — not the original $90,000. The better you perform early in the challenge, the less room you have for a bad stretch. Many traders discover this rule only when they have already breached it. Knowing your exact floor before each session eliminates this uncertainty — use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to calculate it in real time.</p>

<h2>Failure Pattern 4 — Strategy Drift Under Pressure</h2>

<p>The fourth pattern describes traders who do not abandon their strategy all at once, but who gradually drift away from it as the evaluation pressure builds. They start taking trades at slightly worse entry points because they are worried about missing a move. They hold positions slightly longer than their rules dictate. They trade pairs they do not normally trade because one looks good today.</p>

<p>Individually, none of these deviations look catastrophic. Collectively, they transform a tested, proven strategy into something that no longer resembles it. The edge that the strategy was built on erodes incrementally until it is gone.</p>

<p>Strategy drift is particularly common among traders who have never written down their rules explicitly. When the rules exist only as informal habits, the pressure of an evaluation creates enough ambiguity to allow small deviations to feel justified. A rigid, documented trading plan is one of the most effective defences against this pattern — not because the plan itself is perfect, but because having one makes deviations visible and deliberate rather than gradual and unnoticed.</p>

<h2>Failure Pattern 5 — Overtrading Low-Probability Setups</h2>

<p>The fifth pattern emerges when a trader is partway through a challenge and behind target. There are two weeks left, the profit target is 6% away, and the calendar shows only modest setups on the horizon. The rational response is to trade only the highest-quality setups and accept that profit might accumulate slowly. The common response is to start trading setups that would not normally qualify — lower timeframes, weaker confluences, pairs outside the normal watchlist.</p>

<p>This overtrading of low-probability setups produces a series of small losing trades that each feel like near-misses. The win rate is lower than the strategy's normal performance, the risk-reward ratios are compressed, and the cumulative effect on drawdown is significant. The trader ends the challenge having taken twice as many trades as normal and achieving a fraction of their usual performance.</p>

<p>The correct discipline in this situation is counterintuitive: if you are behind target and the market is not producing high-quality setups, the right move is often to trade less, not more. Preserve the drawdown. Wait for the conditions your strategy is built for.</p>

<h2>The Common Thread — Context Changes Behaviour</h2>

<p>What unites all five patterns is a single underlying dynamic: the evaluation context changes how traders make decisions, usually in ways that hurt their performance. The same trader who executes calmly and methodically on a personal account becomes a different trader when a fee is on the line and a clock is running. This is not a character flaw. It is a well-documented feature of human decision-making under high-stakes conditions.</p>

<p>This is precisely why professional evaluation services exist. The value of using an experienced team to execute an evaluation is not that their strategy is necessarily better than yours. It is that their execution is not subject to the psychological pressures that reliably cause traders to deviate from their own strategies. The process becomes mechanical, not emotional — and mechanical execution of a sound strategy is exactly what prop firm evaluations reward.</p>

<p>Understanding these five patterns is useful regardless of which path you choose. If you plan to attempt your own evaluation, knowing what is likely to derail you before it happens is genuinely valuable. If you decide that the psychological variables are too significant a risk, a professional evaluation service is an equally rational conclusion.</p>`,
  },
  "can-someone-else-trade-your-prop-firm-evaluation": {
    tag: "Evaluation Service",
    title: "Can Someone Else Trade Your Prop Firm Evaluation? (UK Law & Legitimacy)",
    excerpt: "The honest answer to the question every serious trader asks — is using a prop firm evaluation service legal, legitimate, and worth it? Updated 2026.",
    date: "April 2026",
    readTime: "9 min read",
    content: `<p>If you have spent any time researching how to pass a prop firm evaluation, you have almost certainly come across the idea of using an evaluation service — a professional trading operation that completes the challenge on your behalf. And if you have been considering it, you have probably also asked yourself some version of the same question: is this actually legal? Is it legitimate? And what happens if the prop firm finds out?</p>

<p>These are the right questions. This article gives you honest answers — not a sales pitch, not vague reassurance. The reality of how prop firm evaluation services work, what the legal and regulatory position in the UK is, what prop firms actually say in their terms of service, and how to tell a legitimate service from a scam. By the end you will have enough information to make a decision you are comfortable with.</p>

<h2>Is It Against the Law?</h2>

<p>In the United Kingdom, there is no law that prohibits a third party from trading a prop firm evaluation account on your behalf. This is not a legal grey area in the criminal sense — no trading regulations, FCA rules, or consumer protection statutes make this practice illegal. You are purchasing a demo evaluation account. The credentials belong to you. Who operates the account is a commercial matter between you and whoever you choose to work with, not a matter for regulators.</p>

<p>This is materially different from situations where third-party trading would carry legal risk — such as using someone else's identity to open a brokerage account, or submitting falsified trading records. Prop firm evaluations are not brokerage accounts in the regulated sense. They are proprietary internal assessments run by private firms on demo infrastructure. The FCA does not regulate who trades a MetaTrader 4 demo account.</p>

<p>The question of legality, then, is not the right frame for this decision. The more relevant question is whether it violates the prop firm's terms of service — and what the consequences of that are.</p>

<h2>What Prop Firms Actually Say in Their Terms</h2>

<p>Most major prop firms — FTMO, The5ers, FundedNext, TopStep — prohibit account sharing in their terms of service. The language varies, but the intent is consistent: the evaluation is supposed to be completed by the person who purchased it. This is because the funded account that follows is issued to that individual, and the firm's assumption is that the trader who passed the evaluation is the one who will manage the funded account going forward.</p>

<p>In practice, enforcement is limited and inconsistent. Prop firms monitor for patterns that suggest coordinated trading across multiple accounts — the kind of behaviour that might indicate an automated service running a systematic strategy across hundreds of simultaneous evaluations. What they are not doing is verifying the identity of the individual behind each mouse click on each individual evaluation.</p>

<p>The practical consequence of violating the ToS is account termination — not a legal penalty, not a financial liability, not a mark on any record. If the firm identifies that an account was traded by a third party, they can void the evaluation and refuse to issue the funded account. The fee paid is not refunded. That is the downside risk. It is a real risk, and worth understanding clearly before making a decision — but it is a commercial risk, not a legal one.</p>

<p>Legitimate evaluation services are acutely aware of this. The way they operate — trading conservatively, avoiding extreme correlation patterns, managing exposure carefully — is designed to produce clean, normal-looking trading accounts that do not trigger the flags prop firms use to identify suspicious activity. The pass rate of a reputable service is in part a function of how well they manage this. An operation running a blunt algorithmic strategy across thousands of accounts simultaneously is flagged quickly. A professional trading desk executing with genuine discretion is indistinguishable from a skilled individual trader.</p>

<h2>The 90% Failure Rate Is the Context You Need</h2>

<p>To understand why the prop firm evaluation service industry exists at all, you need to sit with one number: fewer than 10% of traders who purchase an evaluation ever receive a funded account. That figure has held steady for years — across FTMO's own published data and third-party analysis of the broader prop firm market. It does not change materially with account size, experience level, or market conditions.</p>

<p>The reasons for this failure rate are well-documented. They are not primarily about strategy. A trader who generates consistent 2–3% monthly returns in normal market conditions should be able to satisfy FTMO's requirements without exceptional difficulty. The rules are demanding, but they are not designed to be impossible. What they are designed to do — intentionally or not — is expose the gap between how a trader performs on their own account and how they perform when a real fee is on the line and a clock is running.</p>

<p>Evaluation context changes behaviour. The same trader who executes calmly and methodically under normal conditions oversizes positions when trying to build a buffer, revenge trades after a losing day, and abandons their process when the profit target feels distant. This is not a character flaw — it is a well-documented feature of decision-making under high-stakes conditions. And it is exactly what a professional evaluation service removes from the equation. The traders executing on behalf of clients are not personally exposed to the evaluation's outcome. They trade the same process they trade every day. The emotional variable that derails individual performance simply does not exist in the same way.</p>

<h2>How a Prop Firm Evaluation Service Works</h2>

<p>The mechanics are straightforward. You purchase the prop firm challenge in your own name — you are the account holder, the entity to whom any funded account will be issued. You then share the trading credentials with the service, who execute the evaluation on your behalf. The service manages the position sizing, the drawdown, the profit targets, and the minimum trading day requirements. When the evaluation is complete and the funded account is activated, it is in your name and under your control from that point forward.</p>

<p>A reputable prop firm evaluation service in the UK will be transparent about this process, will have a verifiable track record of completed evaluations, and will offer some form of protection if they fail — typically a re-trade at no additional cost. They will also be clear about which firms they work with and what their performance history looks like across different challenge types and account sizes.</p>

<p>The fee you pay the service is separate from the challenge fee you pay the prop firm. You are paying for professional execution — the same way a business owner pays a professional to handle a task that requires specialist skill under conditions where the cost of failure is significant.</p>

<h2>What Separates a Legitimate Service From a Scam</h2>

<p>The prop firm evaluation service market has legitimate operators and it has fraudulent ones. The latter typically share a set of common characteristics that make them identifiable before you commit any money.</p>

<p><strong>Guaranteed pass with no caveats.</strong> No evaluation service can guarantee a pass in an absolute sense — market conditions, platform issues, and firm rule changes are all outside any service's control. A legitimate service will offer a re-trade guarantee if they fail, not a promise of a 100% success rate with no conditions attached.</p>

<p><strong>No verifiable track record.</strong> Legitimate services will show you completed evaluations — pass confirmations, funded account notifications, client results with dates and account references. Generic testimonials with no verifiable detail are a warning sign. A track record of 700+ completed evaluations across FTMO, The5ers, FundedNext and others is something you can interrogate. Generic five-star reviews cannot be verified.</p>

<p><strong>Upfront fees with no re-trade policy.</strong> A service that takes your money, fails the evaluation, and offers nothing in return is not operating in good faith. The standard model for credible services is a one-time fee with a clear re-trade commitment if the evaluation is not passed.</p>

<p><strong>No real traders behind the operation.</strong> Some operations run fully automated strategies across evaluation accounts — high volume, low discretion, easily flagged by prop firms and prone to failure when market conditions deviate from the algorithm's parameters. A professional service employs actual human traders with verifiable trading histories. The people executing your evaluation should be able to demonstrate that they trade for a living.</p>

<h2>The Track Record Question</h2>

<p>In a market where trust is the core product, track record is everything. The question to ask any evaluation service is not "what is your pass rate?" — anyone can claim any number — but "can you show me completed evaluations?" Pass confirmations from FTMO and other firms are not forgeable in any useful sense. A service that has completed evaluations at scale will have these on file and will share them without hesitation.</p>

<p>Scale also matters for a different reason. A service that has completed 50 evaluations is a different proposition from one that has completed 700. At scale, you are not relying on a fortunate run of good market conditions. You are looking at performance across different regimes, different firms, different challenge types, and different account sizes. Consistency across that volume is evidence of a genuine process, not luck.</p>

<p>The prop firm evaluation service industry is small enough that reputation travels quickly. Firms that scam clients, fail evaluations and disappear, or get flagged and banned by prop firms do not survive long. Longevity and volume are the two most reliable proxies for legitimacy available to you.</p>

<h2>Who Should Use an Evaluation Service — and Who Shouldn't</h2>

<p>An evaluation service is not the right choice for every trader. If you are at an early stage of developing a strategy and using the evaluation process to test it under realistic pressure, completing the challenge yourself — even if you fail — gives you information about your own trading that has value beyond the funded account. The psychological pressure of an evaluation reveals things about your process that normal demo trading does not.</p>

<p>But if you have a strategy that works, a trading history that demonstrates it, and you are failing evaluations repeatedly because the evaluation context is producing different behaviour than your normal trading — that is exactly the situation an evaluation service is designed to address. The strategy is sound. The execution environment is the problem. Changing the executor changes the outcome.</p>

<p>The same logic applies to traders who simply do not want to spend weeks managing a live evaluation process when a funded account is the goal. Your time has value. The evaluation fee plus a professional service fee, weighed against weeks of your own time at elevated psychological cost, is often a straightforward calculation — particularly when the alternative is a meaningful probability of failure and a full refund of nothing.</p>

<p>Whether you decide to trade your own evaluation or use a professional service, the question of legitimacy has a clear answer: in the UK, it is not illegal. The ToS risk is real and should be understood clearly. And the quality of whoever executes the evaluation — whether that is you or a professional team — is the primary determinant of the outcome.</p>`,
  },
  "ftmo-vs-true-forex-funds": {
    tag: "Funding",
    title: "FTMO vs True Forex Funds: Which Prop Firm Is Right for You? (2026)",
    excerpt: "FTMO vs True Forex Funds compared — drawdown methodology, profit targets, payout timing, and trading restrictions. Full prop firm comparison UK, updated 2026.",
    date: "April 2025",
    readTime: "9 min read",
    content: `<p>FTMO and True Forex Funds are two of the most established names in the proprietary trading industry. Both run two-phase evaluation models, both offer accounts up to $200,000, and both have genuine track records of paying funded traders. But they are meaningfully different — in their drawdown methodology, their profit targets, their restrictions on trading behaviour, and the economics of their payout structures. Choosing the wrong firm for your style of trading does not just make the evaluation harder. It can make passing structurally unlikely no matter how well you trade.</p>

<h2>Background and Credibility</h2>

<p>FTMO was founded in Prague in 2014. It is widely considered the oldest and most established prop firm operating the <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">challenge-based funding model</a>, and its payout history — running for over a decade — is essentially unquestioned in the industry. At the peak of prop firm popularity in 2022–2024, FTMO reported paying out hundreds of millions of dollars to traders globally. The brand recognition and trust it carries is genuinely significant in a sector where legitimacy is not always guaranteed.</p>

<p>True Forex Funds was founded in 2021 in the United States. It entered the market during the period of rapid prop firm expansion and has built a solid reputation for paying consistently and operating cleanly. It does not have a decade of track record, but it has a meaningful one. Both firms are legitimate — the credibility gap is real but not the primary deciding factor for most traders.</p>

<h2>Evaluation Structure — Targets and Time</h2>

<p>Both firms use two-phase evaluations, but the specific targets differ in one important way. FTMO requires a <strong>10% profit target in Phase 1</strong> within 30 calendar days. True Forex Funds requires only <strong>8% in Phase 1</strong> within 30 days. Phase 2 is identical at 5% for both, with a 60-day window. Both require a minimum of 4 trading days per phase.</p>

<p>The 2% difference in Phase 1 target might seem modest, but it has a practical effect on how aggressively you need to trade. A $100,000 FTMO account requires $10,000 in profit to clear Phase 1. A TFF account requires $8,000. For a trader generating consistent 1–1.5% weekly returns, this is the difference between needing roughly 7 weeks of performance and needing roughly 5–6 weeks. Within a 30-day window, the additional buffer TFF provides is meaningful.</p>

<h2>The Drawdown Distinction — The Critical Difference</h2>

<p>Both firms enforce a 5% daily loss limit and a 10% maximum drawdown. The surface-level numbers are identical. But the methodology behind the maximum drawdown rule is fundamentally different, and it has a larger practical impact on evaluation strategy than any other single factor.</p>

<h3>FTMO — Trailing Maximum Drawdown</h3>

<p>FTMO uses a <em>trailing maximum drawdown</em>. The 10% drawdown floor is calculated from your highest reached equity, not from the original starting balance. If you start at $100,000 and trade up to $110,000, your drawdown floor rises to $99,000. You now have only $11,000 of room before breaching the limit. The floor continues to rise with every new equity peak. The better you perform early in the evaluation, the more constrained your subsequent margin for error becomes.</p>

<h3>True Forex Funds — Static Maximum Drawdown</h3>

<p>True Forex Funds uses a <em>static maximum drawdown</em>. The floor is always calculated from the initial account balance and never moves. If you start at $100,000, the floor is always $90,000 — regardless of how high your equity reaches during the evaluation. A trader who reaches $115,000 in equity still has $25,000 of drawdown room from their high-water mark, because the floor is anchored to the starting balance, not the peak.</p>

<p>This distinction matters enormously for traders whose strategies involve periods of natural retracement, or who are trading longer time frames where an equity curve does not move in a straight line. Under FTMO's trailing system, a strong early performance followed by a consolidation period can put you in a position where you have very little room to absorb normal drawdown. Under TFF's static system, that same strong early performance leaves you with more absolute room to manage.</p>

<h3>Daily Loss Limit — Identical at Both Firms</h3>

<p>Both firms calculate the 5% daily loss limit from the account balance at the start of the trading day, not from current floating equity. Open positions count toward the daily limit in real time. This rule is equally unforgiving at both firms and catches traders who hold overnight positions without accounting for unrealised losses when sizing new positions the following session.</p>

<h2>Trading Restrictions</h2>

<p><strong>FTMO permits news trading.</strong> You can hold positions through high-impact releases like NFP, FOMC decisions, and CPI data. For macro traders and those whose strategy involves taking positions into economic events, this is a significant advantage.</p>

<p><strong>True Forex Funds restricts news trading.</strong> Positions cannot be opened or held within two minutes either side of major scheduled releases. For swing traders or macro traders whose strategy involves event-driven setups, this restriction is a material compatibility problem — it cannot be worked around.</p>

<ul>
  <li><strong>Expert Advisors:</strong> Both firms permit EAs on a single account; both restrict coordinated multi-account strategies</li>
  <li><strong>Weekend holding:</strong> Both firms permit holding positions over weekends; gap risk is the trader's responsibility at both</li>
  <li><strong>Copy trading:</strong> Both firms prohibit using third-party signal copying services</li>
</ul>

<h2>Profit Split and Payout Timing</h2>

<p>FTMO starts funded traders at an <strong>80% profit split</strong> and upgrades to <strong>90%</strong> after the first successful payout, subject to consistency criteria. On a $100,000 funded account returning 8% per month, the difference between 80% and 90% split is $800 per month — $9,600 per year. The upgrade is earned, not automatic, but achievable for consistent performers.</p>

<p>True Forex Funds offers an <strong>80% profit split</strong> with no automatic pathway to a higher percentage. The split is fixed for the life of the funded account under standard terms. For a high-performing trader, this means consistently leaving money on the table compared to an FTMO account at the upgraded split.</p>

<p>On payout timing, TFF has a practical advantage. After the initial funded account activation period, TFF allows on-demand payouts — you can request a withdrawal at any point once your account is in profit. FTMO processes payouts on a monthly cycle. For traders managing cash flow or who want faster access to profits, TFF's structure is more convenient.</p>

<h2>Challenge Fees and Scaling</h2>

<p>The evaluation fees are broadly comparable. FTMO's $100,000 challenge fee is approximately €540. True Forex Funds' equivalent is approximately $495. Both firms refund the fee with your first profit payout on the funded account — the fee is effectively zero-cost if you pass.</p>

<p>FTMO's scaling plan can take a trader to $2,000,000 in funded capital, triggered by consistent 10% average monthly returns over four-month periods. True Forex Funds' scaling ceiling is approximately $400,000. For traders with long-term ambitions to compound their funded account significantly, FTMO's scaling ceiling is materially higher.</p>

<h2>Which Firm Is Right for You</h2>

<h3>Choose FTMO if:</h3>
<ul>
  <li>Your strategy generates consistent, relatively linear returns without large retracements</li>
  <li>You trade through or around major news events and need that flexibility</li>
  <li>You want the maximum profit split available in the industry — up to 90%</li>
  <li>You intend to scale toward larger capital over time and want the higher ceiling</li>
  <li>The decade-long track record and brand credibility of the most established firm matters to you</li>
</ul>

<h3>Choose True Forex Funds if:</h3>
<ul>
  <li>Your equity curve involves natural retracements that a trailing drawdown would penalise</li>
  <li>You trade multi-day or multi-week positions where the static drawdown floor gives you more room</li>
  <li>Your strategy does not involve news trading and you are comfortable with the restriction</li>
  <li>You prefer faster, on-demand access to your profits rather than a monthly payout cycle</li>
  <li>The lower Phase 1 profit target of 8% is a better fit for your expected monthly performance</li>
</ul>

<h2>The Verdict</h2>

<p>FTMO remains the gold standard of the prop firm industry — the largest, most established, and most lucrative for high performers. Its trailing drawdown rule is the main drawback, and it is a significant one for aggressive traders who build equity quickly and then face a tighter floor.</p>

<p>True Forex Funds offers a more forgiving drawdown structure, lower Phase 1 target, and more flexible payouts. For traders who want a slightly less punishing evaluation environment — particularly swing traders and macro traders — it is a serious contender that should not be dismissed simply because of FTMO's larger brand presence.</p>

<p>Neither firm is objectively better. The right choice depends on your strategy's typical return profile, your trading style, and how you respond to drawdown risk. Both firms are legitimate, both pay out reliably, and both can serve as the foundation for a funded trading career.</p>

<p>Comparing more prop firms? See our <a href="/compare" style="color:#4f8ef7">full prop firm comparison table</a> covering FTMO, The5ers, FundedNext, E8, TopStep, and more.</p>`,
  },
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export async function generateStaticParams() {
  const hardcodedSlugs = Object.keys(HARDCODED).map((slug) => ({ slug }));
  try {
    const supabase = await getSupabaseAdminClient();
    const { data } = await supabase.from("articles").select("slug").eq("published", true);
    const dbSlugs = (data ?? []).map((r) => ({ slug: r.slug }));
    const all = [...hardcodedSlugs];
    for (const s of dbSlugs) {
      if (!all.find((x) => x.slug === s.slug)) all.push(s);
    }
    return all;
  } catch {
    return hardcodedSlugs;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `https://eleusisfx.uk/articles/${slug}`;
  try {
    const supabase = await getSupabaseAdminClient();
    const { data } = await supabase.from("articles").select("title, excerpt").eq("slug", slug).eq("published", true).single();
    if (data) return {
      title: `${data.title} — Eleusis FX`,
      description: data.excerpt ?? "",
      alternates: { canonical },
      openGraph: { title: data.title, description: data.excerpt ?? "", type: "article", url: canonical },
    };
  } catch {}
  const article = HARDCODED[slug];
  if (!article) return {};
  return {
    title: `${article.title} — Eleusis FX`,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: { title: article.title, description: article.excerpt, type: "article", url: canonical },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let tag: string, title: string, date: string, readTime: string, content: string;

  try {
    const supabase = await getSupabaseAdminClient();
    const { data } = await supabase
      .from("articles")
      .select("category, title, excerpt, published_at, read_time, content")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (data) {
      tag = data.category ?? "Trading";
      title = data.title;
      date = formatDate(data.published_at);
      readTime = data.read_time ? `${data.read_time} min read` : "";
      // Prefer DB content if substantial; fall back to hardcoded if DB has stub/empty content
      const dbContent = data.content ?? "";
      const hardcoded = HARDCODED[slug];
      content = (dbContent.length > 500 || !hardcoded)
        ? dbContent
        : hardcoded.content;
      if (!readTime && hardcoded) readTime = hardcoded.readTime;
    } else {
      const h = HARDCODED[slug];
      if (!h) notFound();
      ({ tag, title, date, readTime, content } = h);
    }
  } catch {
    const h = HARDCODED[slug];
    if (!h) notFound();
    ({ tag, title, date, readTime, content } = h);
  }

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 72 }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "80px 56px 120px" }}>
          <Link
            href="/articles"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)", textDecoration: "none", marginBottom: 48, transition: "color 0.2s" }}
          >
            ← Back to Articles
          </Link>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#4f8ef7", marginBottom: 24 }}>
            <span style={{ width: 16, height: 1, background: "#4f8ef7", display: "inline-block" }} />
            {tag}
          </div>

          <h1 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 24 }}>
            {title}
          </h1>

          <div style={{ display: "flex", gap: 24, marginBottom: 60, paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.88)" }}>Eleusis FX</span>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.58)" }}>{date}</span>
            {readTime && <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.58)" }}>{readTime}</span>}
          </div>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: content }} />

          <div style={{ marginTop: 80, padding: "48px 40px", background: "#0A1428", border: "1.5px solid #4f8ef7", borderRadius: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#4f8ef7", marginBottom: 16 }}>
              Eleusis FX — Evaluation Service
            </div>
            <h3 style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: "clamp(20px, 3vw, 28px)", letterSpacing: -0.5, marginBottom: 16, color: "#f4f7ff" }}>
              Want a guaranteed pass?
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(210,220,240,0.75)", marginBottom: 32, maxWidth: 520 }}>
              Our traders handle your entire evaluation — you get the funded account. 87% pass rate across FTMO, The5ers, FundedNext & more. If we don't pass, we re-trade it free.
            </p>
            <Link
              href="/#apply"
              style={{ display: "inline-block", padding: "14px 32px", background: "#4f8ef7", color: "#fff", fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" as const, textDecoration: "none", borderRadius: 4, transition: "opacity 0.2s" }}
            >
              Apply Now →
            </Link>
          </div>
        </article>
      </main>
      <Footer />

      <style>{`
        .article-body { font-size: 16px; line-height: 1.85; color: rgba(232,234,240,0.75); }
        .article-body h2 {
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 700; font-size: 24px; color: #e8eaf0;
          margin: 48px 0 20px; letter-spacing: -0.5px;
        }
        .article-body h3 {
          font-family: var(--font-syne), Syne, sans-serif;
          font-weight: 600; font-size: 18px; color: #e8eaf0;
          margin: 32px 0 16px;
        }
        .article-body p { margin-bottom: 20px; }
        .article-body strong { color: #e8eaf0; font-weight: 600; }
        .article-body em { color: #7eb3ff; font-style: italic; }
        .article-body ul { list-style: none; padding: 0; margin-bottom: 20px; }
        .article-body ul li {
          padding: 10px 0 10px 28px; position: relative;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: rgba(232,234,240,0.6);
        }
        .article-body ul li::before {
          content: '→'; position: absolute; left: 0; color: #4f8ef7; font-size: 12px;
        }
        @media (max-width: 1024px) {
          article { padding: 60px 20px 80px !important; }
        }
      `}</style>
    </>
  );
}
