"use client";

import { useRef, useState } from "react";
import type { Recipient } from "./page";

const TOOLBAR = [
  { cmd: "bold",                icon: "B",   title: "Bold",           style: { fontWeight: 700 } },
  { cmd: "italic",              icon: "I",   title: "Italic",         style: { fontStyle: "italic" } },
  { cmd: "underline",           icon: "U",   title: "Underline",      style: { textDecoration: "underline" } },
  { cmd: "insertUnorderedList", icon: "≡",   title: "Bullet list",    style: {} },
  { cmd: "insertOrderedList",   icon: "1≡",  title: "Numbered list",  style: {} },
];

// ─── Branded HTML email templates ────────────────────────────────────────────

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020305;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020305;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

        <tr><td style="padding-bottom:32px;">
          <span style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">ELEUSIS FX</span>
        </td></tr>

        ${content}

        <tr><td style="padding-top:28px;">
          <p style="margin:0;font-size:11px;color:rgba(210,220,240,0.28);line-height:1.7;font-family:Arial,sans-serif;">
            Eleusis FX &nbsp;&middot;&nbsp; <a href="https://eleusisfx.uk" style="color:rgba(210,220,240,0.28);text-decoration:none;">eleusisfx.uk</a><br>
            Questions? Reply to this email or contact <a href="mailto:admin@eleusisfx.uk" style="color:rgba(210,220,240,0.28);text-decoration:none;">admin@eleusisfx.uk</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const TEMPLATES = [
  {
    label: "Welcome — New Client",
    subject: "Welcome to Eleusis FX — Let's Get You Funded",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:36px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Welcome.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], your Eleusis FX evaluation has been set up. Here&apos;s everything you need to know before you start trading.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Your Dashboard</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Track your balance, drawdown, profit target, and equity curve in real time. Log in any time to see where you stand.</p>
          <a href="https://eleusisfx.uk/login" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Go to Dashboard &rarr;</a>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Key Rules</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Daily drawdown limit: <strong style="color:#e8eaf0;">5%</strong></td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Maximum drawdown: <strong style="color:#e8eaf0;">10%</strong></td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Minimum trading days: <strong style="color:#e8eaf0;">4</strong></td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Profit target: <strong style="color:#22c55e;">10%</strong></td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">If you have any questions at any point, reply to this email or reach out at <a href="mailto:admin@eleusisfx.uk" style="color:#4f8ef7;text-decoration:none;">admin@eleusisfx.uk</a>. We&apos;re here throughout.</p>
          <p style="margin:0;font-size:14px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Best of luck — we&apos;re rooting for you.</p>
        </td></tr>`),
  },
  {
    label: "Progress Check-In",
    subject: "Checking In — Your Evaluation",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">How&apos;s It Going?</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we&apos;re checking in on your evaluation. You&apos;re making progress — keep the discipline tight.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Log in to your dashboard to check your latest figures — balance, daily drawdown, and days remaining are all live.</p>
          <a href="https://eleusisfx.uk/login" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">View Dashboard &rarr;</a>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">A Quick Reminder</p>
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Don&apos;t let any one trade push you close to your daily limit. Consistency beats aggression at every stage of an evaluation. Stay in control and the results will follow.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:14px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Any questions — just reply to this email. We&apos;re here.</p>
        </td></tr>`),
  },
  {
    label: "Evaluation Passed",
    subject: "Congratulations — You've Passed Your Evaluation",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#22c55e;font-weight:700;font-family:Arial,sans-serif;">Evaluation Complete</p>
          <h1 style="margin:0 0 16px;font-size:36px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">You Passed.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], congratulations — you&apos;ve successfully passed your Eleusis FX evaluation.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(34,197,94,0.2);border-top:2px solid #22c55e;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 12px;font-size:13px;line-height:1.75;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">This is a significant achievement. It reflects your discipline, patience, and ability to manage risk under real evaluation conditions.</p>
              <p style="margin:0;font-size:13px;line-height:1.75;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We&apos;ll be in touch shortly with your next steps. In the meantime, well done.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Questions?</p>
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Reply to this email or contact us at <a href="mailto:admin@eleusisfx.uk" style="color:#4f8ef7;text-decoration:none;">admin@eleusisfx.uk</a> — we&apos;ll get back to you promptly.</p>
        </td></tr>`),
  },
  {
    label: "Evaluation Ended",
    subject: "Your Evaluation — Next Steps",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">This One Didn&apos;t Go to Plan.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], thank you for the effort you put into your evaluation. Unfortunately this attempt has come to an end.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The most consistently successful funded traders rarely pass on the first attempt. What separates them is what they do next — they review, adapt, and go again.</p>
          <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">When you&apos;re ready, we&apos;d love to help you set up another challenge. Reply to this email and we&apos;ll discuss your options.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Ready to go again?</p>
          <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:13px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Apply for Another Challenge &rarr;</a>
        </td></tr>`),
  },
  {
    label: "Newsletter — The Funded Trader #1",
    subject: "The Funded Trader — Issue #1 | Eleusis FX",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020305;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020305;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

        <tr><td style="padding-bottom:8px;">
          <span style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">ELEUSIS<span style="color:#e8eaf0;">.</span>FX</span>
        </td></tr>
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.3);font-family:Arial,sans-serif;">The Funded Trader &nbsp;&middot;&nbsp; Issue #1</p>
        </td></tr>

        <tr><td style="padding:40px 0 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:38px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Get Funded.<br>Stay Funded.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Welcome to the Eleusis FX newsletter &mdash; your regular resource for prop firm insights, trading strategy, and everything you need to pass your evaluation and keep your funded account.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">In This Issue</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">01</span> Prop Firm Comparison Guide &mdash; FTMO vs TFF &amp; more</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">02</span> What Is an FTMO Challenge and How Does It Work?</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">03</span> Why Most Traders Fail Their Prop Firm Evaluation</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Feature</p>
          <h2 style="margin:0 0 16px;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">Which Prop Firm Is Right for You?</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Not all prop firms are created equal. Fees, drawdown methodology, payout structures, and trading restrictions vary significantly between FTMO, True Forex Funds, and others. Before you choose, make sure you&apos;re comparing the right things.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We&apos;ve put together a full side-by-side breakdown covering every major factor &mdash; so you can make an informed decision, not just go with the most well-known name.</p>
          <a href="https://eleusisfx.uk/compare" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">View Comparison Guide &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Article</p>
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.3;font-family:Arial,sans-serif;">What Is an FTMO Challenge and How Does It Work?</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">A complete breakdown of the FTMO evaluation process &mdash; phases, trailing drawdown rules, profit splits, and what you need to know before you start.</p>
          <a href="https://eleusisfx.uk/articles/what-is-an-ftmo-challenge" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;text-decoration:none;font-family:Arial,sans-serif;">Read Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Article</p>
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.3;font-family:Arial,sans-serif;">Why Most Traders Fail Their Prop Firm Evaluation</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Five specific failure patterns account for the majority of evaluation failures &mdash; and most have nothing to do with whether the trader has a working strategy.</p>
          <a href="https://eleusisfx.uk/articles/why-traders-fail-prop-firm-evaluation" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;text-decoration:none;font-family:Arial,sans-serif;">Read Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Ready to Get Started?</p>
              <p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">87% of our clients pass. Let us handle yours.</p>
              <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#e8eaf0;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Apply Now &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding-top:28px;">
          <p style="margin:0;font-size:11px;color:rgba(210,220,240,0.28);line-height:1.7;font-family:Arial,sans-serif;">
            Eleusis FX &nbsp;&middot;&nbsp; <a href="https://eleusisfx.uk" style="color:rgba(210,220,240,0.28);text-decoration:none;">eleusisfx.uk</a><br>
            Questions? Reply to this email or contact <a href="mailto:admin@eleusisfx.uk" style="color:rgba(210,220,240,0.28);text-decoration:none;">admin@eleusisfx.uk</a><br>
            <a href="https://eleusisfx.uk" style="color:rgba(210,220,240,0.15);text-decoration:none;font-size:10px;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    label: "Re-engagement",
    subject: "Ready for Another Run? — Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">It&apos;s Been a While.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we hope your trading has been going well. We&apos;re reaching out because we think you&apos;d be a great fit for another run.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We currently have clients successfully progressing through their evaluations — and the market conditions have been creating some clean, high-probability setups.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">If you&apos;re ready to go again, reply to this email and we&apos;ll get you set up at the best available rate.</p>
          <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Apply Now &rarr;</a>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.58);font-family:Arial,sans-serif;">Or simply reply to this email — we&apos;ll take it from there.</p>
        </td></tr>`),
  },
];

const PDF_ASSETS = [
  { key: "5-fatal-mistakes",       label: "5 Fatal Mistakes That Kill Prop Accounts",    file: "eleusis-fx-5-fatal-mistakes.pdf" },
  { key: "30-day-blueprint",       label: "The 30-Day Evaluation Blueprint",              file: "eleusis-fx-30-day-blueprint.pdf" },
  { key: "funded-trader-mindset",  label: "The Funded Trader Mindset",                   file: "eleusis-fx-funded-trader-mindset.pdf" },
  { key: "ftmo-vs-tff",            label: "FTMO vs True Forex Funds — Comparison Guide", file: "articles/ftmo-vs-true-forex-funds" },
  { key: "what-is-ftmo-challenge", label: "What Is an FTMO Challenge?",                  file: "articles/what-is-an-ftmo-challenge" },
  { key: "why-traders-fail",       label: "Why Traders Fail Prop Firm Evaluations",      file: "articles/why-traders-fail-prop-firm-evaluation" },
];

const SITE_URL = "https://eleusisfx.uk";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#020305",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8eaf0", fontFamily: "inherit",
  fontSize: 13, padding: "10px 14px",
  outline: "none", borderRadius: 3,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "monospace", fontSize: 10,
  letterSpacing: 1.5, textTransform: "uppercase" as const,
  color: "rgba(210,220,240,0.35)", marginBottom: 8, display: "block",
};

const selectStyle: React.CSSProperties = {
  background: "#020305", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8eaf0", fontFamily: "inherit",
  fontSize: 12, padding: "10px 14px",
  outline: "none", borderRadius: 3, cursor: "pointer",
};

export default function EmailEditorClient({ recipients }: { recipients: Recipient[] }) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Recipients
  const [selected, setSelected]               = useState<Recipient[]>([]);
  const [customInput, setCustomInput]         = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [dropOpen, setDropOpen]               = useState(false);

  // Template
  const [templateKey, setTemplateKey]         = useState("");
  const [templatePreview, setTemplatePreview] = useState("");

  // PDF asset
  const [pdfKey, setPdfKey]                   = useState("");

  // Editor
  const [subject, setSubject]       = useState("");
  const [mode, setMode]             = useState<"compose" | "html">("compose");
  const [htmlSource, setHtmlSource] = useState("");
  const [composeHtml, setComposeHtml] = useState("");
  const [preview, setPreview]       = useState(false);

  // Send
  const [sending, setSending]       = useState(false);
  const [result, setResult]         = useState<{ sent: number; failed: number } | null>(null);
  const [sendError, setSendError]   = useState("");

  // ── Recipient helpers ──
  const filteredRecipients = recipients.filter((r) => {
    const q = recipientSearch.toLowerCase();
    return (
      !selected.find((s) => s.email === r.email) &&
      (r.label.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    );
  });
  const grouped = ["Active Clients", "Past Clients"].map((g) => ({
    group: g, items: filteredRecipients.filter((r) => r.group === g),
  })).filter((g) => g.items.length > 0);

  function addRecipient(r: Recipient) {
    setSelected((prev) => [...prev, r]);
    setRecipientSearch("");
  }
  function addCustom() {
    const email = customInput.trim();
    if (!email || !email.includes("@")) return;
    if (selected.find((s) => s.email === email)) { setCustomInput(""); return; }
    setSelected((prev) => [...prev, { label: email, email, group: "Active Clients" }]);
    setCustomInput("");
  }
  function removeRecipient(email: string) {
    setSelected((prev) => prev.filter((s) => s.email !== email));
  }

  // ── Template helpers ──
  function handleTemplateChange(label: string) {
    setTemplateKey(label);
    const tpl = TEMPLATES.find((t) => t.label === label);
    setTemplatePreview(tpl?.html ?? "");
  }

  // Fix: load into html mode (textarea) so React properly syncs value
  function applyTemplate() {
    const tpl = TEMPLATES.find((t) => t.label === templateKey);
    if (!tpl) return;
    setSubject(tpl.subject);
    setHtmlSource(tpl.html);
    setComposeHtml(tpl.html);
    setMode("html");
    setPreview(true);
    setTemplateKey("");
    setTemplatePreview("");
  }

  // ── PDF insertion ──
  function insertPdfLink() {
    const pdf = PDF_ASSETS.find((p) => p.key === pdfKey);
    if (!pdf) return;
    const url = `${SITE_URL}/${pdf.file}`;
    const block = `\n<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;"><tr><td><a href="${url}" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">${pdf.label} &rarr;</a></td></tr></table>`;
    if (mode === "html") {
      setHtmlSource((prev) => prev + block);
    } else if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, `<div style="margin:20px 0;"><a href="${url}" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:12px 24px;text-decoration:none;font-family:Arial,sans-serif;">${pdf.label} →</a></div>`);
      setComposeHtml(editorRef.current.innerHTML);
    }
    setPdfKey("");
  }

  // ── Compose editor helpers ──
  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }
  function switchToHtml() {
    const html = editorRef.current?.innerHTML ?? composeHtml;
    setHtmlSource(html);
    setComposeHtml(html);
    setMode("html");
  }
  function switchToCompose() {
    if (editorRef.current) editorRef.current.innerHTML = htmlSource;
    setComposeHtml(htmlSource);
    setMode("compose");
  }
  function getHtml() { return mode === "html" ? htmlSource : composeHtml; }

  // ── Send ──
  async function handleSend() {
    const html = getHtml();
    if (!selected.length)          { setSendError("Add at least one recipient."); return; }
    if (!subject.trim())           { setSendError("Subject is required."); return; }
    if (!html.trim() || html === "<br>") { setSendError("Email body is empty."); return; }
    setSending(true); setSendError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.map((s) => s.email), subject, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data);
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Send failed");
    } finally { setSending(false); }
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2, color: "rgba(210,220,240,0.3)", marginBottom: 10 }}>{"// tools / email_editor"}</div>
        <div style={{ fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#e8eaf0", letterSpacing: -0.5 }}>Email Editor</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "rgba(210,220,240,0.5)" }}>Compose and send to clients, past clients, or custom addresses.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Template selector ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <span style={labelStyle}>{"// template"}</span>
          <div style={{ display: "flex", gap: 8, marginBottom: templatePreview ? 16 : 0 }}>
            <select
              value={templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
            >
              <option value="">Choose a template…</option>
              {TEMPLATES.map((t) => (
                <option key={t.label} value={t.label}>{t.label}</option>
              ))}
            </select>
            <button
              onClick={applyTemplate}
              disabled={!templateKey}
              style={{
                background: templateKey ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${templateKey ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: templateKey ? "#4f8ef7" : "rgba(210,220,240,0.3)",
                fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
                padding: "0 20px", cursor: templateKey ? "pointer" : "not-allowed",
                borderRadius: 3, whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >
              Load into Editor →
            </button>
          </div>

          {/* Instant iframe preview */}
          {templatePreview && (
            <div style={{ position: "relative", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 8, right: 8, zIndex: 1,
                fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                color: "rgba(210,220,240,0.4)", background: "rgba(8,9,15,0.9)",
                padding: "3px 8px", pointerEvents: "none",
              }}>
                preview
              </div>
              <iframe
                srcDoc={templatePreview}
                sandbox="allow-same-origin"
                style={{ width: "100%", height: 380, border: "none", display: "block" }}
                title="Template preview"
              />
            </div>
          )}
          {!templatePreview && (
            <div style={{ fontSize: 11, color: "rgba(210,220,240,0.3)" }}>
              Select a template to preview it here before loading. "Load into Editor" replaces the current subject and body.
            </div>
          )}
        </div>

        {/* ── Recipients ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>{"// recipients"}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setSelected(recipients)}
                style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 12px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", color: "#4f8ef7", cursor: "pointer", borderRadius: 3, whiteSpace: "nowrap" }}
              >
                Select All ({recipients.length})
              </button>
              {selected.length > 0 && (
                <button
                  onClick={() => setSelected([])}
                  style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(210,220,240,0.4)", cursor: "pointer", borderRadius: 3, whiteSpace: "nowrap" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {selected.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {selected.map((r) => (
                <div key={r.email} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)", borderRadius: 3, padding: "3px 8px 3px 10px", fontSize: 11, letterSpacing: 1, color: "#a8c8ff" }}>
                  <span>{r.label !== r.email ? `${r.label} ` : ""}<span style={{ opacity: 0.65 }}>&lt;{r.email}&gt;</span></span>
                  <button onClick={() => removeRecipient(r.email)} style={{ background: "none", border: "none", color: "rgba(168,200,255,0.6)", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 13 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              placeholder="Search clients by name or email…"
              value={recipientSearch}
              onChange={(e) => { setRecipientSearch(e.target.value); setDropOpen(true); }}
              onFocus={() => setDropOpen(true)}
              onBlur={() => setTimeout(() => setDropOpen(false), 150)}
              style={inputStyle}
            />
            {dropOpen && grouped.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: "#0d0f1a", border: "1px solid rgba(255,255,255,0.1)", maxHeight: 260, overflowY: "auto", borderTop: "none" }}>
                {grouped.map(({ group, items }) => (
                  <div key={group}>
                    <div style={{ padding: "8px 14px 4px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)" }}>{group}</div>
                    {items.map((r) => (
                      <button key={r.email} onMouseDown={() => addRecipient(r)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "9px 14px", color: "rgba(210,220,240,0.88)", fontSize: 12, transition: "background 0.1s" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(79,142,247,0.08)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "none")}>
                        <span style={{ color: "#e8eaf0" }}>{r.label}</span>
                        {r.label !== r.email && <span style={{ marginLeft: 8, color: "rgba(210,220,240,0.4)", fontSize: 11 }}>{r.email}</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Or type a new email address…" value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addCustom} style={{ background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)", color: "#4f8ef7", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 18px", cursor: "pointer", whiteSpace: "nowrap", borderRadius: 3 }}>Add</button>
          </div>
        </div>

        {/* ── Subject ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <span style={labelStyle}>{"// subject"}</span>
          <input placeholder="Email subject line…" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ ...inputStyle, fontSize: 15 }} />
        </div>

        {/* ── Insert asset ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <span style={labelStyle}>{"// insert asset"}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={pdfKey} onChange={(e) => setPdfKey(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
              <option value="">Choose a PDF / guide to insert…</option>
              {PDF_ASSETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <button onClick={insertPdfLink} disabled={!pdfKey} style={{ background: pdfKey ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${pdfKey ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.08)"}`, color: pdfKey ? "#4f8ef7" : "rgba(210,220,240,0.3)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 20px", cursor: pdfKey ? "pointer" : "not-allowed", borderRadius: 3, whiteSpace: "nowrap", transition: "all 0.2s" }}>
              Insert Link →
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(210,220,240,0.3)" }}>Inserts a branded download button into the email body.</div>
        </div>

        {/* ── Body ── */}
        <div style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={labelStyle}>{"// body"}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {(["compose", "html"] as const).map((m) => (
                <button key={m} onClick={() => m === "html" ? switchToHtml() : switchToCompose()} style={{ background: mode === m ? "rgba(79,142,247,0.15)" : "none", border: `1px solid ${mode === m ? "rgba(79,142,247,0.4)" : "rgba(255,255,255,0.1)"}`, color: mode === m ? "#4f8ef7" : "rgba(210,220,240,0.55)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 12px", cursor: "pointer", borderRadius: 3 }}>
                  {m === "compose" ? "Compose" : "HTML"}
                </button>
              ))}
              <button onClick={() => setPreview((p) => !p)} style={{ background: preview ? "rgba(34,197,94,0.1)" : "none", border: `1px solid ${preview ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, color: preview ? "#22c55e" : "rgba(210,220,240,0.55)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 12px", cursor: "pointer", borderRadius: 3 }}>
                Preview
              </button>
            </div>
          </div>

          {/* Compose toolbar */}
          {mode === "compose" && !preview && (
            <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
              {TOOLBAR.map(({ cmd, icon, title, style: s }) => (
                <button key={cmd} title={title} onMouseDown={(e) => { e.preventDefault(); exec(cmd); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(210,220,240,0.88)", cursor: "pointer", width: 32, height: 32, fontSize: 12, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", ...s }}>{icon}</button>
              ))}
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
              <select onChange={(e) => exec("fontSize", e.target.value)} defaultValue="" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(210,220,240,0.88)", fontSize: 11, padding: "0 8px", cursor: "pointer", borderRadius: 3, height: 32 }}>
                <option value="" disabled>Size</option>
                {[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>{["8","10","12","14","18","24","36"][n-1]}px</option>)}
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }} title="Text colour">
                <span style={{ fontSize: 11, color: "rgba(210,220,240,0.55)" }}>A</span>
                <input type="color" defaultValue="#e8eaf0" onChange={(e) => exec("foreColor", e.target.value)} style={{ width: 24, height: 24, padding: 0, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "none", borderRadius: 3 }} />
              </div>
              <button title="Insert link" onMouseDown={(e) => { e.preventDefault(); const url = prompt("URL:"); if (url) exec("createLink", url); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(210,220,240,0.88)", cursor: "pointer", padding: "0 10px", height: 32, fontSize: 11, borderRadius: 3, letterSpacing: 0.5 }}>Link</button>
              <button title="Clear formatting" onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(210,220,240,0.55)", cursor: "pointer", padding: "0 10px", height: 32, fontSize: 10, borderRadius: 3, letterSpacing: 0.5 }}>Clear</button>
            </div>
          )}

          {/* Compose editor */}
          {mode === "compose" && !preview && (
            <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={() => setComposeHtml(editorRef.current?.innerHTML ?? "")} style={{ minHeight: 340, background: "#020305", border: "1px solid rgba(255,255,255,0.1)", color: "#e8eaf0", fontSize: 14, lineHeight: 1.7, padding: "16px 18px", outline: "none", borderRadius: 3 }} />
          )}

          {/* HTML source */}
          {mode === "html" && !preview && (
            <textarea value={htmlSource} onChange={(e) => setHtmlSource(e.target.value)} spellCheck={false} style={{ ...inputStyle, minHeight: 340, fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, resize: "vertical" }} />
          )}

          {/* Preview — iframe properly renders full HTML email templates */}
          {preview && (
            <iframe
              srcDoc={getHtml() || "<body style='background:#020305;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;padding:40px;font-size:13px;'>Nothing to preview yet.</body>"}
              sandbox="allow-same-origin"
              style={{ width: "100%", height: 600, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, display: "block", background: "#020305" }}
              title="Email preview"
            />
          )}
        </div>

        {/* ── Send bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px" }}>
          <div>
            {sendError && <div style={{ color: "#ef4444", fontSize: 12, letterSpacing: 0.5 }}>{sendError}</div>}
            {result && (
              <div style={{ fontSize: 12, color: "#22c55e", letterSpacing: 0.5 }}>
                ✓ Sent to {result.sent} recipient{result.sent !== 1 ? "s" : ""}
                {result.failed > 0 && <span style={{ color: "#ef4444", marginLeft: 8 }}>· {result.failed} failed</span>}
              </div>
            )}
            {!sendError && !result && <div style={{ fontSize: 11, color: "rgba(210,220,240,0.3)", letterSpacing: 0.5 }}>{selected.length} recipient{selected.length !== 1 ? "s" : ""} selected</div>}
          </div>
          <button onClick={handleSend} disabled={sending} style={{ background: sending ? "rgba(79,142,247,0.2)" : "#4f8ef7", border: "none", color: sending ? "#4f8ef7" : "#020305", fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "12px 32px", cursor: sending ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
            {sending ? "Sending…" : "Send Email"}
          </button>
        </div>

      </div>
    </div>
  );
}
