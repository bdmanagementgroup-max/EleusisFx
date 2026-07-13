import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { resolve } from "path";

const supabase = createClient(
  "https://hfyzpgbubwlwlludoltu.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  days_used: number;
  balance: number;
  equity: number;
  challenge: string;
  phase: string;
  phase_status?: string;
  profit_goal?: number;
  daily_drawdown?: number;
  max_drawdown?: number;
  challenge_result?: string;
}

const milestones: Record<number, string> = {
  32: "Recovery Phase",
  39: "Consistent Profit",
  43: "Psychological Wins",
  55: "Measurable Growth",
};

(async () => {
  try {
    console.log("🔍 Querying past_clients table for milestone days (32, 39, 43, 55)...\n");

    const { data, error } = await supabase
      .from("past_clients")
      .select("*")
      .in("days_used", [32, 39, 43, 55]);

    if (error) {
      console.error("❌ Supabase error:", error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log("⚠️  No clients found at milestone days.");
      process.exit(0);
    }

    console.log(`✅ Found ${data.length} clients at milestone days\n`);

    // Group by milestone
    const byMilestone: Record<number, ClientRecord[]> = {
      32: [],
      39: [],
      43: [],
      55: [],
    };

    (data as ClientRecord[]).forEach((client) => {
      if ([32, 39, 43, 55].includes(client.days_used)) {
        byMilestone[client.days_used].push(client);
      }
    });

    // Display summary
    console.log("📊 Breakdown by milestone:");
    [32, 39, 43, 55].forEach((day) => {
      const count = byMilestone[day].length;
      console.log(`  Day ${day} (${milestones[day]}): ${count} clients`);
    });
    console.log("");

    // Create CSV
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Day Milestone",
      "Milestone Phase",
      "Challenge",
      "Current Phase",
      "Phase Status",
      "Days Used / Days Allowed",
      "Current Balance ($)",
      "Equity ($)",
      "Profit Goal ($)",
      "Daily Drawdown ($)",
      "Max Drawdown ($)",
      "Challenge Result",
    ];

    const rows: string[][] = [];

    [32, 39, 43, 55].forEach((day) => {
      byMilestone[day].forEach((client: ClientRecord) => {
        rows.push([
          client.name || "N/A",
          client.email || "N/A",
          client.phone || "N/A",
          `${day}`,
          milestones[day],
          client.challenge || "N/A",
          client.phase || "N/A",
          client.phase_status || "N/A",
          `${client.days_used}/${client.challenge_result === "PASS" ? "60" : "N/A"}`,
          client.balance?.toFixed(2) || "N/A",
          client.equity?.toFixed(2) || "N/A",
          client.profit_goal?.toFixed(2) || "N/A",
          client.daily_drawdown?.toFixed(2) || "N/A",
          client.max_drawdown?.toFixed(2) || "N/A",
          client.challenge_result || "N/A",
        ]);
      });
    });

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const outputDir = "/Users/benjamindavies/Documents/Claude - Eleusis/Eleusis Admin";
    const outputPath = `${outputDir}/client-testimonials-extract.csv`;
    writeFileSync(outputPath, csvContent);

    console.log(`✅ CSV exported: client-testimonials-extract.csv`);
    console.log(`📍 Location: Eleusis Admin/\n`);
    console.log(`Total records exported: ${rows.length}`);
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
