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
  "what-happens-if-you-fail-ftmo-challenge": {
    tag: "Prop Firms",
    title: "What Happens If You Fail Your FTMO Challenge? (And What to Do Next)",
    excerpt: "What actually happens when you fail the FTMO Challenge — the financial consequences, the reset options, and the honest question of whether to retry alone or use a service. Updated 2026.",
    date: "April 2026",
    readTime: "7 min read",
    content: `<p>You failed your FTMO Challenge. The account is closed, the fee is gone, and you are looking at a dashboard that shows exactly where it went wrong. It is a specific kind of deflating — not the sharp loss of a bad live trade, but the slower realisation that weeks of effort have produced nothing tangible. Before you decide what to do next, it is worth understanding precisely what failing means, what it does not mean, and what your actual options are.</p>

<h2>What Actually Happens When You Fail</h2>

<p>When a challenge-ending rule is breached — the daily loss limit, the maximum drawdown, or the challenge time limit expiring below the profit target — FTMO closes the evaluation account immediately. There is no grace period, no appeal, and no partial credit for how close you came. The account stops as soon as the breach is detected, often in real time during a live session.</p>

<p>The challenge fee is not refunded. This is the core financial consequence. For a $100,000 account, that is approximately €540. It is gone. FTMO's terms are explicit on this: the fee covers access to the evaluation, not a guaranteed pass. Failing to satisfy the evaluation conditions means the fee has been consumed for the period of access you received.</p>

<p>Nothing else happens. There is no mark against your account, no blacklisting, no impact on any future FTMO application. You can purchase a new challenge immediately under the same name and email address. FTMO does not penalise repeated attempts — their revenue model is partly built on traders retrying after failure, which is a fact worth sitting with when you assess your next move.</p>

<h2>The Reset Options</h2>

<p>FTMO offers two paths after a failed challenge.</p>

<p><strong>Purchase a new challenge.</strong> You pay the full fee again and start from scratch with a clean account at the original balance. There are no discounts for returning challengers under standard terms. The new challenge has no connection to the failed one — your previous trading history does not carry over, and there is no disadvantage from the prior failure beyond the cost of the fee.</p>

<p><strong>Free Retry (if applicable).</strong> FTMO periodically offers a free retry option for challenges that meet specific criteria — typically accounts that breached the maximum drawdown but remained above the daily loss limit, and where the trading activity demonstrates genuine effort. Eligibility is assessed by FTMO internally and is not guaranteed. If you receive a free retry offer, it covers a new evaluation at the same account size at no additional fee. These offers are not automatic and are at FTMO's discretion.</p>

<p>Beyond FTMO's own options, a third path exists: using a professional evaluation service for the retry rather than attempting it yourself again. This is worth examining honestly.</p>

<h2>Why Most Failures Happen at the Same Point</h2>

<p>Before deciding what to do next, it is worth identifying precisely where the challenge ended and why. FTMO's challenge dashboard shows a complete trade history. Look at the day the account was closed and trace backwards. Most failures fall into one of a small number of patterns — and the pattern matters because it determines whether a retry is likely to produce a different outcome.</p>

<p>If the challenge ended because of a single catastrophic session — one day where you lost the daily limit or a significant portion of it — the question is what drove that session. Was it a news event, a technical failure, a position that ran against you unexpectedly? Or was it a decision to oversize, trade outside your normal setup criteria, or try to recover from an earlier loss? The first category represents external variance. The second represents a process failure that will recur under the same conditions.</p>

<p>If the challenge ended gradually — a series of small losses across multiple days that eventually breached the maximum drawdown — the question is whether your strategy was genuinely producing negative expected value during the challenge, or whether the cumulative losses were the product of the <a href="/articles/why-traders-fail-prop-firm-evaluation" style="color:#4f8ef7">five failure patterns</a> that account for most evaluation losses. Strategy failure and execution failure look identical in the trade history but require completely different responses.</p>

<h2>Retrying Alone — When It Makes Sense</h2>

<p>Retrying the challenge yourself makes sense when the failure was caused by a specific, identifiable, correctable error — and when you have a clear plan for how the next attempt differs from the last one. "I will be more disciplined" is not a plan. "I will cap myself at two trades per day for the first week and use a hard daily loss limit alert" is a plan.</p>

<p>It also makes sense if the failure was genuinely caused by external factors rather than process failures — a platform issue, an unexpected news event that you would normally avoid, a legitimate sequence of losing trades that caught you at the wrong point in the challenge timeline. These failures are part of the statistical variance of trading and do not necessarily indicate that a retry will produce the same outcome.</p>

<p>What it does not make sense for is pattern failures — the trader who oversized in week one, or revenge traded after a loss, or gradually drifted from their strategy under pressure. These patterns are driven by the evaluation context itself, not by the specific circumstances of the failed attempt. The same trader under the same conditions will produce the same result. The environment that produced the failure has not changed.</p>

<h2>Using a Service for the Retry</h2>

<p>For traders whose failure was driven by the psychological pressures of the evaluation rather than by a flawed strategy, a <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">professional evaluation service</a> addresses the actual cause of the failure. The strategy does not change. The executor does — and the executor is not subject to the anxiety, impatience, and loss-recovery pressure that altered your trading during the challenge.</p>

<p>The economics of using a service for a retry are also worth examining. At Eleusis FX, the service fee for a $100,000 FTMO evaluation is £1,150. Combined with the challenge fee of approximately £540, the total cost is approximately £1,690. Against a self-directed retry where the failure rate remains above 90%, the expected cost of passing alone — accounting for the probability of multiple failed attempts — is significantly higher than the guaranteed-pass cost of using a professional service with a re-trade commitment.</p>

<p>If you have already failed once and you are honest with yourself about whether the failure was process-driven or strategy-driven, the retry decision is clearer than it feels in the immediate aftermath of a failed challenge. A failed challenge is not evidence that you cannot trade. It is evidence that the evaluation environment produces different behaviour than your normal trading environment. That is a solvable problem — but the solution is not always attempting the same environment again with the same psychology and hoping for a different outcome.</p>

<p>Whatever you decide, the first step is the same: look at the trade history, identify the exact moment and mechanism of failure, and be honest about whether that mechanism is still present. Everything else follows from that assessment.</p>`,
  },

  "ftmo-drawdown-rules-explained": {
    tag: "Prop Firms",
    title: "FTMO Drawdown Rules Explained: Trailing vs Static (2026)",
    excerpt: "FTMO's trailing drawdown rule catches more traders than any other rule. Here's exactly how it works, with examples, and how it compares to the static drawdown used by other firms. Updated 2026.",
    date: "April 2026",
    readTime: "8 min read",
    content: `<p>FTMO's drawdown rules end more challenges than any other element of the evaluation. Not because they are unusually harsh — they are broadly in line with the industry — but because they are consistently misunderstood. Traders who know their strategy, know their risk parameters, and have prepared carefully for the challenge still breach the drawdown limit because they are operating under a false model of how it actually works.</p>

<p>This article explains FTMO's drawdown rules precisely: what the trailing maximum drawdown is and how it moves, how the daily loss limit is calculated, the critical distinction between balance and equity, and how FTMO's methodology compares to the static drawdown used by firms like The5ers. By the end you will have an accurate mental model of the rules and know exactly how to track them through a live evaluation.</p>

<h2>Two Separate Rules — Both Must Be Respected</h2>

<p>FTMO enforces two distinct drawdown constraints simultaneously. Both apply at all times. Breaching either one ends the challenge immediately.</p>

<p><strong>The daily loss limit</strong> — a maximum loss of 5% in a single trading day.<br />
<strong>The maximum drawdown</strong> — a maximum total loss of 10% from the equity peak, calculated on a trailing basis.</p>

<p>Most traders understand these rules as numbers: 5% daily, 10% total. The misunderstanding is in the methodology — specifically, how the baseline for each calculation is determined. That methodology is where challenges end.</p>

<h2>The Daily Loss Limit — Balance, Not Equity</h2>

<p>FTMO's 5% daily loss limit is calculated from your <strong>account balance at the start of the trading day</strong> — not from your current floating equity, and not from the account's starting balance. The distinction matters enormously for traders who hold open positions overnight.</p>

<p>Here is a concrete example. You hold a position overnight that is sitting at a $1,500 floating loss when the new trading day begins. Your account balance is $100,000. Your daily limit for the new day is $5,000 — meaning your account cannot drop below $95,000 that day. But you are already $1,500 into that limit because of the overnight position. Your effective remaining daily room is $3,500, not $5,000.</p>

<p>Now suppose you open a new position that moves $2,500 against you. Your overnight loss plus your new loss equals $4,000 — 80% of the daily limit, from two positions. If the overnight position then moves another $1,000 against you, the limit is breached and the challenge ends. You have not placed a new losing trade. The limit was consumed by the combination of an overnight hold and a single new position.</p>

<p>This catches traders who enter sessions with open positions without accounting for unrealised losses in their daily limit calculation. Use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to see your true remaining daily room at the start of each session, factoring in any open floating losses before you size a new position.</p>

<h2>The Trailing Maximum Drawdown — How the Floor Moves</h2>

<p>This is the rule that generates the most confusion and ends the most challenges. FTMO's 10% maximum drawdown is not anchored to your starting balance. It is a <em>trailing</em> drawdown — the floor rises as your equity rises, and it never comes back down.</p>

<p>Starting scenario: $100,000 account. Initial drawdown floor: $90,000 (10% below starting balance).</p>

<p>Now suppose you trade well in week one and your account reaches $106,000. At this point, the drawdown floor moves up to $95,400 — 10% below your new equity peak of $106,000. Your account balance has grown by $6,000. Your drawdown room has shrunk from $10,000 to $10,600 in absolute terms — but your floor is now $5,400 higher than it was when you started.</p>

<p>The consequence: if the market reverses in week two and your account falls from $106,000 back toward $96,000, you breach the drawdown limit at $95,400 — even though you have only given back approximately 10% of your account from its peak. From the starting balance, you are still up $5,400. But the floor has moved, and the evaluation ends.</p>

<p>This is the counterintuitive reality of the trailing drawdown: <strong>the better your early performance, the more constrained your subsequent margin for error.</strong> A trader who reaches $115,000 by day 10 has a drawdown floor of $103,500. They can lose only $11,500 from that point before breaching the limit — despite having built a $15,000 profit cushion. The cushion does not protect them from the floor the way they expect it to.</p>

<h2>A Full Worked Example</h2>

<p>Starting balance: $100,000. Initial floor: $90,000.</p>

<ul>
  <li>Day 5: Account reaches $108,000. Floor moves to $97,200.</li>
  <li>Day 9: Account reaches $112,000. Floor moves to $100,800.</li>
  <li>Day 14: Bad week. Account falls to $103,000. Floor remains at $100,800 — the floor never comes down. Room remaining: $2,200.</li>
  <li>Day 15: One losing session of $2,500. Account falls to $100,500. Challenge ends — floor breached.</li>
</ul>

<p>The trader in this scenario is still in profit from their starting balance. They have not lost money in the traditional sense. But the trailing mechanism means their drawdown room at the point of failure is a fraction of what it appeared to be when the challenge began.</p>

<h2>Trailing vs Static — How Other Firms Compare</h2>

<p>Not all prop firms use a trailing maximum drawdown. The5ers uses a <em>static</em> drawdown — the floor is fixed at 5% below the initial account balance and never moves, regardless of how high the account goes. A trader who reaches $115,000 at The5ers still has a floor anchored to $95,000 from the starting balance. Their room from peak is $20,000 — far more than the equivalent FTMO account would have at the same equity level.</p>

<p>The trade-off is that The5ers' static drawdown is anchored at 5% rather than FTMO's 10%. The absolute floor is tighter. But because it does not trail, early strong performance does not erode the room in the way FTMO's trailing system does.</p>

<p>For traders whose equity curves involve natural retracements — swing traders, macro traders, anyone whose strategy builds positions over days rather than sessions — the static drawdown is structurally more accommodating. For traders with linear, low-retracement equity curves, FTMO's trailing system is manageable because the floor never rises faster than their peak performance allows. See our <a href="/articles/ftmo-vs-true-forex-funds" style="color:#4f8ef7">full FTMO vs True Forex Funds comparison</a> for a detailed breakdown of how the methodologies play out across different trading styles.</p>

<h2>How to Track Your Drawdown Floor in Real Time</h2>

<p>The most effective way to avoid breaching the trailing drawdown is to know your exact floor before every session — not as a rough estimate, but as a precise number calculated from your current equity peak.</p>

<p>The formula is simple: your drawdown floor equals your highest reached equity multiplied by 0.9. If your peak equity was $109,500, your floor is $98,550. That number does not change until your equity exceeds $109,500 and sets a new peak. Every session starts with that floor in place.</p>

<p>Our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> calculates this for you automatically — enter your starting balance, your current equity peak, and your current balance, and it outputs your exact floor and remaining room. Running this calculation before each session takes thirty seconds and removes the single most common source of late-challenge failures.</p>

<p>The <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">complete FTMO evaluation guide</a> covers the full rule structure — phases, targets, profit splits, and scaling — for traders who want the end-to-end picture before beginning a challenge.</p>`,
  },

  "prop-firm-passing-service-legit": {
    tag: "Evaluation Service",
    title: "Prop Firm Passing Service: Are They Legit? (Honest Answer)",
    excerpt: "Are prop firm passing services legitimate? The honest answer — what the industry looks like, how to identify a credible service, and what 700+ completed evaluations actually means. Updated 2026.",
    date: "April 2026",
    readTime: "7 min read",
    content: `<p>The question gets asked constantly, and it deserves a direct answer rather than a carefully hedged non-response. Are prop firm passing services legitimate? Yes — some of them are. Some of them are not. The market contains professional operations with genuine track records and fraudulent ones that take fees and disappear. The difference between them is identifiable before you commit money, if you know what to look for.</p>

<p>This article gives you the honest picture: what a legitimate prop firm passing service actually does, what the fraudulent ones look like, why the industry exists in the first place, and the specific questions to ask before using any service.</p>

<h2>Why the Industry Exists</h2>

<p>Prop firm evaluation passing services exist because the self-directed pass rate for funded account challenges sits below 10% across FTMO and the broader market. That figure is not contested — FTMO has published data consistent with it, and third-party analysis of the wider prop firm industry produces similar numbers.</p>

<p>The failure rate is not primarily caused by bad strategies. Most traders who fail have a strategy that, on their own account, produces consistent returns. The evaluation environment — a real fee paid, a deadline running, and the psychological weight of consequences — changes how traders execute in ways that reliably degrade performance. They oversize positions to build a buffer early. They revenge trade after a losing day. They abandon their process when the target feels distant. These are not character flaws. They are well-documented responses to high-stakes conditions.</p>

<p>A professional passing service removes the psychological variable from the execution. Their traders are not personally exposed to the outcome of your evaluation. They execute the same process they run every day. The result is a pass rate that is materially higher than the self-directed average — not because the strategy is different, but because the executor is.</p>

<p>For a detailed breakdown of the legal and regulatory position in the UK — including what prop firm terms of service actually say and what the real risks are — see our article on <a href="/articles/can-someone-else-trade-your-prop-firm-evaluation" style="color:#4f8ef7">whether someone else can trade your evaluation</a>.</p>

<h2>What a Legitimate Service Looks Like</h2>

<p>Legitimate prop firm passing services share a consistent set of characteristics. These are not marketing claims — they are verifiable facts that a credible operation will produce on request.</p>

<p><strong>A verifiable track record at volume.</strong> A service that has completed 50 evaluations is a meaningfully different proposition from one that has completed 700. At low volume, a strong pass rate can reflect a fortunate run of market conditions rather than a genuine process. At high volume — across different regimes, different firms, different account sizes, different challenge types — consistency reflects process rather than luck. Ask for completed evaluation evidence: pass confirmations from FTMO or other firms, funded account notifications, client results with dates and firm references. These documents are not reproducible by a fraudulent operation. A legitimate service produces them without hesitation.</p>

<p><strong>Real traders, not algorithms.</strong> Some operations run automated strategies across hundreds of simultaneous evaluation accounts. These are flagged quickly by prop firms, which monitor for unusual correlation patterns across accounts. They also fail more frequently when market conditions deviate from the algorithm's design parameters. A professional service employs human traders with verifiable trading histories executing with genuine discretion. Ask who trades the accounts and what their background is. A credible service answers this question specifically.</p>

<p><strong>A re-trade commitment, not an unconditional guarantee.</strong> No service can guarantee a pass in an absolute sense. Platform outages, rule changes by the prop firm, and genuinely adverse market conditions are outside anyone's control. What a legitimate service can and should commit to is re-trading the evaluation at no additional cost if they fail to pass it. This policy separates services that stand behind their work from those that take a fee and treat failure as the client's problem.</p>

<p><strong>Transparency about which firms they cover.</strong> A credible service has specific experience with specific firms and will tell you honestly which ones they work with confidently and which they do not. A service that claims to cover every firm with equal competence is almost certainly overstating its actual capability.</p>

<p><strong>Longevity.</strong> Services that scam clients, fail at scale, or get systematically flagged by prop firms do not survive. The evaluation service market is small enough that reputation travels quickly. A service operating since 2019 with hundreds of completed evaluations has a track record that cannot be manufactured. Check when the service launched and cross-reference any claims about client volume against publicly visible history.</p>

<h2>What a Fraudulent Service Looks Like</h2>

<p>The warning signs are equally consistent and almost always present before you commit money if you are looking for them.</p>

<p><strong>No verifiable evidence of completed evaluations.</strong> Generic five-star reviews and testimonial screenshots from unidentifiable accounts are not evidence. Pass confirmations and funded account notifications from FTMO are. If a service cannot show you the latter, treat the former as worthless.</p>

<p><strong>Unconditional pass guarantees.</strong> "100% guaranteed pass, no questions asked" is a marketing claim that no legitimate trading operation can make honestly. Any service making this promise is either lying about the guarantee or planning to disappear before you can test it.</p>

<p><strong>Upfront payment with no re-trade policy.</strong> A service that takes your full fee, fails the evaluation, and offers nothing in return is not operating in good faith. The absence of a re-trade policy is one of the clearest signals that the service's business model depends on clients paying for failed attempts rather than on clients receiving a funded account.</p>

<p><strong>New operation with no history.</strong> Check the domain registration date, the social media account creation date, and whether any verifiable business history exists. Fraudulent services frequently launch with professional-looking websites and disappear within months. An operation that launched in the last six months and claims a thousand completed evaluations is not telling the truth about at least one of those facts.</p>

<h2>The Right Questions to Ask</h2>

<p>Before using any prop firm passing service, ask these questions directly and evaluate the answers:</p>

<ul>
  <li>How many evaluations have you completed, and can you show me documentation?</li>
  <li>Which prop firms do you work with, and which do you decline?</li>
  <li>Who are the traders executing the evaluations, and what is their background?</li>
  <li>What is your re-trade policy if the evaluation is not passed?</li>
  <li>How long have you been operating?</li>
</ul>

<p>A legitimate service answers all five questions specifically and without deflection. Vague responses, requests to trust the reviews instead, or resistance to producing documentation are not acceptable substitutes for direct answers. The fee is significant. The decision deserves specific answers.</p>

<h2>The Eleusis FX Track Record</h2>

<p>Since 2019, Eleusis FX has completed over 700 prop firm evaluations across FTMO, The5ers, FundedNext, and comparable firms. Our pass documentation is available to review before any commitment. Our re-trade policy is unconditional — if we do not pass your evaluation, we repeat it at no additional cost. Our traders are professional, human, and have been executing evaluations across multiple market regimes for years.</p>

<p>The <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">full breakdown of how the service works</a> — including the step-by-step process and the complete cost structure — covers everything you need to make an informed decision. If you have a specific firm or account size in mind, the application takes two minutes and we confirm availability and compatibility within 24 hours.</p>

<p>The question is not whether prop firm passing services are legitimate. Some are. The question is whether the specific service you are considering is one of them. Apply the criteria above and the answer becomes clear.</p>`,
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
  "how-to-pass-the-fundednext-challenge": {
    tag: "Prop Firms",
    title: "How to Pass the FundedNext Challenge in 2026 (Step-by-Step)",
    excerpt: "The exact approach to passing FundedNext's two-phase evaluation — rules, risk settings, and the key differences from FTMO that catch traders out. Updated 2026.",
    date: "May 2026",
    readTime: "8 min read",
    content: `<p>FundedNext has grown into one of the most popular prop firms in the industry, largely because of a rule structure that is genuinely trader-friendly — no minimum trading day requirement, a free retry policy that limits the cost of a near-miss, and a two-phase evaluation that many traders find more achievable than FTMO's. Despite that, the majority of traders who attempt the challenge still fail. The reason is not that the rules are strict. It is that traders who do not understand the specific structure of FundedNext's evaluation keep making the same fixable mistakes.</p>

<p>This article gives you the complete picture: the exact rules, the differences from other firms that matter, and the specific adjustments to make if you have previously attempted FTMO or The5ers evaluations.</p>

<h2>FundedNext Evaluation Rules — What You Need to Know</h2>

<p>FundedNext's flagship programme is the Evaluation model, which runs across two phases. Phase 1 requires a <strong>10% profit target</strong> with a <strong>5% maximum daily loss</strong> and a <strong>10% maximum overall drawdown</strong>. Phase 2 requires a <strong>5% profit target</strong> with the same daily and overall loss limits. There is no time limit on either phase and no minimum number of trading days required.</p>

<p>The absence of a minimum trading day requirement is significant. On FTMO, you must complete at least 4 trading days regardless of how quickly you hit the profit target. FundedNext places no such restriction — if your strategy delivers the target in three exceptional sessions, you can proceed immediately. In practice this changes how aggressive your early-phase approach can be: you are not padding trade count to satisfy a minimum, which removes one of the more counterproductive decision points in other evaluations.</p>

<p>The drawdown calculation is similar to FTMO in that it is equity-based and trailing. Your maximum overall loss is measured from your highest recorded equity point, not from your starting balance. If you reach $107,000 on a $100,000 account, your floor moves to $96,300 — not $90,000. The same trailing mechanics that end FTMO challenges also end FundedNext challenges. Understanding your current floor before every session is non-negotiable.</p>

<h2>The Free Retry Policy — What It Actually Means</h2>

<p>FundedNext offers a free retry on Phase 1 if you end the phase within 5% of the profit target — meaning if you reach 5% profit or higher without breaching the loss rules, but fall short of the 10% target, you can restart Phase 1 at no additional cost. This is a meaningful risk-reduction feature that no other major firm offers in the same form.</p>

<p>What it does not mean: you are protected from a fail. If you breach the 5% daily loss or 10% overall drawdown, the challenge ends regardless of your profit level. The free retry only applies to cases where you have managed risk correctly but not generated enough return. It rewards disciplined traders who fall just short of the target — it does not insulate reckless traders from blowing the account.</p>

<p>In practice this policy should give you slightly more confidence in early-phase trading. If you are at 6–7% profit with solid drawdown management but market conditions turn against you in the final stretch, the worst case is a restart rather than a full fee. That changes the risk calculus modestly — enough to justify maintaining your normal trade frequency rather than parking capital the moment you reach 7%.</p>

<h2>Phase 1 — The Right Approach</h2>

<p>The 10% Phase 1 target with no time limit creates a different psychological environment from FTMO's 30-day deadline. You do not face the week 3 and week 4 pressure spikes that end most FTMO challenges. What you face instead is a different failure mode: complacency. Traders with no deadline take fewer trades, second-guess entries they would normally take, and drag Phase 1 out for months while market conditions rotate through unfavourable periods. The no-time-limit structure is a benefit — until it becomes an excuse to not execute.</p>

<p>Set a personal target to complete Phase 1 within 30 calendar days. Not because FundedNext requires it — they do not — but because self-imposed structure prevents the drift that open-ended timelines produce. Trade your normal frequency, maintain 1–1.5% risk per trade, and treat the 10% target as a 30-day goal rather than a whenever-you-get-around-to-it one.</p>

<p>The risk parameters that work: maximum 1.5% per trade in Phase 1, no more than 3 trades per day, daily loss hard stop at 3.5% (leaving a buffer below the 5% limit). These numbers are slightly more conservative than the rules require. That margin is intentional — it keeps you in the challenge through the losing sequences every strategy produces.</p>

<h2>Phase 2 — The Verification Phase</h2>

<p>Phase 2 with a 5% profit target is structurally easier than Phase 1. The same risk rules apply, but you need half the return. Most traders who reach Phase 2 should complete it within two weeks if they maintain the same discipline that got them there.</p>

<p>The failure pattern in Phase 2 is overconfidence. Traders who passed Phase 1 cleanly often enter Phase 2 with the assumption that the hard part is done — and loosen their trade selection or increase position sizes accordingly. The 5% daily loss and 10% overall drawdown limits are identical in Phase 2. The account can be blown just as easily. The correct Phase 2 approach is identical to Phase 1 in terms of risk management — only the profit target changes.</p>

<p>Target 1.5–2% per week in Phase 2. At that pace you complete Phase 2 in three to four weeks. There is no benefit to racing. A consistent Phase 2 pass creates a verified track record that influences how FundedNext manages your funded account going forward.</p>

<h2>Key Differences From FTMO That Catch Traders Out</h2>

<p>If you have traded FTMO evaluations before, three aspects of FundedNext's structure require specific adjustment.</p>

<p><strong>No minimum trading days.</strong> On FTMO, the 4-day minimum creates a floor on trade count. You cannot pass in two sessions regardless of performance. FundedNext has no such floor. This is a benefit, but it requires you to be more intentional about trade frequency — you are responsible for setting your own cadence rather than meeting an external requirement.</p>

<p><strong>Profit split structure.</strong> FundedNext starts funded traders at an <strong>80% profit split</strong> and scales toward 90% with consistent performance. The structure is comparable to FTMO, though the specific milestone triggers differ. Understand the terms of your funded account before you start trading it — the evaluation and the funded account operate under different rules, and traders who do not read both carefully sometimes make avoidable mistakes in the first funded month.</p>

<p><strong>Leverage availability.</strong> FundedNext offers up to 1:100 leverage on forex pairs — higher than most firms. This is a tool, not a recommendation. The appropriate position size on a FundedNext account is determined by your risk percentage and stop loss distance, not by what the maximum leverage allows. Traders who have used FTMO's more conservative leverage caps and then move to FundedNext sometimes discover they are significantly oversized before they realise it. Calculate your lot size from first principles on every trade.</p>

<h2>The Drawdown Floor — Track It Before Every Session</h2>

<p>Because FundedNext uses a trailing equity-based drawdown, your maximum overall loss floor changes every time you hit a new equity high. This is identical to FTMO's mechanism and equally dangerous if you are not tracking it.</p>

<p>On a $100,000 account, the 10% maximum overall loss limit means your floor starts at $90,000. If your equity reaches $104,000, your floor rises to $93,600. You have not lost any money — but your available drawdown room has compressed. Traders who do not track this build a false sense of security from their running profit figure without registering that their loss tolerance has narrowed.</p>

<p>Use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to calculate your exact floor before every session. Enter your peak equity, subtract 10%, and that is the level you must not breach. Running this number at session open takes thirty seconds and eliminates the most common avoidable failure in any trailing-drawdown evaluation.</p>

<h2>Combining FundedNext With an Evaluation Service</h2>

<p>FundedNext evaluations are among the most commonly requested at professional <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">evaluation services</a> in the UK. The no-minimum-trading-day rule makes the timeline more predictable for professional execution — there is no padding required, and the evaluation can be completed when conditions are right rather than dragged across a required minimum day count.</p>

<p>If you have previously failed a FundedNext evaluation on your own — particularly if the failure occurred in Phase 2 — this is worth factoring into your decision. The psychological dynamics of an evaluation you are running yourself are materially different from one being executed professionally. Most self-directed Phase 2 failures are not strategy failures. They are execution failures caused by the pressure of being close to a funded account and making decisions you would not otherwise make.</p>

<p>For a full breakdown of what to look for in a UK evaluation service and how the process works, see our guide to <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">prop firm evaluation services</a>. For a direct comparison of FundedNext against other firms, see our <a href="/compare" style="color:#4f8ef7">full comparison table</a>.</p>`,
  },
  "the5ers-evaluation-rules": {
    tag: "Prop Firms",
    title: "The5ers Evaluation Rules: Complete Breakdown (2026)",
    excerpt: "A full breakdown of The5ers Hyper Growth and Bootcamp evaluation rules — drawdown structure, profit targets, time limits, and how they compare to FTMO. Updated 2026.",
    date: "May 2026",
    readTime: "8 min read",
    content: `<p>The5ers is consistently underrated in the prop firm conversation, largely because traders who have only experienced FTMO's rule structure find The5ers' model unfamiliar. That unfamiliarity is a mistake. The5ers offers a static drawdown structure — the single most meaningful difference from FTMO and most other firms — and a scaling pathway that can take a trader to $4,000,000 in funded capital. For traders whose strategies involve natural retracements, swing positions, or multi-day holds, The5ers is frequently a better environment than FTMO, not a worse one.</p>

<p>This article covers every material rule across The5ers' two main programmes — Hyper Growth and Bootcamp — and explains what each rule means for how you should trade the evaluation.</p>

<h2>The Most Important Difference: Static vs Trailing Drawdown</h2>

<p>Before the specific rules, this distinction needs to be stated plainly because it changes everything about how you manage risk.</p>

<p>FTMO uses a trailing drawdown. Your maximum loss floor rises with your equity peak. If you build your account to $108,000, your floor climbs to $97,200 — not the original $90,000. You can be in profit and simultaneously have less room to absorb a retracement than you had at the start of the evaluation.</p>

<p>The5ers uses a <strong>static drawdown</strong>. Your maximum loss floor is set at account opening and never moves. On an $100,000 account with an 8% drawdown limit, your floor is $92,000 on day one and $92,000 on day forty regardless of how much your equity has grown above the starting balance. A trader who has built the account to $115,000 still has $23,000 of drawdown room — they cannot be squeezed into a failing position by a good run of performance.</p>

<p>This structural difference is why traders with strategies that involve holding through retracements, running positions overnight, or trading momentum that extends and then partially reverses are better suited to The5ers. On FTMO, a strong early run followed by normal market choppiness can breach the drawdown floor even if the trader is overall profitable. On The5ers, it cannot.</p>

<h2>Hyper Growth Programme — Rules</h2>

<p>Hyper Growth is The5ers' flagship two-phase evaluation. The rules are as follows.</p>

<p><strong>Phase 1:</strong> 8% profit target. 4% maximum daily loss. 8% maximum overall drawdown (static). No time limit. No minimum trading days.</p>

<p><strong>Phase 2:</strong> 5% profit target. 4% maximum daily loss. 8% maximum overall drawdown (static). No time limit. No minimum trading days.</p>

<p>After passing both phases, you receive a funded account. The5ers' initial funded account size corresponds to your evaluation size. The programme then scales through a series of milestones — reaching 10% profit on your funded account triggers a capital increase, and this continues up to a potential $4,000,000 in managed capital for consistent performers.</p>

<p>The 4% daily loss limit is tighter than FTMO's 5% and requires attention. On a $100,000 account, your maximum daily loss is $4,000 — not $5,000. Traders who size positions based on FTMO parameters without adjusting for The5ers' tighter daily limit will find themselves closer to the boundary than expected.</p>

<h2>Bootcamp Programme — Rules</h2>

<p>Bootcamp is a single-phase evaluation designed for faster funding access. The rules: 6% profit target, 4% maximum daily loss, 8% maximum overall drawdown (static). No time limit. No minimum trading days.</p>

<p>Bootcamp suits traders who want to test the evaluation environment before committing to Hyper Growth, or who have a strategy with a higher hit rate and lower average return per trade — reaching 6% in one phase is achievable faster than 8% + 5% across two phases for many strategies. The funded account terms are equivalent once you pass.</p>

<h2>The No Time Limit Rule — What It Really Means</h2>

<p>The5ers places no time limit on either evaluation phase. This is structurally different from FTMO's 30 and 60 day windows and has real implications for how you approach the evaluation.</p>

<p>The obvious benefit: you cannot fail because the calendar runs out. A trader who hits a difficult market period can simply wait for conditions to improve rather than being forced to take suboptimal trades to meet a deadline. This removes the week 3 and week 4 pressure that ends a disproportionate number of FTMO challenges.</p>

<p>The less obvious risk: open-ended timelines produce complacency. Traders who know they have unlimited time often trade at half their normal frequency, second-guess clean setups, and drag evaluations through multiple market cycles. A Hyper Growth Phase 1 that should take four to six weeks sometimes takes four months — not because the market was unfavourable but because the trader never committed to a consistent schedule.</p>

<p>Set a self-imposed target of completing Phase 1 within 40–50 calendar days and Phase 2 within 30. These are personal targets, not firm requirements. But they provide the structure that the evaluation itself does not enforce, and structure is what separates traders who complete evaluations from traders who let them drift indefinitely.</p>

<h2>Risk Settings for The5ers Evaluations</h2>

<p>The tighter daily loss limit requires specific calibration. The parameters that work consistently across Hyper Growth evaluations: maximum 1% risk per trade, no more than 3 trades per day, personal daily loss hard stop at 2.5% (leaving a buffer below the 4% limit). This is more conservative than the rules require — intentionally so. The 4% limit leaves less margin for error than FTMO's 5%, and the buffer absorbs the spread cost, slippage, and correlated position exposure that pushes real daily loss above the theoretical calculation.</p>

<p>On position sizing: The5ers accounts typically start at $100,000 for the standard Hyper Growth entry point. A 1% risk on a $100,000 account is $1,000 per trade. At a 20-pip stop loss on EUR/USD, that is approximately 0.50 standard lots — well inside what the platform can execute cleanly. Size from the stop loss distance, not from the maximum leverage available.</p>

<p>For Bootcamp, the same parameters apply. The 6% target over one phase means you are aiming for approximately 1.5% per week on a four-week schedule. At 1% risk per trade with a 50% win rate and 1:2 average reward, two trades per day produces that return comfortably. The numbers work with conservative inputs — there is no need to push sizing to hit the target.</p>

<h2>How The5ers Compares to FTMO</h2>

<p>The comparison that matters is the drawdown structure, covered above. Beyond that, three secondary differences are worth noting.</p>

<p><strong>Profit target differences.</strong> Hyper Growth Phase 1 targets 8% versus FTMO's 10%. Phase 2 targets 5% — the same as FTMO's Verification phase. The lower Phase 1 target is a meaningful advantage for strategies that generate steady, moderate returns rather than high-variance spikes.</p>

<p><strong>Daily loss limit.</strong> The5ers is tighter at 4% daily versus FTMO's 5%. This requires tighter position sizing and personal stop-outs set lower than the rule limit. Traders who have calibrated for FTMO and move to The5ers without adjusting frequently find themselves at the daily limit on days that would have been comfortable under FTMO rules.</p>

<p><strong>Scaling ceiling.</strong> The5ers' scaling programme reaches $4,000,000 in managed capital — significantly higher than FTMO's scaling pathway. For traders with multi-year ambitions in funded trading, this ceiling matters.</p>

<p>For a full head-to-head comparison with specific rule tables, see our <a href="/articles/ftmo-vs-the5ers" style="color:#4f8ef7">FTMO vs The5ers article</a> and the <a href="/compare" style="color:#4f8ef7">full prop firm comparison table</a>.</p>

<h2>Weekend Holding and EA Trading</h2>

<p>The5ers permits holding positions over the weekend and supports algorithmic trading strategies. Both are restrictions or grey areas at some competing firms. If your strategy involves holding positions through the close of Friday's session — a common approach in swing trading and macro-driven strategies — The5ers is one of the cleaner environments to operate in. You do not need to flatten positions before the weekend or build a workaround into your execution.</p>

<p>EA traders should verify current policy directly with The5ers before deploying an automated strategy on an evaluation account. The general principle is that proprietary EAs and semi-automated tools are permitted, but high-frequency and latency-arbitrage approaches are not. The boundary is similar to other reputable firms: the evaluation is testing consistent discretionary or systematic trading, not infrastructure advantages.</p>

<h2>Is The5ers Right for You?</h2>

<p>The static drawdown structure makes The5ers objectively better for traders whose equity curves involve regular retracements — which is most strategies. The only traders for whom FTMO is clearly preferable are those running strategies with very linear, consistent returns who want the higher profit split pathway or the larger brand recognition. For everyone else, The5ers' rule structure is worth serious consideration before defaulting to FTMO on the basis of familiarity alone.</p>

<p>If you have previously failed a FTMO evaluation due to the trailing drawdown mechanics — building a lead early in the evaluation and then being squeezed by a normal market retracement — The5ers is worth examining as a direct alternative. The <a href="/articles/ftmo-drawdown-rules-explained" style="color:#4f8ef7">drawdown mechanics that end FTMO challenges</a> simply do not exist in the same form on The5ers. That is not a minor detail. For affected trading styles, it changes the evaluation outcome entirely.</p>`,
  },
  "best-prop-firms-uk-traders": {
    tag: "Prop Firms",
    title: "Best Prop Firms for UK Traders in 2026 (Ranked by Pass Rate)",
    excerpt: "The five prop firms that consistently produce funded traders in the UK — ranked by rule fairness, payout reliability, and realistic pass rate. Updated 2026.",
    date: "May 2026",
    readTime: "9 min read",
    content: `<p>There are now dozens of prop firms competing for trader capital. Most of them are not worth your time. The firms that actually pay out consistently, maintain transparent rule structures, and have a meaningful track record of funded traders operating profitable accounts can be counted on one hand. This article ranks the five firms that UK-based traders should seriously consider in 2026 — and explains precisely why the others do not make the list.</p>

<p>The ranking criteria: rule fairness (particularly drawdown structure), challenge fee refund policy, payout reliability, scaling potential, and the realistic self-directed pass rate for a disciplined trader. Brand popularity is not a ranking criterion — some firms are popular because they spend heavily on marketing, not because they are the best choice for traders.</p>

<h2>1. FTMO — The Benchmark</h2>

<p>FTMO remains the industry standard against which every other firm is measured. A decade of consistent payouts, the largest funded trader community, and the clearest rule structure in the industry make it the default starting point for most serious traders. Its two-phase evaluation — 10% Phase 1, 5% Verification — is well understood. Its trailing drawdown mechanic is the most significant rule to master, but it is completely transparent and learnable.</p>

<p><strong>Best for:</strong> Traders running consistent strategies without large equity swings. Traders who value brand credibility and a large community. High performers targeting the 90% profit split and significant scaling capital.</p>

<p><strong>Main consideration:</strong> The trailing drawdown. If your strategy involves building equity quickly and then holding through retracements, the floor moves with you. See our detailed breakdown of <a href="/articles/ftmo-drawdown-rules-explained" style="color:#4f8ef7">FTMO's drawdown rules</a> before committing capital.</p>

<p><strong>Challenge fee (£100K account):</strong> Approximately £540. Refunded with first payout. Profit split: 80%, scaling to 90%.</p>

<h2>2. The5ers — Best for Swing Traders</h2>

<p>The5ers earns second place specifically because of the static drawdown structure — a rule design that is materially fairer to most trading styles than FTMO's trailing mechanism. On The5ers, a profitable run early in the evaluation does not compress your loss tolerance for the remainder of the challenge. Your floor is set at account opening and stays there.</p>

<p>The Hyper Growth programme (8% Phase 1, 5% Phase 2) has lower targets than FTMO and no time limit on either phase. The Bootcamp single-phase option (6% profit) is one of the most accessible evaluation structures in the industry for traders who want to reach a funded account efficiently.</p>

<p><strong>Best for:</strong> Swing traders, macro traders, anyone holding positions for more than one session. Traders who have previously failed FTMO evaluations due to trailing drawdown mechanics.</p>

<p><strong>Main consideration:</strong> Tighter daily loss limit at 4% versus FTMO's 5%. Requires recalibration of position sizing. See our full <a href="/articles/the5ers-evaluation-rules" style="color:#4f8ef7">The5ers evaluation rules breakdown</a>.</p>

<p><strong>Challenge fee (£100K equivalent):</strong> Competitive with FTMO. Profit split: scales from initial percentage with performance milestones up to a $4M capital ceiling.</p>

<h2>3. FundedNext — Best for Active Traders</h2>

<p>FundedNext has earned its place in the top tier through a combination of accessible rules, a genuinely useful free retry policy, and no minimum trading day requirement. The two-phase evaluation (10% Phase 1, 5% Phase 2) mirrors FTMO's targets but without the mandatory 4-day trading minimum. For traders with high-conviction strategies that can reach targets quickly, this structure removes an artificial constraint that often produces unnecessary trades.</p>

<p>The free retry policy — available if you end Phase 1 with at least 5% profit without breaching loss rules — reduces the risk of a near-miss costing a full evaluation fee. It is the most trader-friendly refund-adjacent policy in the major firm category.</p>

<p><strong>Best for:</strong> Active traders who trade frequently and want flexibility on timing. Traders who want a safety net on near-miss Phase 1 outcomes.</p>

<p><strong>Main consideration:</strong> Trailing drawdown structure, same as FTMO. The <a href="/articles/how-to-pass-the-fundednext-challenge" style="color:#4f8ef7">same drawdown tracking discipline applies</a>. Higher maximum leverage than most firms requires conscious position sizing — do not use leverage availability as a position-sizing input.</p>

<p><strong>Challenge fee:</strong> Competitive. Profit split starts at 80%, with performance-based scaling.</p>

<h2>4. E8 Funding — Best for Algorithmic Traders</h2>

<p>E8 Funding occupies a specific niche: it is the most EA-friendly major firm and has a rule structure that suits systematic traders better than most competitors. The two-phase evaluation (8% Phase 1, 4% Phase 2) has lower targets than FTMO and FundedNext. The drawdown limit of 8% overall with a 5% daily cap sits between FTMO and The5ers in terms of restrictiveness.</p>

<p>E8's willingness to accommodate algorithmic and semi-automated strategies — transparently documented in their terms rather than buried in grey-area language — makes it the default choice for traders who do not trade manually. The infrastructure is built for it.</p>

<p><strong>Best for:</strong> Algorithmic traders, systematic traders, those using EAs or semi-automated execution. Traders who want lower profit targets per phase.</p>

<p><strong>Main consideration:</strong> Smaller brand presence than FTMO or The5ers. Verify current payout history independently before committing to a larger account size. See our <a href="/articles/e8-funding-challenge" style="color:#4f8ef7">full E8 Funding rules breakdown</a>.</p>

<p><strong>Challenge fee:</strong> Broadly comparable to industry standard. 80% profit split.</p>

<h2>5. TopStep — Best for Futures Traders</h2>

<p>TopStep belongs on this list with an important caveat: it is primarily a <strong>futures prop firm</strong>, not a forex or CFD firm. Traders who operate on CME futures — ES, NQ, CL, GC — will find TopStep's infrastructure and rule structure well suited to those instruments. Traders who primarily trade forex pairs should look at the four firms above instead.</p>

<p>TopStep's evaluation structure is straightforward: a single-phase Trading Combine with a fixed daily loss limit and a maximum overall loss limit that varies by account size. The absence of a trailing drawdown in the traditional sense — TopStep uses a fixed balance-based floor — is a significant advantage for futures traders who are accustomed to intraday volatility that can compress equity rapidly.</p>

<p><strong>Best for:</strong> Futures traders (ES, NQ, CL, GC). UK traders who want to access US CME instruments through a funded account structure.</p>

<p><strong>Main consideration:</strong> Not appropriate for forex or crypto CFD traders. Account currency and payout mechanics differ from forex-focused firms. See our <a href="/articles/topstep-vs-ftmo" style="color:#4f8ef7">TopStep vs FTMO comparison</a> for a detailed breakdown.</p>

<h2>Firms Not on This List — and Why</h2>

<p>Several firms that appear frequently in prop firm marketing content are not ranked here. The reasons vary: some have a history of delayed or disputed payouts; some have rule structures that produce technically valid failures from situations that no reasonable trader would consider a trading error; some are simply too new to have an established track record worth trusting with meaningful capital. The firms on this list have all demonstrated multi-year payout consistency with large funded trader populations. That track record is what separates the legitimate industry from the rest.</p>

<p>For a full side-by-side comparison of rules, fees, drawdown structures, and profit splits across all five firms, see our <a href="/compare" style="color:#4f8ef7">prop firm comparison table</a>. For traders who have been consistently unsuccessful with self-directed evaluations, a professional <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">evaluation service</a> offers a direct alternative with a meaningfully higher pass rate.</p>`,
  },
  "ftmo-phase-1-vs-phase-2": {
    tag: "FTMO",
    title: "FTMO Phase 1 vs Phase 2: Key Differences & Strategy Shifts",
    excerpt: "What changes between FTMO's Challenge and Verification phases — targets, time limits, and exactly how to adjust your approach to pass both cleanly. Updated 2026.",
    date: "May 2026",
    readTime: "7 min read",
    content: `<p>Most traders who reach FTMO's Phase 2 expect it to be the easy part. They have already cleared 10% in Phase 1. The Phase 2 target is 5% — half as much, with twice as long to do it. By every metric it should be simpler. The reality is that Phase 2 has its own failure patterns, and they are not the same as the ones that end Phase 1 challenges. Understanding the differences before you enter Phase 2 is the difference between passing cleanly and failing from a failure mode you did not anticipate.</p>

<h2>The Rules — Side by Side</h2>

<p><strong>Phase 1 (FTMO Challenge):</strong> 10% profit target. 5% maximum daily loss. 10% maximum overall drawdown (trailing). 30 calendar days. Minimum 4 trading days.</p>

<p><strong>Phase 2 (FTMO Verification):</strong> 5% profit target. 5% maximum daily loss. 10% maximum overall drawdown (trailing). 60 calendar days. Minimum 4 trading days.</p>

<p>The structural differences: the profit target is halved, and the time allowance is doubled. Everything else is identical. The trailing drawdown mechanic that governs Phase 1 applies equally in Phase 2 — your maximum loss floor still rises with your equity peak, still compresses your available room as you build profit, and still ends the challenge immediately if breached regardless of your current profit level.</p>

<h2>Why Phase 2 Is Not the Easy Part</h2>

<p>Three failure patterns are specific to Phase 2 or significantly more common in Phase 2 than in Phase 1.</p>

<p><strong>Overconfidence.</strong> Traders who pass Phase 1 feel, correctly, that they have demonstrated something. The Phase 1 pass is evidence of skill. That evidence creates a false assumption: that Phase 2 is a formality. Traders who enter Phase 2 with this mindset often loosen their risk parameters — slightly larger position sizes, slightly weaker entry criteria, slightly less attention to daily loss limits. The Phase 2 rules are identical to Phase 1. They can end the challenge just as definitively. The confident trader is not protected by their Phase 1 performance.</p>

<p><strong>Complacency from the extended timeline.</strong> Sixty calendar days sounds like an enormous cushion when you need 5% profit. It is enough time to be careless about the first three weeks, recover the ground in a rush during weeks four and five, and blow the account in week six trying to clean up the mess. The 60-day limit is not an invitation to delay — it is protection against a genuinely bad month in market conditions. The correct approach is to target completing Phase 2 in 30 days or fewer, using the extra 30 as a contingency buffer, not as a reason to start trading seriously in week three.</p>

<p><strong>Drawdown floor compression from Phase 1 performance.</strong> This is the mechanical failure that catches the most traders by surprise. If you passed Phase 1 cleanly with 12% or 13% profit — as many traders do when Phase 1 goes well — your drawdown floor in Phase 2 inherits the equity peak from where Phase 1 ended. You do not enter Phase 2 with a fresh 10% drawdown allowance from the starting balance. You enter with a drawdown allowance calculated from your Phase 1 equity high.</p>

<p>This matters significantly. A trader who finishes Phase 1 at $113,000 on a $100,000 account enters Phase 2 with a drawdown floor at $101,700 — they can only lose $11,300 before failing, not the theoretical $10,000 from starting balance. And if Phase 2 market conditions are volatile in the first two weeks, that compressed floor can become a serious constraint. Tracking your exact drawdown floor using our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown calculator</a> before every Phase 2 session is not optional — it is the core risk management discipline of the phase.</p>

<h2>The Correct Phase 2 Approach</h2>

<p>Treat Phase 2 as a separate evaluation with different parameters, not as a continuation of Phase 1. Your Phase 1 performance does not carry forward as protection. Your risk discipline must be identical.</p>

<p>The risk parameters that work: keep position sizing at your Phase 1 standard — do not reduce it as a sign of caution, and do not increase it because the target feels easy. The 5% target over 30 self-imposed days requires approximately 0.25% per trading day. That is achievable at 1% risk per trade with a modest win rate. There is no need to push sizing, frequency, or trade selection quality to hit 5% in a month.</p>

<p>Set a personal daily loss stop at 3%. This gives you a meaningful buffer below the 5% rule limit while protecting you from the correlated position exposure and slippage that pushes real drawdown above theoretical calculations. A Phase 2 challenge that ends because a trader hit 4.8% daily loss and then had a gap open against them is a preventable failure. The 3% personal stop prevents it.</p>

<h2>The Minimum Trading Days Rule — Phase 2 Edition</h2>

<p>Phase 2 requires a minimum of 4 trading days, the same as Phase 1. The 60-day window means many traders forget this requirement — they focus on the profit target and arrive at what they think is a passing position only to discover they have not satisfied the minimum day count. Track your trading day count from the first session. Four is not a high bar, but it is absolute: FTMO will not pass an account that has not met it regardless of the profit figure.</p>

<p>The minimum trading day requirement also shapes the optimal strategy for a trader who reaches 5% profit quickly. Once you have 5% profit and 4 trading days, you have satisfied all Phase 2 requirements. The correct action is to stop trading for the day, and potentially for the remainder of Phase 2 entirely if conditions are not clearly favourable. Every additional trade from that point is pure downside risk. The account passes when the requirements are met — not when the calendar expires.</p>

<h2>What Changes on the Funded Account After Phase 2</h2>

<p>Passing Phase 2 activates your FTMO funded account. The funded account starts at an 80% profit split. After your first verified profitable month and payout, FTMO's system automatically assesses eligibility for the 90% split upgrade based on their consistency requirements. Understand those requirements before you start trading the funded account — the path from 80% to 90% is achievable but has specific criteria that you should know in advance rather than discover partway through month two.</p>

<p>The drawdown rules on the funded account are identical to the evaluation: trailing equity-based, 5% daily maximum, 10% overall maximum. The rules do not relax because you passed both phases. If anything, the psychological pressure increases because the stakes are real. Traders who passed both evaluation phases cleanly sometimes find the funded account more difficult than the evaluation — because the money is real and the decisions feel weightier. The risk parameters that passed the evaluation are the right parameters for the funded account. Do not adjust them upward because you feel the funded account deserves more aggressive trading.</p>

<p>For a full breakdown of <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">how FTMO's evaluation is structured from the start</a>, including the rules that govern both phases, see our complete FTMO guide. For traders who have failed Phase 2 multiple times on their own, a professional <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">evaluation service</a> is worth examining — Phase 2 failures are almost always execution failures rather than strategy failures, and they respond to professional execution accordingly.</p>`,
  },
  "prop-firm-evaluation-mindset": {
    tag: "Strategy",
    title: "Prop Firm Evaluation Mindset: 7 Rules Funded Traders Follow",
    excerpt: "The psychological rules that separate traders who pass prop firm evaluations consistently from those who fail the same challenge repeatedly — updated 2026.",
    date: "May 2026",
    readTime: "8 min read",
    content: `<p>The traders who pass prop firm evaluations consistently — across firms, account sizes, and market conditions — are not running better strategies than the traders who keep failing. In most cases, the strategies are comparable. What differs is how they approach the evaluation itself: the decisions they make before they open the platform, the rules they follow when the market goes against them, and the boundaries they enforce even when everything in the evaluation context is pushing them to abandon those boundaries.</p>

<p>These seven rules are not motivational principles. They are operational constraints that produce different outcomes when applied consistently — and their absence explains the majority of evaluation failures that have nothing to do with strategy performance.</p>

<h2>Rule 1: The Evaluation Is a Risk Management Test, Not a Trading Test</h2>

<p>This is the single most important reframe. FTMO and every other major prop firm are not testing whether you can generate a profit. They are testing whether you can generate a profit <em>without breaching the risk rules</em>. Those are different problems that require different solutions.</p>

<p>A trader who focuses on the profit target optimises for return. A trader who focuses on the risk rules optimises for not failing. The second trader passes evaluations at a significantly higher rate — not because they generate less profit, but because they never give back what they have built through an avoidable breach. The <a href="/articles/why-traders-fail-prop-firm-evaluation" style="color:#4f8ef7">five patterns that end most evaluations</a> are all risk management failures, not strategy failures. When you understand this, the preparation changes completely.</p>

<h2>Rule 2: Know Your Three Numbers Before Every Session</h2>

<p>Before opening the platform for any session, you should know three numbers precisely: your current drawdown floor, your remaining daily loss allowance, and your current profit level relative to the target. These three numbers determine how aggressively you can trade today — and they change every session.</p>

<p>The drawdown floor is the critical one. Use our <a href="/resources/drawdown-tracker" style="color:#4f8ef7">drawdown tracker</a> to calculate your exact floor from your peak equity. Do not approximate. A trader who thinks their floor is $91,500 when it is actually $93,200 is trading with a false sense of room that will produce a surprise failure on a bad day. The calculation takes thirty seconds. It is never worth skipping.</p>

<p>The daily loss allowance requires accounting for open positions. If you are holding a position with a $1,500 floating loss before you open a new trade, your effective remaining daily allowance is $3,500 — not $5,000. Traders who calculate daily loss allowance without accounting for existing exposure routinely find themselves at the daily limit through what feels like a sequence of bad luck. It is not bad luck. It is bad arithmetic.</p>

<h2>Rule 3: Set Your Personal Daily Stop Below the Rule Limit</h2>

<p>The 5% daily loss limit on FTMO is the maximum you are <em>allowed</em> to lose. It is not a target, and it should not be your personal stop. Set your daily hard stop at 2.5–3% and treat it as a rule, not a guideline. When you hit it, close the platform and do not return until the following session.</p>

<p>The reasons for the buffer: real losses frequently exceed calculated losses due to spread widening, slippage on stop orders, and gap risk on positions held through news events. A trader targeting a 4.5% personal stop on a 5% limit is one bad fill away from a forced evaluation close. A trader targeting a 2.5% personal stop is not. The buffer is not conservatism — it is the margin of error that keeps the evaluation alive through execution variance that has nothing to do with strategy quality.</p>

<h2>Rule 4: Losing Days Have a Protocol</h2>

<p>Every trader has losing days. The difference between traders who recover from them and traders who blow evaluations after them is not the size of the initial loss. It is the behaviour in the following session.</p>

<p>The protocol is simple and non-negotiable: after any losing day, reduce your maximum daily trade count by one for the following session. If you normally take three trades, take two. If you normally take two, take one. Do not increase position size to recover. Do not target pairs outside your normal watchlist. Do not try to recover the previous day's loss in a single trade. These decisions, made in the heightened emotional state that follows a losing session, are the source of a disproportionate share of evaluation failures. The circuit breaker prevents them by enforcing a structural constraint that does not depend on in-session willpower.</p>

<h2>Rule 5: Calendar Context Is Part of Risk Management</h2>

<p>High-impact economic events — NFP, FOMC, CPI, central bank rate decisions — change market conditions in ways that can breach risk rules regardless of your position's fundamental validity. During the 15–30 minutes around a major release, spreads widen, stops get run, and execution quality degrades. A position that would be fine in normal conditions can generate a 2% loss in two minutes through a combination of adverse movement and execution slippage.</p>

<p>The rule: check the economic calendar before every session. If a major event is within two hours of your planned trading window, reduce position size by 50% or wait until after the release and initial volatility subsides before entering. This is not about avoiding news trading as a strategy — some traders specialise in it. It is about managing the execution risk that major events introduce for <em>all</em> positions, including ones that have nothing to do with the specific release.</p>

<h2>Rule 6: The Profit Target Is a Floor, Not a Ceiling</h2>

<p>Traders approaching the profit target — within 1–2% of the requirement — frequently behave in one of two ways, both wrong. The first: keep trading at normal intensity because the target is close and momentum feels good. The second: stop trading entirely out of fear of giving back the gain. Neither is correct.</p>

<p>The right approach as you near the target: reduce position size by 25–30% and increase your entry criteria to only the highest-quality setups. You are now in the preservation phase. The goal is to add the final 1–2% through clean trades without exposing the majority of your accrued profit to unnecessary risk. When you cross the target, stop trading for the rest of the day. Review the minimum trading days requirement. If it is satisfied, close the platform for the evaluation. If not, return the following day with minimum position sizing, take one clean trade, and cross the line.</p>

<p>The psychological pull to keep adding after the target is real and well documented. Resist it. A challenge passed at 10.1% is identical in value to one passed at 15%. There is no prize for the margin.</p>

<h2>Rule 7: Track Your Equity Curve, Not Just Your P&L</h2>

<p>Daily P&L tells you whether today was good or bad. Your equity curve tells you whether your evaluation is on track. The difference matters because evaluations are won and lost on patterns, not individual sessions.</p>

<p>At the end of every trading week during the evaluation, plot your equity against where you need to be to hit the target at your planned completion date. If you are ahead, note it — and resist the temptation to relax because you have a buffer. If you are behind, note it — and resist the temptation to accelerate because you are under pressure. Both the buffer and the deficit will resolve through consistent execution of the same process. The traders who pass evaluations consistently are the ones who trust their process through both states, rather than adjusting their behaviour in ways that introduce risk that their process was not designed to carry.</p>

<p>The <a href="/articles/how-to-pass-the-ftmo-challenge" style="color:#4f8ef7">week-by-week structure</a> for FTMO evaluations applies this principle in detail. For traders who have applied these rules consistently and still find the evaluation context degrades their performance, professional <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">evaluation services</a> exist precisely because the psychological variables that these rules address are real, documented, and not uniformly solvable through preparation alone.</p>`,
  },
  "e8-funding-challenge": {
    tag: "Prop Firms",
    title: "E8 Funding Challenge: Rules, Tips & Pass Rate (2026)",
    excerpt: "Everything you need to know about E8 Funding's two-phase evaluation — drawdown rules, profit targets, EA support, and how it compares to FTMO. Updated 2026.",
    date: "May 2026",
    readTime: "7 min read",
    content: `<p>E8 Funding sits in an unusual position in the prop firm market: well established enough to have a meaningful payout track record, but consistently overshadowed by FTMO and The5ers in trader conversations. That relative obscurity is not a reflection of quality. E8's rule structure is genuinely trader-friendly in specific areas — lower per-phase profit targets, explicit support for algorithmic trading, and a clear drawdown framework — and for traders whose strategies fit the profile, it is worth taking seriously.</p>

<p>This article covers every rule you need to know about E8's evaluation, the approaches that work, and the honest comparison with the more prominent alternatives.</p>

<h2>E8 Funding Rules — The Complete Picture</h2>

<p>E8 Funding uses a two-phase evaluation model with the following parameters.</p>

<p><strong>Phase 1:</strong> 8% profit target. 5% maximum daily loss. 8% maximum overall drawdown. 30 calendar days. No minimum trading days.</p>

<p><strong>Phase 2:</strong> 4% profit target. 5% maximum daily loss. 8% maximum overall drawdown. 60 calendar days. No minimum trading days.</p>

<p>The funded account maintains the same drawdown rules: 5% daily maximum, 8% overall maximum. Profit split is 80% from funded account activation.</p>

<p>Several things stand out from this structure. The overall drawdown limit at 8% is tighter than FTMO's 10% — which means your floor is higher and your available room is smaller on a proportional basis. However, E8 does not use a trailing drawdown in the same form as FTMO. E8's overall drawdown is calculated from the initial account balance, not from the equity peak. This is closer to a static structure than a trailing one — and it is a significant advantage for traders whose equity curves involve building up and then pulling back.</p>

<p>The Phase 2 target of 4% is the lowest in the major firm category. Combined with the 60-day window, Phase 2 on E8 is genuinely achievable for almost any working strategy. The pass rate on Phase 2, for traders who have managed Phase 1 correctly, is meaningfully higher than the industry average.</p>

<h2>The EA and Algorithmic Trading Policy</h2>

<p>E8 explicitly supports automated and algorithmic trading strategies. This is documented in their terms and supported by their platform infrastructure — it is not a grey-area tolerance but a stated feature of the product. For traders running EAs, systematic strategies, or semi-automated execution tools, E8 is among the clearest major firms to work with.</p>

<p>The boundaries: high-frequency trading and latency-sensitive approaches that exploit infrastructure rather than market edge are not permitted. This is standard across the industry. Within that constraint, EAs that trade normal forex and CFD strategies on standard timeframes are fully supported.</p>

<p>Algorithmic traders who have struggled with ambiguous EA policies at other firms will find E8's approach more straightforward. The documentation is clear, the support team is responsive to questions about specific strategy types, and the funded account terms maintain the same clarity. If you are running a systematic strategy, E8 is worth evaluating against FTMO specifically — the rule clarity on automation may matter more to you than FTMO's brand recognition.</p>

<h2>The Drawdown Calculation — What Actually Matters</h2>

<p>E8's 8% overall drawdown limit calculated from initial balance means your floor is fixed at 92% of your starting account value. On a $100,000 account, the floor is $92,000 and it stays there regardless of how much your equity grows above the starting point.</p>

<p>This is materially different from FTMO's trailing mechanism and significantly more favourable for strategies that build equity and then hold through retracements. A trader who reaches $115,000 on E8 still has a floor at $92,000 — $23,000 of drawdown room. The same trader on FTMO would have a floor at $103,500, leaving only $11,500 of room against a $15,000 potential retracement.</p>

<p>The 5% daily loss limit is the same as FTMO. Apply the same discipline: set a personal daily stop at 3%, account for open position floating losses before entering new trades, and never treat the rule limit as a target. Track your daily exposure carefully — the 5% limit remains consequential even when the overall drawdown is less restrictive.</p>

<h2>Phase 1 Approach — The 8% Target</h2>

<p>An 8% Phase 1 target over 30 days requires approximately 0.4% per trading day assuming 20 trading days in the period. At 1% risk per trade with a 50% win rate and 1:2 average reward-to-risk ratio, that is achievable at less than one trade per day on average. The numbers are not demanding — the challenge is not the arithmetic, it is the discipline to run the same process every session without making it more complex.</p>

<p>Risk parameters that work: 1% risk per trade, maximum 2–3 trades per day, personal daily hard stop at 2.5–3%. The 30-day time limit requires consistency rather than intensity. Traders who start E8's Phase 1 aggressively to build a buffer early are replicating the same failure pattern that ends FTMO challenges in week one — just with a lower profit target and slightly more forgiving drawdown. The protocol is the same: calibrate in the first week, execute in weeks two and three, preserve in week four.</p>

<h2>Phase 2 Approach — The 4% Target</h2>

<p>Phase 2 with a 4% target and 60 days is the most relaxed second-phase evaluation in the major firm category. Targeting 1% per week reaches the 4% goal in four weeks with the entire second month as contingency. At those numbers, the only way to fail Phase 2 is through a meaningful breach of the risk rules — not through a shortage of return. This means Phase 2 discipline is exclusively about not making mistakes rather than about generating performance.</p>

<p>The failure pattern to avoid: traders who reach Phase 2 with momentum from a strong Phase 1 often continue trading at Phase 1 intensity, which generates unnecessary exposure during a phase that requires only 4% return. Reduce trade frequency in Phase 2. Raise entry criteria. If a setup does not clearly meet your normal standards, wait. There is no timer pressure that justifies a substandard trade when the target is this achievable.</p>

<h2>E8 vs FTMO — The Honest Comparison</h2>

<p>FTMO wins on brand recognition, community size, and the 90% profit split ceiling for high performers. Those are real advantages for specific trader profiles.</p>

<p>E8 wins on drawdown structure for most trading styles, explicit EA support, and lower per-phase profit targets. For a trader whose strategy involves holding positions through retracements — which describes a large proportion of swing and position traders — E8's drawdown mechanic is objectively better than FTMO's trailing model. For algorithmic traders, E8's policy clarity removes friction that FTMO's more ambiguous approach introduces.</p>

<p>The decision should be made on rule compatibility with your specific strategy, not on which firm you have heard more about. See our <a href="/compare" style="color:#4f8ef7">full prop firm comparison table</a> for a side-by-side breakdown of every major firm. If you have previously failed FTMO evaluations due to trailing drawdown mechanics, E8 is one of the most direct solutions — the mechanics that ended your previous challenges do not exist in the same form.</p>

<p>For traders considering professional evaluation assistance, E8 challenges are fully supported by UK <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">evaluation services</a>. The lower Phase 1 and Phase 2 targets make them among the most time-efficient evaluations to complete professionally.</p>`,
  },
  "how-long-prop-firm-evaluation": {
    tag: "Strategy",
    title: "How Long Does It Take to Pass a Prop Firm Evaluation?",
    excerpt: "Realistic timelines for passing FTMO, The5ers, FundedNext, and E8 evaluations — and the factors that make evaluations take longer than they should. Updated 2026.",
    date: "May 2026",
    readTime: "7 min read",
    content: `<p>The question traders ask before starting a prop firm evaluation is almost always about timeline. How long will it take? The answer varies significantly depending on which firm you are evaluating with, your strategy's expected monthly return, and — perhaps more than any other factor — how your performance responds to the evaluation environment itself.</p>

<p>This article gives you accurate timeline expectations across the four major firms, the variables that most commonly extend evaluations beyond their expected duration, and what it means when an evaluation that should take four weeks takes four months.</p>

<h2>FTMO — The 30 + 60 Day Framework</h2>

<p>FTMO's evaluation has hard time limits: 30 calendar days for Phase 1 (the FTMO Challenge) and 60 calendar days for Phase 2 (Verification). In theory, a trader who passes Phase 1 on day 30 and Phase 2 on day 60 takes 90 calendar days to reach a funded account — roughly three months.</p>

<p>In practice, most traders who complete FTMO's evaluation cleanly do so faster than the maximum. A strategy generating consistent 2–3% per week will hit the 10% Phase 1 target in two to three weeks, leaving time in reserve. Phase 2's 5% target at the same rate takes ten to fifteen days. Total completion time for a disciplined trader with a working strategy: four to six weeks across both phases.</p>

<p>The extension scenario: Phase 1 starts poorly, the trader has a losing week in weeks one or two, needs the full 30 days to recover and hit the target, then enters Phase 2 under a compressed floor from inherited equity. Phase 2 takes the full 60 days because the trader is managing a tighter drawdown situation and trading more cautiously. Total timeline in this scenario: 90 days, and the funded account is reached with meaningfully less confidence than in the clean scenario.</p>

<p>The failure scenario — and the most common reason evaluations are never completed — is not that the time limit is reached. It is that the drawdown rules are breached inside the time window. Most failed FTMO evaluations end in week one or week three — not on day 30. Time is rarely the constraint. The <a href="/articles/ftmo-drawdown-rules-explained" style="color:#4f8ef7">trailing drawdown rules</a> are.</p>

<h2>The5ers — No Time Limit</h2>

<p>The5ers Hyper Growth and Bootcamp evaluations have no time limit on any phase. This removes the hard deadline that governs FTMO evaluations but introduces a different risk: open-ended evaluations that drift without resolution.</p>

<p>A disciplined trader targeting The5ers Hyper Growth Phase 1 (8% profit) with a self-imposed 40-day deadline and 1% risk per trade should complete Phase 1 in four to six weeks. Phase 2 (5% profit) should follow in two to four weeks. Total timeline with self-imposed structure: eight to twelve weeks.</p>

<p>The extension scenario on The5ers is almost always complacency rather than performance failure. Traders who remove the deadline from the equation often find themselves six months into an evaluation that should have been completed in two months — not because market conditions were poor, but because the absence of a deadline produced the absence of consistent execution. If you are trading The5ers, set a personal 30-day target for each phase and treat it as a firm commitment even though the firm itself imposes no equivalent.</p>

<h2>FundedNext — 30-Day Phases, No Minimum Days</h2>

<p>FundedNext's evaluation allows 30 calendar days per phase with no minimum trading day requirement. A trader who hits the 10% Phase 1 target in three sessions can proceed immediately — there is no mandatory waiting period. This creates the fastest theoretical completion time of any major firm for high-performing strategies.</p>

<p>In practice, most traders take two to four weeks per phase. A conservative strategy at 1% risk per trade targeting 2–3% per week reaches the Phase 1 target in three to four weeks. Phase 2 at 5% target follows in two weeks. Total realistic timeline: five to seven weeks.</p>

<p>The free retry policy changes the extension calculus slightly. A trader who reaches 8% profit in Phase 1 without breaching loss rules but does not hit 10% by day 30 can restart Phase 1 at no additional cost. This means a near-miss on timeline does not necessarily mean a paid refail — it means a fresh start from the same position. Factor this into your pacing: taking slightly more time to reach 5% cleanly before pushing for 10% is a lower-risk path than racing to 10% in two weeks and potentially breaching a loss limit in the final push.</p>

<h2>E8 Funding — 30 + 60 Days, Lower Targets</h2>

<p>E8's Phase 1 requires 8% profit in 30 days. Phase 2 requires 4% profit in 60 days. Both targets are lower than FTMO's equivalent phases, which makes the timeline more predictable for most strategies. A trader generating 2% per week hits E8's Phase 1 target in four weeks and Phase 2 in two weeks — well inside both time windows.</p>

<p>Total expected timeline for a disciplined trader: five to seven weeks. The extended scenario is similar to FTMO's: a difficult first week in Phase 1 compresses the available time without compressing the target, forcing the trader to increase trade frequency or risk in the final two weeks. The same protocol applies — set a personal daily stop, track your drawdown floor, and let the target come through consistent execution rather than adjusting the process to meet the deadline.</p>

<h2>What Makes Evaluations Take Longer Than They Should</h2>

<p>Three factors extend evaluations beyond realistic timelines far more often than market conditions or strategy performance.</p>

<p><strong>Trading below your strategy's normal frequency.</strong> Traders who normally take two to three trades per day and drop to one per day during the evaluation because of anxiety about the outcome cut their expected return rate by 50–66%. A timeline that should take four weeks becomes eight to twelve weeks. The evaluation environment produces this reduction in almost every self-directed attempt — it is a well-documented response to performance pressure. The fix is not to increase frequency beyond normal, but to maintain normal frequency even when each trade feels more consequential than usual.</p>

<p><strong>Waiting for ideal conditions.</strong> Traders in an evaluation context become more selective than their strategy requires — passing on setups that meet their criteria because they want better ones, sitting out sessions because conditions feel uncertain, avoiding pairs they normally trade because of proximity to a news event. The evaluation is not the place to improve your strategy. It is the place to execute the strategy you already have. Any deviation from your normal trade selection process extends the timeline without improving the outcome.</p>

<p><strong>Recovery mode after a losing day or week.</strong> A losing day followed by reduced position sizing, fewer trades, and a more cautious approach is operationally correct. But if that caution persists for two weeks after a single losing day, the timeline impact is significant. The protocol after a losing day is a one-session reduction in trade count — not a multi-week shift in risk posture. Traders who extend their caution beyond the circuit-breaker period create the drift that turns four-week evaluations into three-month evaluations.</p>

<h2>When the Timeline Itself Is the Problem</h2>

<p>If you have been in evaluation for more than twice the expected timeline — a 30-day FTMO Phase 1 that has consumed all 30 days without passing, or a 60-day Phase 2 reaching day 55 — the evaluation has a structural problem that additional trading will not resolve. The decision at that point is whether to accept the failure, pay for a fresh start, and approach the new evaluation with the diagnostic information from the failed attempt — or whether to consider a professional evaluation service for the repeat attempt.</p>

<p>Timeline failure is rarely a strategy problem. It is almost always an execution problem caused by the evaluation context changing how you trade. A professional <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">evaluation service</a> removes that context entirely. For traders who have failed the same evaluation multiple times on timeline grounds, this is the most direct solution available.</p>

<p>For a full breakdown of what to expect at each stage of the evaluation process, see our guide to <a href="/articles/how-to-pass-the-ftmo-challenge" style="color:#4f8ef7">passing the FTMO Challenge</a> and the <a href="/compare" style="color:#4f8ef7">prop firm comparison table</a> covering all major firms.</p>`,
  },
  "topstep-vs-ftmo": {
    tag: "Prop Firms",
    title: "TopStep vs FTMO: Which Prop Firm Is Right for You?",
    excerpt: "A direct comparison of TopStep and FTMO — instruments, drawdown rules, evaluation structure, and which firm suits which type of trader. Updated 2026.",
    date: "May 2026",
    readTime: "8 min read",
    content: `<p>TopStep and FTMO appear together frequently in prop firm comparisons, but the comparison is more complex than it looks. These are not two firms offering the same product at different prices. They serve different instruments, attract different trader profiles, and operate under structurally different rule frameworks. Choosing between them is not primarily a question of which is better — it is a question of which is appropriate for your trading style and the markets you trade.</p>

<p>This article covers both firms fully, explains the structural differences that most comparisons overlook, and gives you a clear decision framework.</p>

<h2>The Fundamental Difference: Instruments</h2>

<p>FTMO is a <strong>forex and CFD firm</strong>. Its evaluations and funded accounts primarily cover forex pairs, indices, commodities, and crypto CFDs. The trading infrastructure is built for these instruments. The vast majority of FTMO's funded traders are forex traders.</p>

<p>TopStep is primarily a <strong>futures firm</strong>. Its evaluations and funded accounts cover CME futures contracts — ES (S&P 500 e-mini), NQ (Nasdaq e-mini), CL (crude oil), GC (gold), and a selection of other CME-listed contracts. TopStep does not offer forex pairs in the traditional spot or CFD format. Its infrastructure, rule design, and funded account terms are built around the specific mechanics of futures trading.</p>

<p>This single difference resolves the comparison for many traders immediately. If you trade forex pairs, FTMO is the relevant firm and TopStep is not a genuine alternative. If you trade CME futures, TopStep is the most established firm in that category and FTMO's forex-focused infrastructure is not designed for what you do. The overlap case — a trader who genuinely operates in both instrument categories — is the only scenario where the comparison requires nuance.</p>

<h2>FTMO — Rules and Structure</h2>

<p>FTMO's two-phase evaluation requires a 10% profit target in Phase 1 (30 days) and a 5% profit target in Phase 2 — the Verification phase (60 days). The maximum daily loss is 5% of account balance. The maximum overall loss is 10%, calculated on a trailing equity basis: your floor rises with your equity peak throughout the evaluation.</p>

<p>The trailing drawdown is FTMO's most consequential rule. A trader who builds a lead early in the evaluation and then holds through a normal market retracement can breach the drawdown floor despite being profitable overall. This mechanic disproportionately affects swing traders and any strategy with natural equity pullbacks. For strategies with linear, consistent return profiles, it is manageable. For everything else, it requires active management throughout the evaluation. Our detailed breakdown of <a href="/articles/ftmo-drawdown-rules-explained" style="color:#4f8ef7">FTMO's drawdown rules</a> covers this in full.</p>

<p>FTMO's profit split starts at 80% and scales to 90% after the first successful funded month, subject to consistency criteria. The scaling pathway can take a trader to $2,000,000 in managed capital. Payouts are processed monthly.</p>

<h2>TopStep — Rules and Structure</h2>

<p>TopStep's evaluation is a single-phase Trading Combine. The profit target, maximum loss limits, and daily loss limits vary by account size. For the $50,000 account — the most popular entry point — the structure is broadly a fixed daily loss limit and a maximum drawdown calculated from the initial balance, not from the equity peak. This fixed-floor approach means your drawdown room does not compress as your equity grows — a structural advantage for futures traders whose positions can move significantly intraday.</p>

<p>TopStep measures loss in dollar terms rather than percentage terms, reflecting the futures industry convention. Position limits — the maximum number of contracts permitted per account — are enforced in real time and scale with account size. These limits are a material part of how you size trades on TopStep: your lot size equivalent in futures is bounded by a contract limit, not purely by margin.</p>

<p>TopStep offers funded accounts in the Express Funded programme following a successful Combine. The profit split structure and withdrawal policy have evolved over the firm's history — verify current terms directly with TopStep before committing to an evaluation, as the structure has changed more frequently than FTMO's. Payout access for funded traders is available on demand following the initial funded account period.</p>

<h2>Drawdown Structure — The Key Comparison</h2>

<p>For traders who operate in both instrument categories, the drawdown structure comparison matters. FTMO's trailing equity-based drawdown compresses your available room as you perform well — it is the most trader-unfriendly drawdown design among major firms, though it is also the most transparent and learnable. TopStep's fixed-floor approach is more forgiving for strategies that build equity and then pull back.</p>

<p>Neither structure is universally better. FTMO's trailing drawdown does not matter for strategies with linear return profiles. TopStep's fixed floor reflects the intraday volatility of futures trading, where a position in ES or NQ can move several percent in minutes on a news event — a trailing drawdown under those conditions would be impractical.</p>

<p>The static drawdown approach is also available in forex prop firms — The5ers offers the closest equivalent in the forex space. If you are a forex trader attracted to TopStep's drawdown structure rather than its futures instruments, <a href="/articles/the5ers-evaluation-rules" style="color:#4f8ef7">The5ers is worth examining</a> as a direct alternative.</p>

<h2>Evaluation Cost and Timeline</h2>

<p>FTMO's evaluation fees are well established: approximately £540 for a $100,000 account, refunded with the first payout. The two-phase structure spans a maximum of 90 calendar days. Most traders who pass do so in four to eight weeks.</p>

<p>TopStep's evaluation pricing operates on a monthly subscription model for the Trading Combine — you pay a recurring fee for access to the evaluation environment rather than a one-time challenge fee. The total cost depends on how long you take to pass. A trader who completes the Combine in six weeks pays less than one who takes three months. This is a different risk structure from FTMO's one-time fee: efficient traders are rewarded, and traders who take longer pay more.</p>

<h2>Community and Track Record</h2>

<p>FTMO has the larger community and the longer track record in the forex prop firm space. A decade of consistent payouts and the largest funded trader network in the industry produce real credibility that matters when you are evaluating where to commit capital. If brand track record is a significant factor in your decision — and for many traders it should be — FTMO's position is unmatched among forex firms.</p>

<p>TopStep has a meaningful track record in the futures prop firm category. It is the most established firm in that specific space, with a payout history that spans multiple market cycles. For futures traders, TopStep's position in its niche is comparable to FTMO's in forex — the longest-standing and most proven operator in the category.</p>

<h2>Which Firm Is Right for You</h2>

<p>The answer is almost entirely determined by what you trade.</p>

<p><strong>Choose FTMO if:</strong> You trade forex pairs, indices CFDs, or crypto CFDs. Your strategy generates consistent returns without large equity swings. You want a large funded trader community, transparent rules, and the highest profit split ceiling in the forex prop firm industry. See our full <a href="/articles/what-is-an-ftmo-challenge" style="color:#4f8ef7">FTMO guide</a> for everything you need to know before starting an evaluation.</p>

<p><strong>Choose TopStep if:</strong> You trade CME futures — ES, NQ, CL, GC. You want a fixed-floor drawdown structure suited to futures intraday volatility. You prefer a subscription evaluation model where efficient performance is rewarded with lower total cost.</p>

<p><strong>Consider alternatives if:</strong> You are a forex swing trader attracted to TopStep's drawdown structure — <a href="/articles/the5ers-evaluation-rules" style="color:#4f8ef7">The5ers</a> offers comparable drawdown mechanics in a forex environment. You are a forex algorithmic trader — <a href="/articles/e8-funding-challenge" style="color:#4f8ef7">E8 Funding</a> has clearer EA policy documentation than FTMO. You want lower per-phase profit targets — <a href="/articles/how-to-pass-the-fundednext-challenge" style="color:#4f8ef7">FundedNext</a> offers a free retry and no minimum trading day requirement.</p>

<p>For a full side-by-side comparison covering all five major firms, see our <a href="/compare" style="color:#4f8ef7">prop firm comparison table</a>. For traders who have attempted multiple evaluations without success, a professional <a href="/articles/prop-firm-evaluation-service-uk" style="color:#4f8ef7">evaluation service</a> is worth considering regardless of which firm you choose — the execution challenge is firm-agnostic.</p>`,
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
