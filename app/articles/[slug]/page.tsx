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

<p>The consequence is significant. A trader who front-loads profits early in the challenge is actually narrowing their own margin for error as they go. The better you do, the higher the floor rises, and the less room you have for a losing stretch. This is counterintuitive and is why many traders who pass Phase 1 comfortably still fail Phase 2 — they have less room than they think.</p>

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

<p>The evaluation context changes behaviour. That change in behaviour — not the rules — is what ends most challenges. For traders who recognise this pattern in themselves, working with an experienced evaluation service is a rational alternative. The rules do not change, but the executor does — and removing emotional variables from a mechanical process produces measurably more consistent outcomes.</p>`,
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

<p>For FTMO specifically, there is an additional layer: the trailing maximum drawdown. The 10% maximum drawdown floor rises as your equity peak rises. A trader who has built their account from $100,000 to $108,000 now has a drawdown floor of $98,000 — not the original $90,000. The better you perform early in the challenge, the less room you have for a bad stretch. Many traders discover this rule only when they have already breached it.</p>

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
    title: "FTMO vs True Forex Funds: Which Prop Firm Is Right for You?",
    excerpt: "An honest, detailed comparison of the two most popular prop firms — drawdown methodology, profit targets, fees, trading restrictions, and which suits your trading style.",
    date: "April 2025",
    readTime: "9 min read",
    content: `<p>FTMO and True Forex Funds are two of the most established names in the proprietary trading industry. Both run two-phase evaluation models, both offer accounts up to $200,000, and both have genuine track records of paying funded traders. But they are meaningfully different — in their drawdown methodology, their profit targets, their restrictions on trading behaviour, and the economics of their payout structures. Choosing the wrong firm for your style of trading does not just make the evaluation harder. It can make passing structurally unlikely no matter how well you trade.</p>

<h2>Background and Credibility</h2>

<p>FTMO was founded in Prague in 2014. It is widely considered the oldest and most established prop firm operating the challenge-based funding model, and its payout history — running for over a decade — is essentially unquestioned in the industry. At the peak of prop firm popularity in 2022–2024, FTMO reported paying out hundreds of millions of dollars to traders globally. The brand recognition and trust it carries is genuinely significant in a sector where legitimacy is not always guaranteed.</p>

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

<p>Neither firm is objectively better. The right choice depends on your strategy's typical return profile, your trading style, and how you respond to drawdown risk. Both firms are legitimate, both pay out reliably, and both can serve as the foundation for a funded trading career.</p>`,
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
