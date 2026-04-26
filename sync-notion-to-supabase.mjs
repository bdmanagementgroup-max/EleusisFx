// One-off script: copies applications from Notion → Supabase
// Run: node --env-file=.env.local sync-notion-to-supabase.mjs

import { createClient } from "@supabase/supabase-js";

const NOTION_KEY = process.env.NOTION_API_KEY;
const DB_ID = process.env.NOTION_LEADS_DATABASE_ID.split("?")[0];
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("Fetching from Notion database:", DB_ID);

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${NOTION_KEY}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({}),
});

if (!res.ok) {
  const err = await res.text();
  console.error("Notion API error:", res.status, err);
  process.exit(1);
}

const { results } = await res.json();
console.log(`Found ${results.length} entries in Notion\n`);

for (const page of results) {
  const props = page.properties;

  const title  = (key) => props[key]?.title?.[0]?.plain_text ?? "";
  const text   = (key) => props[key]?.rich_text?.[0]?.plain_text ?? "";
  const select = (key) => props[key]?.select?.name ?? "";

  const email    = title("Email");
  const fullName = text("Name");
  const propFirm = text("Prop Firm");
  const phone    = text("Phone");
  const notes    = text("Notes");
  const rawStatus = select("Status").toLowerCase();
  const status   = ["new","reviewed","active","funded","pending"].includes(rawStatus) ? rawStatus : "new";

  const [firstName, ...rest] = fullName.trim().split(" ");
  const lastName = rest.join(" ");

  if (!email) { console.log("  Skipping entry with no email"); continue; }

  console.log(`  Syncing: ${email} (${fullName || "—"})`);

  const { error } = await supabase.from("applications").insert(
    { first_name: firstName || fullName, last_name: lastName, email, whatsapp: phone, prop_firm: propFirm, notes, status }
  );

  if (error) console.error(`  ERROR for ${email}:`, error.message);
  else       console.log(`  ✓ ${email}`);
}

console.log("\nDone.");
