import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const SUPABASE_URL = "https://hfyzpgbubwlwlludoltu.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ApplicationRecord {
  id: string;
  client_name: string;
  email: string;
  challenge_day?: number;
  challenge_start_date?: string;
  current_balance?: number;
  starting_balance?: number;
  win_rate?: number;
  account_status?: string;
  largest_win?: number;
  largest_loss?: number;
}

async function extractClientData() {
  try {
    console.log("Querying Supabase applications table for days 32, 39, 43, 55...");

    // Query applications where challenge_day is in [32, 39, 43, 55]
    // Calculate current day based on challenge_start_date
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, client_name, email, challenge_start_date, current_balance, starting_balance, win_rate, account_status, largest_win, largest_loss"
      )
      .order("challenge_start_date", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log("No applications found.");
      process.exit(1);
    }

    console.log(`Retrieved ${data.length} applications. Filtering by milestone days...`);

    // Filter by challenge day (calculate from start date)
    const now = new Date();
    const milestones: Record<number, string> = {
      32: "Recovery Phase",
      39: "Consistent Profit",
      43: "Psychological Wins",
      55: "Measurable Growth",
    };

    const filtered = data
      .map((record: any) => {
        if (!record.challenge_start_date) return null;

        const startDate = new Date(record.challenge_start_date);
        const daysPassed = Math.floor(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if ([32, 39, 43, 55].includes(daysPassed)) {
          return {
            ...record,
            challenge_day: daysPassed,
            milestone: milestones[daysPassed],
            equity_growth:
              record.starting_balance && record.current_balance
                ? (
                    ((record.current_balance - record.starting_balance) /
                      record.starting_balance) *
                    100
                  ).toFixed(2)
                : "N/A",
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log(`Found ${filtered.length} clients at milestone days.`);

    // Generate CSV
    if (filtered.length > 0) {
      const headers = [
        "Name",
        "Email",
        "Challenge Day",
        "Milestone",
        "Account Status",
        "Win Rate",
        "Starting Balance",
        "Current Balance",
        "Equity Growth %",
        "Largest Win",
        "Largest Loss",
      ];

      const rows = filtered.map((r: any) => [
        r.client_name || "N/A",
        r.email || "N/A",
        r.challenge_day || "N/A",
        r.milestone || "N/A",
        r.account_status || "N/A",
        r.win_rate ? `${r.win_rate}%` : "N/A",
        r.starting_balance ? `$${r.starting_balance.toFixed(2)}` : "N/A",
        r.current_balance ? `$${r.current_balance.toFixed(2)}` : "N/A",
        r.equity_growth,
        r.largest_win ? `$${r.largest_win.toFixed(2)}` : "N/A",
        r.largest_loss ? `$${r.largest_loss.toFixed(2)}` : "N/A",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
      ].join("\n");

      const outputPath = "/Users/benjamindavies/Documents/Claude - Eleusis/client-testimonials-extract.csv";
      writeFileSync(outputPath, csvContent);

      console.log(`\n✅ CSV exported to: ${outputPath}`);
      console.log(`\nSummary by Milestone:`);
      [32, 39, 43, 55].forEach((day) => {
        const count = filtered.filter((r: any) => r.challenge_day === day).length;
        console.log(`  Day ${day} (${milestones[day]}): ${count} clients`);
      });
    }
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

extractClientData();
