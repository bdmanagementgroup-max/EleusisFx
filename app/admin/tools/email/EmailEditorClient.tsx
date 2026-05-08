"use client";

import { useRef, useState, useEffect } from "react";
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
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Daily drawdown limit: <strong style="color:#e8eaf0;">2%</strong></td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Maximum drawdown: <strong style="color:#e8eaf0;">10%</strong></td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Minimum trading days: <strong style="color:#e8eaf0;">4</strong></td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Profit target: <strong style="color:#22c55e;">10%</strong></td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Your VPS &amp; AI Risk Manager</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:24px 24px 20px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">Dedicated VPS assigned to your account.</p>
              <p style="margin:0 0 14px;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">To ensure full compliance and protect against any IP-related issues with your prop firm, every client account is assigned a dedicated Virtual Private Server (VPS) running the Eleusis FX proprietary AI risk manager.</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">This means all trading activity originates from a clean, isolated environment &mdash; completely separate from your personal IP address &mdash; with our AI risk manager monitoring every position in real time to enforce drawdown limits and protect the account at all times.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">If you have any questions at any point, reply to this email or reach out at <a href="mailto:admin@eleusisfx.uk" style="color:#4f8ef7;text-decoration:none;">admin@eleusisfx.uk</a>. We&apos;re here throughout.</p>
          <p style="margin:0;font-size:14px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Best of luck — we&apos;re rooting for you.</p>
        </td></tr>`),
  },
  // ─── Prospect Offer Templates ────────────────────────────────────────────────
  {
    label: "Prospect — £550 · Evaluation Pass",
    subject: "Your Application — £550 Evaluation Pass | Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">New Application</p>
          <h1 style="margin:0 0 16px;font-size:36px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Your Application&apos;s In.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we&apos;ve reviewed your application. Based on your evaluation target, here&apos;s exactly what we&apos;re putting in front of you.</p>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">The Offer</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px 28px 24px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">$50,000 Evaluation Pass</p>
              <p style="margin:0 0 4px;font-size:40px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1;font-family:Arial,sans-serif;">&pound;550</p>
              <p style="margin:0 0 24px;font-size:12px;color:rgba(210,220,240,0.45);font-family:Arial,sans-serif;">One payment. No monthly fees. No hidden costs.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> We trade Phase 1 &amp; Phase 2 on your behalf
                </td></tr>
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> Strict rules compliance &mdash; zero violations
                </td></tr>
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> You keep 80% of all profits on the funded account
                </td></tr>
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> Re-trade at no charge if we fail (we never have)
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">The Numbers</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Once you&apos;re funded, your $50,000 account starts generating returns immediately. Here&apos;s what conservative monthly performance looks like after costs:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;width:50%;">Monthly Return</td>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Your 80% Share</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">3% &mdash; conservative</td>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">~&pound;1,185/month</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">5% &mdash; typical</td>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">~&pound;1,975/month</td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:rgba(210,220,240,0.45);font-family:Arial,sans-serif;">Your &pound;550 investment pays for itself inside the first two weeks of live trading.</p>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Why It Works</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The FTMO pass rate for self-directed traders sits below 10%. That&apos;s not because traders don&apos;t have a strategy. It&apos;s because the evaluation environment changes how people trade &mdash; they oversize, they revenge trade, they abandon their process under pressure.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-left:3px solid #4f8ef7;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">We remove the psychological variable entirely.</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Our traders are not personally exposed to the outcome of your evaluation. They execute the same disciplined process they run every day &mdash; 15 years of experience, 700+ evaluations passed since 2019.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Track Record</p>
              <p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">87% pass rate &nbsp;&middot;&nbsp; 700+ clients &nbsp;&middot;&nbsp; Operating since 2019.</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">UK-based, face-on-camera, fully verifiable. We don&apos;t run automated strategies. Every evaluation is traded by an experienced human trader with a documented track record.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">What Happens Next</p>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:14px;vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;">01</span>
              </td>
              <td style="padding:4px 0 14px 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">Reply to this email to confirm you want to proceed.</td>
            </tr>
            <tr>
              <td style="padding-bottom:14px;vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;">02</span>
              </td>
              <td style="padding:4px 0 14px 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">We send a payment link and confirm your evaluation start date.</td>
            </tr>
            <tr>
              <td style="vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;">03</span>
              </td>
              <td style="padding:4px 0 0 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">We trade your evaluation. You watch your dashboard. You get funded.</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Spots are limited this month. Reply to this email to confirm your place or ask any questions.</p>
          <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Confirm Your Spot &rarr;</a>
        </td></tr>`),
  },
  {
    label: "Prospect — £1,100 · Evaluation Pass",
    subject: "Your Application — £1,100 Evaluation Pass | Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">New Application</p>
          <h1 style="margin:0 0 16px;font-size:36px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Your Application&apos;s In.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we&apos;ve reviewed your application. This is the offer we put to most of our clients &mdash; and the one that produces the strongest return on investment.</p>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">The Offer</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px 28px 24px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">$100,000 Evaluation Pass</p>
              <p style="margin:0 0 4px;font-size:40px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1;font-family:Arial,sans-serif;">&pound;1,100</p>
              <p style="margin:0 0 24px;font-size:12px;color:rgba(210,220,240,0.45);font-family:Arial,sans-serif;">One payment. No monthly fees. No hidden costs.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> We trade Phase 1 &amp; Phase 2 on your behalf
                </td></tr>
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> Strict rules compliance &mdash; zero violations
                </td></tr>
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> You keep 80% of all profits on the funded account
                </td></tr>
                <tr><td style="padding:9px 0;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
                  <span style="color:#4f8ef7;margin-right:10px;">&#10003;</span> Re-trade at no charge if we fail (we never have)
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">The Numbers</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Once you&apos;re funded on a $100,000 account, your 80% profit share builds quickly. Here&apos;s what conservative monthly performance looks like:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;width:50%;">Monthly Return</td>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Your 80% Share</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">3% &mdash; conservative</td>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">~&pound;2,370/month</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">5% &mdash; typical</td>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">~&pound;3,950/month</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">10% &mdash; strong month</td>
              <td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">~&pound;7,900/month</td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:rgba(210,220,240,0.45);font-family:Arial,sans-serif;">Your &pound;1,100 investment pays for itself inside the first two weeks of live trading at conservative returns.</p>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">What You&apos;re Avoiding</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">FTMO&apos;s trailing maximum drawdown rule catches more traders than any other part of the evaluation &mdash; including experienced ones. The floor rises with your equity, meaning a strong start actively reduces your margin for error later. Most traders don&apos;t discover this until the challenge ends.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-left:3px solid #4f8ef7;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">We manage the drawdown mechanics so you don&apos;t have to.</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Our traders track every rule parameter in real time across every session. We&apos;ve passed 700+ evaluations and know exactly where challenges end &mdash; and how to ensure they don&apos;t.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Track Record</p>
              <p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">87% pass rate &nbsp;&middot;&nbsp; 700+ clients &nbsp;&middot;&nbsp; Operating since 2019.</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">UK-based, face-on-camera, fully verifiable. We don&apos;t run automated strategies or outsource. Every evaluation is traded by an experienced human trader with 15 years of documented track record across FTMO, True Forex Funds, and other leading prop firms.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">What Happens Next</p>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:14px;vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;">01</span>
              </td>
              <td style="padding:4px 0 14px 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">Reply to this email to confirm you want to proceed.</td>
            </tr>
            <tr>
              <td style="padding-bottom:14px;vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;">02</span>
              </td>
              <td style="padding:4px 0 14px 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">We send a payment link and confirm your evaluation start date.</td>
            </tr>
            <tr>
              <td style="vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;">03</span>
              </td>
              <td style="padding:4px 0 0 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">We trade your evaluation. You track progress live in your dashboard. You get funded.</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Spots are limited this month. Reply to confirm your place or ask any questions &mdash; we respond same day.</p>
          <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Confirm Your Spot &rarr;</a>
        </td></tr>`),
  },
  // ─── End Prospect Offer Templates ─────────────────────────────────────────
  // ─── Application Nurture Sequence (Days 2–5) ──────────────────────────────
  {
    label: "Nurture Day 2 — Why Eleusis FX",
    subject: "Why 700+ Traders Chose Eleusis FX — Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Day 2</p>
          <h1 style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Why Traders Choose Us.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we&apos;ll follow up on your application shortly. In the meantime — here&apos;s why over 700 traders have trusted Eleusis FX with their evaluations.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">What Sets Us Apart</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:14px 18px;background:#08090f;border:1px solid rgba(79,142,247,0.2);border-bottom:none;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">15 Years Experience</p>
              <p style="margin:0;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">Manual price action and volume analysis — no black box, no automated system. We trade it the right way.</p>
            </td></tr>
            <tr><td style="padding:14px 18px;background:#08090f;border:1px solid rgba(79,142,247,0.2);border-bottom:none;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Guaranteed Pass</p>
              <p style="margin:0;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">We trade on your behalf. If the evaluation doesn&apos;t pass, we make it right — no excuses, no grey areas.</p>
            </td></tr>
            <tr><td style="padding:14px 18px;background:#08090f;border:1px solid rgba(79,142,247,0.2);">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Transparent &amp; Verified</p>
              <p style="margin:0;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">Real face, real track record, verified throughout trading communities. Not another faceless service.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We&apos;ll be in touch within 24 hours to confirm your spot and walk you through the process. Any questions in the meantime — just reply here.</p>
          <a href="https://eleusisfx.uk" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Learn More &rarr;</a>
        </td></tr>`),
  },
  {
    label: "Nurture Day 3 — The ROI Case",
    subject: "Is £1,150 Worth It? Here's the Maths — Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Day 3</p>
          <h1 style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">The Numbers Don&apos;t Lie.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we know what you&apos;re thinking. Is £1,150 worth it? Let&apos;s break it down.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">The Return on a £100K Account</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:24px 24px 0;">
              <p style="margin:0 0 20px;font-size:13px;line-height:1.7;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">A funded £100K account at a conservative 5% monthly return generates <strong style="color:#22c55e;">£5,000/month</strong>. At 80% profit split that&apos;s <strong style="color:#22c55e;">£4,000 in your pocket — every month.</strong></p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.58);font-family:Arial,sans-serif;">Evaluation Pass Fee</td>
                  <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:13px;color:#e8eaf0;font-family:Arial,sans-serif;">£1,150</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.58);font-family:Arial,sans-serif;">Month 1 Return (conservative)</td>
                  <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:13px;color:#22c55e;font-family:Arial,sans-serif;">+£4,000</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:13px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">ROI After Month 1</td>
                  <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">+248%</td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="padding:16px 24px 24px;">
              <p style="margin:0;font-size:12px;color:rgba(210,220,240,0.4);line-height:1.6;font-family:Arial,sans-serif;">The fee pays for itself in the first month. Everything after that is profit.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Ready to move forward? Reply to this email or DM us on Instagram <a href="https://instagram.com/eleusisfx" style="color:#4f8ef7;text-decoration:none;">@EleusisFx</a> and we&apos;ll get you started.</p>
          <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Secure Your Spot &rarr;</a>
        </td></tr>`),
  },
  {
    label: "Nurture Day 4 — Urgency",
    subject: "We Only Take a Limited Number of Clients — Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Day 4</p>
          <h1 style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Spots Are Limited.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], a quick note on how we work — and why it matters for your application.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We don&apos;t run a volume business. We trade every evaluation account manually — that means we can only take on a limited number of clients at any one time.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-left:3px solid #4f8ef7;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0;font-size:14px;line-height:1.75;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">&ldquo;Each account gets the same attention as if it were my own money on the line. That&apos;s the standard we hold.&rdquo;</p>
              <p style="margin:12px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;font-family:Arial,sans-serif;">— Ben Davies, Eleusis FX</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Your application is still under review. If you haven&apos;t heard back yet, now is the right time to confirm your interest — spots go quickly and we work on a first-confirmed basis.</p>
          <a href="mailto:admin@eleusisfx.uk" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Confirm My Interest &rarr;</a>
        </td></tr>`),
  },
  {
    label: "Nurture Day 5 — Final CTA",
    subject: "Still Interested? Here's How to Get Started — Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Day 5</p>
          <h1 style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Last One From Us.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we don&apos;t believe in chasing. If the timing isn&apos;t right, that&apos;s fine — but if you&apos;re still serious about getting funded, here&apos;s exactly what to do next.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">How to Get Started</p>
          <table cellpadding="0" cellspacing="0" border="0">
            ${["Reply to this email with &ldquo;I&apos;m in&rdquo; — we&apos;ll confirm availability and send you the details.", "We set up your evaluation account and start trading on your behalf.", "You track progress in your dashboard. We handle the rest.", "You pass. You get funded. We take 20% of monthly profits after that."].map((t, i) => `
            <tr>
              <td style="padding-bottom:16px;vertical-align:top;">
                <span style="display:inline-block;width:28px;height:28px;border:1px solid rgba(79,142,247,0.25);font-size:9px;letter-spacing:1px;color:#4f8ef7;text-align:center;line-height:28px;font-family:Arial,sans-serif;">0${i + 1}</span>
              </td>
              <td style="padding:4px 0 16px 14px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">${t}</td>
            </tr>`).join("")}
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">700+ traders have been through this process. The ones who got funded are the ones who took the step.</p>
          <a href="mailto:admin@eleusisfx.uk?subject=I'm in" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">I&apos;m In &rarr;</a>
        </td></tr>

        <tr><td style="padding:32px 0;">
          <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.58);font-family:Arial,sans-serif;">Or DM us on Instagram: <a href="https://instagram.com/eleusisfx" style="color:#4f8ef7;text-decoration:none;">@EleusisFx</a></p>
        </td></tr>`),
  },
  // ─── End Nurture Sequence ──────────────────────────────────────────────────

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
    label: "Newsletter — The Funded Trader #2",
    subject: "The Funded Trader — Issue #2 | Eleusis FX",
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
          <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.3);font-family:Arial,sans-serif;">The Funded Trader &nbsp;&middot;&nbsp; Issue #2</p>
        </td></tr>

        <tr><td style="padding:40px 0 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:38px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Choose Right.<br>Trade Better.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Issue #2 of The Funded Trader. This month we&apos;re looking at firm selection, the blueprint we use to get clients through evaluations in under 30 days, and a tip that separates traders who pass from those who don&apos;t.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">In This Issue</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">01</span> FTMO vs True Forex Funds &mdash; The Honest Verdict</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">02</span> Free Download &mdash; The 30-Day Evaluation Blueprint</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">03</span> This Month&apos;s Tip &mdash; Why Your Position Size Is Killing You</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Feature</p>
          <h2 style="margin:0 0 16px;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">FTMO vs True Forex Funds: The Honest Verdict</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Both are industry leaders. Both have passed thousands of traders. But the differences in drawdown methodology, scaling plans, and payout structures mean one is likely a significantly better fit for your specific trading style.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We break down every major factor &mdash; no affiliate bias, no marketing fluff. Just the details that actually matter when you&apos;re putting real money on the line.</p>
          <a href="https://eleusisfx.uk/articles/ftmo-vs-true-forex-funds" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Read the Full Comparison &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.15);border-left:3px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Free Download</p>
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;font-family:Arial,sans-serif;">The 30-Day Evaluation Blueprint</h2>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The exact approach we use with every client &mdash; daily structure, risk parameters, drawdown management, and the mindset framework that gets evaluations passed in under 30 days. Download it free.</p>
              <a href="https://eleusisfx.uk/eleusis-fx-30-day-blueprint.pdf" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:13px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Download Free PDF &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">This Month&apos;s Tip</p>
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.3;font-family:Arial,sans-serif;">Your Position Size Is Killing You</h2>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The single most common reason traders fail prop firm evaluations has nothing to do with their strategy, their entries, or their market read. It&apos;s position sizing. Specifically &mdash; sizing too large on any single trade relative to the daily drawdown limit.</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">On a 5% daily drawdown limit, a single 2% loss trade eats 40% of your daily allowance. Two trades and you&apos;re walking on glass. The traders who consistently pass treat the daily limit as a hard ceiling &mdash; and size every trade so that even 3 consecutive losers don&apos;t breach it.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);">
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#e8eaf0;">Rule of thumb:</strong> Max 0.5&ndash;1% risk per trade during an evaluation.
            </td></tr>
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
              Use our <a href="https://eleusisfx.uk/resources/position-size-calculator" style="color:#4f8ef7;text-decoration:none;">Position Size Calculator</a> to find the exact lot size for every trade.
            </td></tr>
          </table>
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
    label: "Newsletter — The Funded Trader #3",
    subject: "The Funded Trader — Issue #3 | Eleusis FX",
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
          <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.3);font-family:Arial,sans-serif;">The Funded Trader &nbsp;&middot;&nbsp; Issue #3</p>
        </td></tr>

        <tr><td style="padding:40px 0 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:38px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Know the Rules.<br>Beat the Odds.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Issue #3 of The Funded Trader. This month we&apos;ve published three new articles covering everything from how evaluations actually work to which prop firm suits your style &mdash; plus this month&apos;s practical tip.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">In This Issue</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">01</span> What Is an FTMO Challenge and How Does It Work?</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">02</span> Why Most Traders Fail Their Prop Firm Evaluation</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">03</span> FTMO vs True Forex Funds &mdash; The Honest Verdict</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">04</span> This Month&apos;s Tip &mdash; How to Read Your Equity Curve</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Article 01</p>
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">What Is an FTMO Challenge and How Does It Work?</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">A complete breakdown of both evaluation phases, trailing vs. fixed drawdown, profit targets, minimum trading days, and the specific rules that catch traders off guard in week one.</p>
          <a href="https://eleusisfx.uk/articles/what-is-an-ftmo-challenge" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;text-decoration:none;font-family:Arial,sans-serif;">Read Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Article 02</p>
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">Why Most Traders Fail Their Prop Firm Evaluation</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Three specific failure patterns account for most disqualifications &mdash; and they have nothing to do with market read. Oversizing, revenge trading, and misreading drawdown rules explained.</p>
          <a href="https://eleusisfx.uk/articles/why-traders-fail-prop-firm-evaluation" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;text-decoration:none;font-family:Arial,sans-serif;">Read Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Article 03</p>
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">FTMO vs True Forex Funds: The Honest Verdict</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Fees, drawdown methodology, payout splits, and which trading styles each firm suits best. No affiliate bias &mdash; just the comparison that actually matters before you commit.</p>
          <a href="https://eleusisfx.uk/articles/ftmo-vs-true-forex-funds" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;text-decoration:none;font-family:Arial,sans-serif;">Read Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">This Month&apos;s Tip</p>
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.3;font-family:Arial,sans-serif;">How to Read Your Equity Curve During an Evaluation</h2>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">A smooth equity curve during an evaluation isn&apos;t a bonus &mdash; it&apos;s evidence of discipline. Spiky curves with big drawdown recoveries tend to mean you got lucky once. Prop firms know this, and many reviewers flag volatile equity histories even if the account technically passed.</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Aim for a curve that trends up gradually, with each drawdown being smaller than the last recovery. That pattern reflects consistent position sizing and selective trade entry &mdash; both qualities that get you funded and keep you funded.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);">
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
              <strong style="color:#e8eaf0;">Track yours live:</strong> Your equity curve is updated in real time on your <a href="https://eleusisfx.uk/login" style="color:#4f8ef7;text-decoration:none;">Eleusis FX dashboard</a>.
            </td></tr>
          </table>
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
    label: "Newsletter — The Funded Trader #4",
    subject: "The Funded Trader — Issue #4 | Eleusis FX",
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
          <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.3);font-family:Arial,sans-serif;">The Funded Trader &nbsp;&middot;&nbsp; Issue #4</p>
        </td></tr>

        <tr><td style="padding:40px 0 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:38px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Manage Risk.<br>Pass Evaluations.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Issue #4 of The Funded Trader. This month we&apos;re diving into risk management frameworks that separate traders who pass from those who don&apos;t — plus the daily protocols our 700+ successful clients use.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">In This Issue</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">01</span> What Happens if You Fail Your FTMO Challenge</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">02</span> The 3-Layer Risk Framework That Works</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">03</span> Daily Risk Protocol — Session Checklist</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">04</span> This Month&apos;s Tip &mdash; The Recovery Protocol</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Article 01</p>
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">What Happens If You Fail Your FTMO Challenge?</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The financial consequences, reset options, and the critical question of whether retrying alone or using a service makes sense. Full breakdown of failure patterns and how to avoid them.</p>
          <a href="https://eleusisfx.uk/articles/what-happens-if-you-fail-ftmo-challenge" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;text-decoration:none;font-family:Arial,sans-serif;">Read Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.15);border-left:3px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Framework</p>
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;font-family:Arial,sans-serif;">The 3-Layer Risk Framework</h2>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Every successful evaluation uses three nested risk limits: daily, weekly, and total drawdown. Traders who violate one without understanding the others are gambling, not trading.</p>
              <a href="https://eleusisfx.uk/resources/drawdown-tracker" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:13px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Use the Drawdown Tracker &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Daily Protocol</p>
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.3;font-family:Arial,sans-serif;">The Session Checklist: Before You Trade</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Risk protocol begins before you open a position. Our 700+ funded traders use the same pre-session checklist to verify they&apos;re within limits, that they&apos;ve calculated position size correctly, and that they haven&apos;t accumulated hidden risk from overnight positions.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);">
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#e8eaf0;">✓ Current account balance</strong> vs. starting balance
            </td></tr>
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#e8eaf0;">✓ Today&apos;s drawdown floor</strong> from your peak
            </td></tr>
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#e8eaf0;">✓ Daily loss limit</strong> (5% of account balance)
            </td></tr>
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#e8eaf0;">✓ Overnight floating losses</strong> from open positions
            </td></tr>
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
              <strong style="color:#e8eaf0;">✓ Scheduled news events</strong> (NFP, FOMC, CPI, etc.)
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">This Month&apos;s Tip</p>
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.3;font-family:Arial,sans-serif;">The Recovery Protocol — After a Red Day</h2>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Losing days are guaranteed. How you respond to them determines whether you pass your evaluation. Revenge trading, oversizing to make back losses, and abandoning your daily routine are the three fastest ways to blow up an account.</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Our clients follow a strict recovery protocol: scale down position size by 50%, reduce trade count, and focus on process over profit for the next 2–3 sessions. This forces discipline and prevents the compounding effect of emotional decision-making.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);">
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#f39c12;">Day 1 (Red day loss):</strong> Document the reason. Review entries. Go offline for 2 hours. No second session.
            </td></tr>
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">
              <strong style="color:#f39c12;">Days 2–3:</strong> 50% position size. Max 1 trade per session. Zero revenge entries.
            </td></tr>
            <tr><td style="padding:16px 20px;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
              <strong style="color:#22c55e;">Day 4+:</strong> Resume normal if the next two days were green. Full protocol reset only after two consecutive green days.
            </td></tr>
          </table>
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
    label: "Weekly Market Analysis — Prospect",
    subject: "This Week's Live Setups — USDJPY Sell + EURUSD Buy | Eleusis FX",
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
          <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.3);font-family:Arial,sans-serif;">Weekly Market Analysis &nbsp;&middot;&nbsp; 3 May 2026</p>
        </td></tr>

        <!-- Hero -->
        <tr><td style="padding:40px 0 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:38px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">This Week&apos;s<br>Live Setups.</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Each week, the Eleusis FX desk scans 16 forex and crypto pairs and filters for the highest-conviction setups only. This week we have two live signals &mdash; both driven by the same macro theme: US Dollar weakness.</p>
          <p style="margin:0;font-size:13px;color:rgba(210,220,240,0.45);font-family:Arial,sans-serif;">Not financial advice. For educational purposes. Always trade your own plan.</p>
        </td></tr>

        <!-- Macro context -->
        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Macro Context</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.15);border-left:3px solid #4f8ef7;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">DXY at ~98 &mdash; Dollar weak and falling.</p>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The Fed held rates at the April 28&ndash;29 FOMC meeting. The Bank of Japan deployed an estimated $30B in yen-buying on April 30&ndash;May 1 to slam USD/JPY back from the 160.00 danger zone. Dollar weakness is the dominant theme.</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><strong style="color:#f39c12;">&#9888; NFP Friday 8 May</strong> &mdash; Non-Farm Payrolls drops Friday. High-volatility event. Professional traders reduce size or step aside before major data releases.</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Signal 1: USDJPY -->
        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#e74c3c;font-weight:700;font-family:Arial,sans-serif;">Live Setup #1 &mdash; Bearish</p>
          <h2 style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">USD/JPY &mdash; Sell Setup &#9989;</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">USD/JPY broke above 160.00 last week &mdash; a level Japanese authorities had been defending for months. Within hours they responded with an estimated $30 billion in yen-buying, sending the pair crashing back below 158. That&apos;s not a random candle. That&apos;s a government enforcing a ceiling.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">158.00 has now <strong style="color:#e8eaf0;">flipped from support to resistance</strong>. The play is to sell any rally back into that zone. Downside targets: 156.30 then 154.80.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #e74c3c;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;width:90px;">Entry</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">Sell 157.80 &ndash; 158.00</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Stop Loss</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e74c3c;font-family:Arial,sans-serif;">158.80</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP1</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">156.30 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(1.8:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP2</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">154.80 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(3.2:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Invalidation</td>
                  <td style="padding:7px 0;font-size:13px;color:rgba(210,220,240,0.7);font-family:Arial,sans-serif;">Daily close above 158.80</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Signal 2: EURUSD -->
        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#22c55e;font-weight:700;font-family:Arial,sans-serif;">Live Setup #2 &mdash; Bullish</p>
          <h2 style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">EUR/USD &mdash; Buy Setup &#9989;</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">EUR/USD has been making higher highs and higher lows all year. The pair pushed to new 2026 highs near 1.1790 before pulling back to its Daily 20 EMA &mdash; the moving average that has acted as support throughout this entire uptrend. That pullback is now over.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Dollar weakness + clean trend structure + key level bounce. Three confluence signals from three different categories. This is how professional traders filter noise from opportunity.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #22c55e;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;width:90px;">Entry</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">1.1710 &ndash; 1.1720</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Stop Loss</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e74c3c;font-family:Arial,sans-serif;">1.1655</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP1</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">1.1790 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(1.2:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP2</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">1.1838 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(2.0:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Invalidation</td>
                  <td style="padding:7px 0;font-size:13px;color:rgba(210,220,240,0.7);font-family:Arial,sans-serif;">Daily close below 1.1655</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Watchlist -->
        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Also On Watchlist</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#f39c12;margin-right:10px;">&#9654;</span> <strong style="color:#e8eaf0;">GBP/USD</strong> &mdash; Watching for pullback to 1.3350&ndash;1.3380 before entry</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#f39c12;margin-right:10px;">&#9654;</span> <strong style="color:#e8eaf0;">BTC/USDT</strong> &mdash; Waiting for clean daily close above $80,500 before entry</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#f39c12;margin-right:10px;">&#9654;</span> <strong style="color:#e8eaf0;">USD/CAD</strong> &mdash; Bearish bias, waiting for resistance retest ~1.3700</td></tr>
          </table>
        </td></tr>

        <!-- PDF CTA -->
        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Free Download</p>
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;font-family:Arial,sans-serif;">Full Analysis Report &mdash; PDF</h2>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Get the full branded analysis report including detailed setup breakdowns, macro context, NFP risk protocol, and the complete watchlist &mdash; all in one premium PDF.</p>
              <a href="https://eleusisfx.uk" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:13px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Download the Report &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Main CTA -->
        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Want These Trades Executed For You?</p>
              <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#e8eaf0;font-family:Arial,sans-serif;">Evaluation Pass &mdash; &pound;1,150</p>
              <p style="margin:0 0 20px;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We trade your prop firm evaluation on your behalf. You keep 80% of all profits from your live funded account. 700+ clients passed since 2019.</p>
              <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Apply Now &rarr;</a>
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
    label: "Weekly Market Analysis — ProSelect · 6 May 2026",
    subject: "This Week's Live Setups — NZD/USD Buy · USD/CHF Sell · SOL Buy | Eleusis FX",
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
          <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.3);font-family:Arial,sans-serif;">Weekly Market Analysis &nbsp;&middot;&nbsp; 6 May 2026</p>
        </td></tr>

        <tr><td style="padding:40px 0 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <h1 style="margin:0 0 16px;font-size:38px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Three Live<br>Setups.</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The Eleusis FX desk scanned 16 forex and crypto pairs in today&apos;s New York session. The theme is unmistakable: broad-based USD weakness. Three high-conviction setups passed every filter &mdash; two FX, one crypto.</p>
          <p style="margin:0;font-size:13px;color:rgba(210,220,240,0.45);font-family:Arial,sans-serif;">Not financial advice. For educational purposes. Always trade your own plan.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Macro Context</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.15);border-left:3px solid #4f8ef7;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">DXY clearly bearish &mdash; broad USD selling across every major.</p>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">USD/JPY breaking below EMA50 (RSI 35.7), USD/CHF through both EMAs, and every major rallying against the dollar &mdash; EUR/USD +0.53%, GBP/USD +0.44%, AUD/USD +0.92%, NZD/USD +1.39%. This is coordinated USD weakness, not pair-specific noise.</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">NY session opens with no scheduled event risk &mdash; a textbook environment for momentum continuation. Crypto constructive: BTC +1.04% testing EMA200 overhead, SOL leading altcoins at +3.16%.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#22c55e;font-weight:700;font-family:Arial,sans-serif;">Live Setup #1 &mdash; Bullish</p>
          <h2 style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">NZD/USD &mdash; Buy Setup &#9989;</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">NZD/USD is the cleanest dollar-weakness expression on the board today. Price has reclaimed the EMA200 with conviction &mdash; the largest single-day gain across all FX majors at +1.39% &mdash; closing near the daily high (0.59916). MACD just crossed bullish with histogram expanding, and RSI at 58.8 leaves meaningful headroom before overbought.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">A shallow NY pullback toward the <strong style="color:#e8eaf0;">EMA50/EMA200 cluster (0.5920&ndash;0.5930)</strong> offers the highest-quality entry. Three-category confluence: trend structure, momentum, and macro all aligned.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #22c55e;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;width:90px;">Entry</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">0.59250 &ndash; limit on pullback</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Stop Loss</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e74c3c;font-family:Arial,sans-serif;">0.58750</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP1</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">0.60250 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(2.0:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP2</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">0.60750 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(3.0:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Invalidation</td>
                  <td style="padding:7px 0;font-size:13px;color:rgba(210,220,240,0.7);font-family:Arial,sans-serif;">Daily close below 0.58744 (EMA200)</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#e74c3c;font-weight:700;font-family:Arial,sans-serif;">Live Setup #2 &mdash; Bearish</p>
          <h2 style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">USD/CHF &mdash; Sell Setup &#9989;</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">USD/CHF is in a defined downtrend: price below EMA50, EMA50 below EMA200 &mdash; the full bearish stack. Today&apos;s -0.55% candle rejected from 0.78338 and closed in the lower third of the daily range. MACD histogram expanding negative, RSI 42.3 not stretched &mdash; momentum has room to continue lower.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Sell the retest of <strong style="color:#e8eaf0;">0.7820&ndash;0.7830</strong> (former support, now EMA50 supply). USD weakness plus CHF as a defensive safe-haven currency adds structural tailwind. Trend, momentum, and macro all aligned.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #e74c3c;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;width:90px;">Entry</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">0.78250 &ndash; limit on retest</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Stop Loss</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e74c3c;font-family:Arial,sans-serif;">0.78900</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP1</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">0.76950 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(2.0:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP2</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">0.76300 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(3.0:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Invalidation</td>
                  <td style="padding:7px 0;font-size:13px;color:rgba(210,220,240,0.7);font-family:Arial,sans-serif;">Daily close above 0.78578 (EMA50)</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#22c55e;font-weight:700;font-family:Arial,sans-serif;">Live Setup #3 &mdash; Bullish</p>
          <h2 style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;line-height:1.2;font-family:Arial,sans-serif;">SOL/USDT &mdash; Buy Setup &#9989;</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Solana printed the strongest crypto candle in the basket at +3.16%, closing near its high (89.88) with price above EMA50 (86.27). MACD just crossed bullish &mdash; histogram turned positive and expanding &mdash; RSI at 60.9 is in the sweet spot: trending, not overbought. This is an early-stage momentum setup, not a late chase.</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Entry on a shallow pullback toward <strong style="color:#e8eaf0;">87.50</strong>, stop below EMA50 + 1&times; ATR (2.81) buffer. The EMA200 at 112.43 is well above and not in play for this swing leg.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #22c55e;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;width:90px;">Entry</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">87.50 &ndash; limit on pullback</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Stop Loss</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#e74c3c;font-family:Arial,sans-serif;">84.50</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP1</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">93.50 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(2.0:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">TP2</td>
                  <td style="padding:7px 0;font-size:13px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">96.50 &nbsp;<span style="font-size:11px;font-weight:400;color:rgba(210,220,240,0.5);">(3.0:1 R:R)</span></td>
                </tr>
                <tr>
                  <td style="padding:7px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Invalidation</td>
                  <td style="padding:7px 0;font-size:13px;color:rgba(210,220,240,0.7);font-family:Arial,sans-serif;">Daily close below 86.27 (EMA50)</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Also On Watchlist</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#f39c12;margin-right:10px;">&#9654;</span> <strong style="color:#e8eaf0;">EUR/USD</strong> &mdash; Bullish structure but MACD histogram diverging &mdash; waiting for momentum confirmation</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#f39c12;margin-right:10px;">&#9654;</span> <strong style="color:#e8eaf0;">GBP/USD</strong> &mdash; Bullish bias valid, no clean entry trigger today &mdash; prefer pullback setup</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#f39c12;margin-right:10px;">&#9654;</span> <strong style="color:#e8eaf0;">BTC/USDT</strong> &mdash; RSI 69.8 approaching overbought at EMA200 resistance ($82,793) &mdash; watching for resolution</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#f39c12;margin-right:10px;">&#9654;</span> <strong style="color:#e8eaf0;">AUD/USD</strong> &mdash; Bullish but extended near daily high (RSI 61.1) &mdash; prefer pullback before entry</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">Free Download</p>
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;font-family:Arial,sans-serif;">Full Analysis Report &mdash; PDF</h2>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Get the full branded analysis report including all three setup breakdowns, macro context, and the complete watchlist review across 16 pairs &mdash; all in one premium PDF.</p>
              <a href="https://eleusisfx.uk" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:13px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Download the Report &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:28px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Want These Trades Executed For You?</p>
              <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#e8eaf0;font-family:Arial,sans-serif;">Evaluation Pass &mdash; &pound;1,150</p>
              <p style="margin:0 0 20px;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">We trade your prop firm evaluation on your behalf. You keep 80% of all profits from your live funded account. 700+ clients passed since 2019.</p>
              <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Apply Now &rarr;</a>
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
    label: "NFP Day Warning — Do Not Trade",
    subject: "\u26a0\ufe0f NFP Today \u2014 Read This Before You Open a Position",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#e74c3c;font-weight:700;font-family:Arial,sans-serif;">&#9888; High-Impact News Event</p>
          <h1 style="margin:0 0 16px;font-size:36px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">NFP Day.<br>Step Away From the Charts.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Today is Non-Farm Payrolls day. Before you open a single position, read this &mdash; it could save your evaluation.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">What Is NFP?</p>
          <p style="margin:0 0 14px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Non-Farm Payrolls is the United States monthly employment report. It measures how many jobs were added or lost outside the agricultural sector. It releases on the first Friday of every month at <strong style="color:#e8eaf0;">13:30 UTC (08:30 ET)</strong>.</p>
          <p style="margin:0;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">It is consistently the <strong style="color:#e8eaf0;">highest-impact scheduled data release</strong> in the forex calendar. The volatility it produces is not normal market movement &mdash; it is structured chaos that professional desks specifically prepare for.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Why NFP Destroys Prop Firm Evaluations</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(231,76,60,0.3);border-top:2px solid #e74c3c;margin-bottom:20px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#e74c3c;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">The 4 Ways NFP Kills Your Account</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:10px 14px;background:#0d0e17;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><strong style="color:#e74c3c;">1. Spread widening</strong> &mdash; Spreads on major pairs can widen 10&ndash;50x during the release window. A trade that looks fine at a 1.2 pip spread can instantly carry a 30+ pip cost against you.</td></tr>
                <tr><td style="padding:10px 14px;background:#0d0e17;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><strong style="color:#e74c3c;">2. Slippage</strong> &mdash; Your stop loss is not guaranteed during high-impact news. The market can gap clean through it, filling you at a significantly worse price and breaching your daily drawdown in a single candle.</td></tr>
                <tr><td style="padding:10px 14px;background:#0d0e17;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><strong style="color:#e74c3c;">3. Liquidity sweeps</strong> &mdash; The first 60&ndash;90 seconds after release often moves against the obvious direction before reversing. Retail reads the headline and enters. Institutions use that flow to fill the other side.</td></tr>
                <tr><td style="padding:10px 14px;background:#0d0e17;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><strong style="color:#e74c3c;">4. Prop firm rules</strong> &mdash; Most firms (FTMO, The5ers, FundingNext) explicitly restrict trading during high-impact news events. Holding a position through NFP can result in automatic disqualification, regardless of the P&amp;L outcome.</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">The No-Trade Zone Protocol</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">Follow this every NFP Friday:</p>
              <p style="margin:0 0 8px;padding-left:14px;font-size:13px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">&#8226;&nbsp;&nbsp;<strong style="color:#4f8ef7;">Close all open positions</strong> by 13:15 UTC (08:15 ET) &mdash; 15 minutes before the release.</p>
              <p style="margin:0 0 8px;padding-left:14px;font-size:13px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">&#8226;&nbsp;&nbsp;<strong style="color:#4f8ef7;">No new positions</strong> between 13:15 and 14:00 UTC. Mandatory no-trade window.</p>
              <p style="margin:0 0 8px;padding-left:14px;font-size:13px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">&#8226;&nbsp;&nbsp;<strong style="color:#4f8ef7;">Wait for the dust to settle</strong> &mdash; let the initial spike and reversal play out. Do not chase the first move.</p>
              <p style="margin:0;padding-left:14px;font-size:13px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">&#8226;&nbsp;&nbsp;<strong style="color:#4f8ef7;">Re-enter only after structure forms</strong> &mdash; clean pullback or consolidation on the 15M after 14:15 UTC, directional bias confirmed.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Today&rsquo;s NFP Context</p>
          <p style="margin:0 0 14px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Consensus for today&rsquo;s release is approximately <strong style="color:#e8eaf0;">62&ndash;65K jobs added</strong>, against a prior reading of 177K &mdash; a sharp deceleration. A miss below consensus will hammer USD further; a beat could produce a sharp counter-rally. DXY is already trading near <strong style="color:#e8eaf0;">98.00</strong> after sustained weakness, meaning any sharp USD move will be amplified across all pairs.</p>
          <p style="margin:0;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">This is not a day for guessing. This is a day for protecting your account and letting others blow up.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(79,142,247,0.2);">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">The professional approach is simple:</p>
              <p style="margin:0;font-size:13px;line-height:1.9;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Funded traders don&rsquo;t gamble on economic data. They protect capital, let the event pass, and look for clean setups once price has established a new range. Sitting on your hands today <em style="color:#4f8ef7;">is</em> a trade &mdash; and it&rsquo;s the right one.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;">
          <p style="margin:0 0 6px;font-size:14px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Trade safe,</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">Ben &mdash; Eleusis FX</p>
        </td></tr>`),
  },
  {
    label: "Past Client — Loyalty Offer",
    subject: "An Exclusive Offer for You — Eleusis FX",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020305;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020305;padding:48px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

        <tr><td style="padding-bottom:32px;">
          <span style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">ELEUSIS FX</span>
        </td></tr>

        <!-- Hero -->
        <tr><td style="padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-weight:700;font-family:Arial,sans-serif;">For Our Past Clients</p>
          <h1 style="margin:0 0 16px;font-size:36px;font-weight:800;letter-spacing:-1.5px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">You&apos;ve Earned This.</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], thank you for trusting us with your evaluation. As one of our valued past clients, we&apos;re offering you an exclusive return rate for 2026 &mdash; half the standard price, same full service.</p>
        </td></tr>

        <!-- Offer block -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #22c55e;">
            <tr><td style="padding:32px 28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#22c55e;font-weight:700;font-family:Arial,sans-serif;">Loyalty Offer — 2026</p>
              <h2 style="margin:0 0 20px;font-size:28px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;font-family:Arial,sans-serif;">50% Off Your Next Evaluation</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">
                    Standard price &nbsp;<span style="text-decoration:line-through;color:rgba(210,220,240,0.35);">£1,150</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);font-size:15px;font-weight:700;color:#22c55e;font-family:Arial,sans-serif;">
                    Your price &nbsp;<strong style="font-size:20px;">£550</strong>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.8;color:rgba(210,220,240,0.7);font-family:Arial,sans-serif;">This offer is exclusive to past clients and won&apos;t be advertised publicly. Apply through our usual route below and reference your previous evaluation in the application &mdash; we&apos;ll apply the discount before we kick off.</p>
              <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#22c55e;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 28px;text-decoration:none;font-family:Arial,sans-serif;">Claim Your Offer &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Stats overview -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Our 2026 Track Record</p>
          <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#e8eaf0;font-family:Arial,sans-serif;">87% of Our Clients Get Funded</h2>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">That figure isn&apos;t a marketing claim &mdash; it reflects every completed evaluation we&apos;ve managed across FTMO and True Forex Funds. The ones who don&apos;t pass typically come back, adjust their approach, and pass the second time.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="33%" style="padding:16px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);text-align:center;">
                <div style="font-size:24px;font-weight:800;color:#22c55e;font-family:Arial,sans-serif;letter-spacing:-1px;">87%</div>
                <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.4);margin-top:4px;font-family:Arial,sans-serif;">Pass Rate</div>
              </td>
              <td width="2%" style="background:#020305;"></td>
              <td width="33%" style="padding:16px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);text-align:center;">
                <div style="font-size:24px;font-weight:800;color:#4f8ef7;font-family:Arial,sans-serif;letter-spacing:-1px;">&lt;30</div>
                <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.4);margin-top:4px;font-family:Arial,sans-serif;">Days Avg.</div>
              </td>
              <td width="2%" style="background:#020305;"></td>
              <td width="30%" style="padding:16px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);text-align:center;">
                <div style="font-size:24px;font-weight:800;color:#e8eaf0;font-family:Arial,sans-serif;letter-spacing:-1px;">0</div>
                <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(210,220,240,0.4);margin-top:4px;font-family:Arial,sans-serif;">Violations</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- How it works -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">How It Works</p>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding-bottom:14px;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:26px;height:26px;border:1px solid rgba(34,197,94,0.3);font-size:9px;letter-spacing:1px;color:#22c55e;text-align:center;line-height:26px;font-family:Arial,sans-serif;">01</span>
              </td>
              <td style="padding:2px 0 14px 12px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">Apply via the button above and mention your previous evaluation in the form.</td>
            </tr>
            <tr>
              <td style="padding-bottom:14px;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:26px;height:26px;border:1px solid rgba(34,197,94,0.3);font-size:9px;letter-spacing:1px;color:#22c55e;text-align:center;line-height:26px;font-family:Arial,sans-serif;">02</span>
              </td>
              <td style="padding:2px 0 14px 12px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">We&apos;ll confirm your discounted rate and get everything set up for your 2026 challenge.</td>
            </tr>
            <tr>
              <td style="vertical-align:top;width:32px;">
                <span style="display:inline-block;width:26px;height:26px;border:1px solid rgba(34,197,94,0.3);font-size:9px;letter-spacing:1px;color:#22c55e;text-align:center;line-height:26px;font-family:Arial,sans-serif;">03</span>
              </td>
              <td style="padding:2px 0 0 12px;font-size:13px;color:rgba(210,220,240,0.88);line-height:1.6;font-family:Arial,sans-serif;">Track everything live in your dashboard from day one. We manage the evaluation, you trade.</td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:36px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Any questions before you apply &mdash; just reply to this email. We&apos;re happy to talk through the options and make sure 2026 is the year you get funded.</p>
          <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:#e8eaf0;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 28px;text-decoration:none;font-family:Arial,sans-serif;">Apply Now &rarr;</a>
        </td></tr>

        <!-- Footer -->
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
</html>`,
  },
  {
    label: "Article — What Is an FTMO Challenge?",
    subject: "What Exactly Is an FTMO Challenge? — Eleusis FX",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">New Article</p>
          <h1 style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">What Is an FTMO Challenge and How Does It Work?</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], we&apos;ve just published a complete breakdown of the FTMO evaluation process &mdash; every phase, every rule, and everything you need to know before you start.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">→</span> Phase 1 &amp; Phase 2 explained — what each stage actually tests</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">→</span> Trailing vs. fixed drawdown — the difference that catches most traders out</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">→</span> Profit targets, minimum trading days, and payout splits</td></tr>
            <tr><td style="padding:10px 14px;background:#08090f;border:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;"><span style="color:#4f8ef7;margin-right:10px;">→</span> Common mistakes that get accounts disqualified in the first week</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Whether you&apos;re considering an FTMO challenge for the first time or prepping for another run, this guide covers everything in one place.</p>
          <a href="https://eleusisfx.uk/articles/what-is-an-ftmo-challenge" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Read the Full Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:24px 28px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Want Us To Handle It?</p>
              <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">87% of our clients get funded. Let us manage your evaluation.</p>
              <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:12px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Apply Now &rarr;</a>
            </td></tr>
          </table>
        </td></tr>`),
  },
  {
    label: "Article — Why Traders Fail Evaluations",
    subject: "The Real Reason Most Traders Fail Their Prop Firm Evaluation",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">New Article</p>
          <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">Why Most Traders Fail Their Prop Firm Evaluation</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], it&apos;s rarely the strategy. We&apos;ve broken down the three most common reasons funded traders get disqualified &mdash; and how to avoid every one of them.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">What We Cover</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:14px 16px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;">
              <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;margin-bottom:6px;font-family:Arial,sans-serif;">Mistake 01</div>
              <div style="font-size:13px;color:#e8eaf0;font-weight:700;font-family:Arial,sans-serif;">Oversizing on early trades</div>
              <div style="font-size:12px;color:rgba(210,220,240,0.65);margin-top:4px;line-height:1.6;font-family:Arial,sans-serif;">One bad trade at 3% risk wipes out most of your daily drawdown allowance before the day has started.</div>
            </td></tr>
            <tr><td style="padding:14px 16px;background:#08090f;border:1px solid rgba(255,255,255,0.06);border-bottom:none;">
              <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;margin-bottom:6px;font-family:Arial,sans-serif;">Mistake 02</div>
              <div style="font-size:13px;color:#e8eaf0;font-weight:700;font-family:Arial,sans-serif;">Revenge trading after a loss</div>
              <div style="font-size:12px;color:rgba(210,220,240,0.65);margin-top:4px;line-height:1.6;font-family:Arial,sans-serif;">Evaluations punish emotional decisions harder than any live account. The daily limit doesn&apos;t care about your conviction.</div>
            </td></tr>
            <tr><td style="padding:14px 16px;background:#08090f;border:1px solid rgba(255,255,255,0.06);">
              <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#4f8ef7;margin-bottom:6px;font-family:Arial,sans-serif;">Mistake 03</div>
              <div style="font-size:13px;color:#e8eaf0;font-weight:700;font-family:Arial,sans-serif;">Misreading the drawdown rules</div>
              <div style="font-size:12px;color:rgba(210,220,240,0.65);margin-top:4px;line-height:1.6;font-family:Arial,sans-serif;">Trailing vs. fixed drawdown works very differently. Most failures happen because traders assumed they had more room than they did.</div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The full article goes deeper on each mistake, with specific numbers and approaches that our clients use to stay clean throughout their evaluation.</p>
          <a href="https://eleusisfx.uk/articles/why-traders-fail-prop-firm-evaluation" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Read the Full Article &rarr;</a>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:24px 28px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Prefer to Skip the Risk?</p>
              <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">We manage your evaluation for you. 87% pass rate.</p>
              <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:12px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Apply Now &rarr;</a>
            </td></tr>
          </table>
        </td></tr>`),
  },
  {
    label: "Article — FTMO vs True Forex Funds",
    subject: "FTMO vs True Forex Funds — Which One Is Right for You?",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#4f8ef7;font-weight:700;font-family:Arial,sans-serif;">New Article</p>
          <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:-1px;color:#e8eaf0;line-height:1.1;font-family:Arial,sans-serif;">FTMO vs True Forex Funds: The Honest Verdict</h1>
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name], two of the biggest names in prop funding &mdash; but they&apos;re very different products. We&apos;ve put together a full side-by-side comparison with no affiliate bias.</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="48%" style="padding:20px;background:#08090f;border:1px solid rgba(255,255,255,0.06);vertical-align:top;">
                <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);margin-bottom:10px;font-family:Arial,sans-serif;">FTMO</div>
                <div style="font-size:13px;color:rgba(210,220,240,0.88);line-height:1.75;font-family:Arial,sans-serif;">
                  &bull; Trailing drawdown (Phase 1)<br>
                  &bull; 80% profit split<br>
                  &bull; 10% max drawdown<br>
                  &bull; 4-day minimum trade days
                </div>
              </td>
              <td width="4%" style="background:#020305;"></td>
              <td width="48%" style="padding:20px;background:#08090f;border:1px solid rgba(255,255,255,0.06);vertical-align:top;">
                <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(210,220,240,0.4);margin-bottom:10px;font-family:Arial,sans-serif;">True Forex Funds</div>
                <div style="font-size:13px;color:rgba(210,220,240,0.88);line-height:1.75;font-family:Arial,sans-serif;">
                  &bull; Fixed drawdown (both phases)<br>
                  &bull; Up to 90% profit split<br>
                  &bull; 12% max drawdown<br>
                  &bull; No minimum trading days
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">The full article covers fees, scaling plans, payout frequency, and which trading styles each firm suits best &mdash; so you can make the right call before you spend a penny.</p>
          <a href="https://eleusisfx.uk/articles/ftmo-vs-true-forex-funds" style="display:inline-block;background:#4f8ef7;color:#020305;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:14px 26px;text-decoration:none;font-family:Arial,sans-serif;">Read the Full Comparison &rarr;</a>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08090f;border:1px solid rgba(255,255,255,0.06);border-top:2px solid #4f8ef7;">
            <tr><td style="padding:24px 28px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(210,220,240,0.4);font-family:Arial,sans-serif;">Already Know Which Firm?</p>
              <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">We work with both. Tell us which you&apos;re targeting and we&apos;ll handle the rest.</p>
              <a href="https://eleusisfx.uk/#apply" style="display:inline-block;background:transparent;color:#4f8ef7;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:12px 24px;text-decoration:none;border:1px solid rgba(79,142,247,0.4);font-family:Arial,sans-serif;">Apply Now &rarr;</a>
            </td></tr>
          </table>
        </td></tr>`),
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
  // ─── Blank branded template ───────────────────────────────────────────────
  {
    label: "Blank — Direct Email",
    subject: "",
    html: emailWrapper(`
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Hi [First Name],</p>
        </td></tr>

        <tr><td style="padding:32px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:15px;line-height:1.85;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">[Your message here]</p>
        </td></tr>

        <tr><td style="padding:32px 0;">
          <p style="margin:0 0 6px;font-size:14px;color:rgba(210,220,240,0.88);font-family:Arial,sans-serif;">Best,</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#e8eaf0;font-family:Arial,sans-serif;">Ben — Eleusis FX</p>
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

export default function EmailEditorClient({
  recipients,
  defaultTemplate,
  defaultTo,
  defaultName,
}: {
  recipients: Recipient[];
  defaultTemplate?: string;
  defaultTo?: string;
  defaultName?: string;
}) {
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

  // AI generation
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError]           = useState("");

  // Send
  const [sending, setSending]       = useState(false);
  const [result, setResult]         = useState<{ sent: number; failed: number } | null>(null);
  const [sendError, setSendError]   = useState("");

  // ── Pre-fill from URL params (e.g. opened from a client row) ──
  useEffect(() => {
    if (!defaultTemplate) return;
    const tpl = TEMPLATES.find((t) =>
      t.label.toLowerCase().includes(defaultTemplate.toLowerCase())
    );
    if (!tpl) return;
    const html = defaultName
      ? tpl.html.replace(/\[First Name\]/g, defaultName)
      : tpl.html;
    setSubject(tpl.subject);
    setHtmlSource(html);
    setMode("html");
    setPreview(true);

    if (defaultTo) {
      const existing = recipients.find((r) => r.email === defaultTo);
      setSelected([existing ?? { label: defaultName ?? defaultTo, email: defaultTo, group: "Active Clients" }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setSelected((prev) => prev.find((s) => s.email === r.email) ? prev : [...prev, r]);
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
    // If exactly one recipient is selected, substitute their first name
    let html = tpl.html;
    if (selected.length === 1) {
      const firstName = selected[0].label.split(" ")[0];
      html = html.replace(/\[First Name\]/g, firstName);
    }
    setSubject(tpl.subject);
    setHtmlSource(html);
    setComposeHtml(html);
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

  // ── AI generation ──
  async function generateWithAI() {
    if (selected.length !== 1) return;
    setAiGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/admin/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: selected[0].email,
          templateLabel: templateKey || "Progress Check-In",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "Generation failed");
        return;
      }
      if (data.subject) setSubject(data.subject);
      if (data.html) {
        setHtmlSource(data.html);
        setComposeHtml(data.html);
        setMode("html");
        setPreview(true);
      }
    } catch {
      setAiError("Network error — generation failed");
    } finally {
      setAiGenerating(false);
    }
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

          {/* AI Generate divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(210,220,240,0.3)", flexShrink: 0 }}>
              AI Personalise
            </div>
            <button
              onClick={generateWithAI}
              disabled={aiGenerating || selected.length !== 1}
              style={{
                background: selected.length === 1 ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected.length === 1 ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: selected.length === 1 ? "#a78bfa" : "rgba(210,220,240,0.2)",
                fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                padding: "8px 16px", cursor: selected.length === 1 ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all 0.2s",
                opacity: aiGenerating ? 0.6 : 1,
              }}
            >
              {aiGenerating ? "Generating…" : "✦ Generate with AI"}
            </button>
            {selected.length !== 1 && (
              <span style={{ fontSize: 10, color: "rgba(210,220,240,0.25)" }}>
                Select exactly one recipient to personalise
              </span>
            )}
            {selected.length === 1 && !aiGenerating && !aiError && templateKey && (
              <span style={{ fontSize: 10, color: "rgba(167,139,250,0.5)" }}>
                Will personalise: {templateKey}
              </span>
            )}
            {selected.length === 1 && !aiGenerating && !aiError && !templateKey && (
              <span style={{ fontSize: 10, color: "rgba(210,220,240,0.3)" }}>
                Uses Progress Check-In if no template selected
              </span>
            )}
            {aiError && (
              <span style={{ fontSize: 10, color: "#ef4444" }}>{aiError}</span>
            )}
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
                onClick={() => {
                  const unique = recipients.filter((r, i, arr) => arr.findIndex((x) => x.email === r.email) === i);
                  setSelected(unique);
                }}
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
              {selected.filter((r, i, arr) => arr.findIndex((x) => x.email === r.email) === i).map((r) => (
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
