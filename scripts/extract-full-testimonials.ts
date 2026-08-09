import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const supabase = createClient(
  "https://hfyzpgbubwlwlludoltu.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  days_used?: number;
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

(async () => {
  try {
    console.log("🔍 Extracting client testimonial data...\n");

    // Get all past clients
    const { data: allClients, error } = await supabase
      .from("past_clients")
      .select("*");

    if (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }

    if (!allClients || allClients.length === 0) {
      console.log("No clients found");
      process.exit(0);
    }

    // Categorize clients
    const milestoneClients: ClientRecord[] = [];
    const passedClients: ClientRecord[] = [];
    
    (allClients as ClientRecord[]).forEach((client) => {
      // Milestone days: 32, 39, 43, 55
      if (client.days_used && [32, 39, 43, 55].includes(client.days_used)) {
        milestoneClients.push(client);
      }
      // Passed challenges for testimonials
      if (client.challenge_result?.toLowerCase() === "pass") {
        passedClients.push(client);
      }
    });

    console.log(`📊 MILESTONE CLIENTS (Day 32, 39, 43, 55):`);
    console.log(`   Day 32: ${milestoneClients.filter(c => c.days_used === 32).length}`);
    console.log(`   Day 39: ${milestoneClients.filter(c => c.days_used === 39).length}`);
    console.log(`   Day 43: ${milestoneClients.filter(c => c.days_used === 43).length}`);
    console.log(`   Day 55: ${milestoneClients.filter(c => c.days_used === 55).length}`);
    console.log(`   Total: ${milestoneClients.length}\n`);
    
    console.log(`📊 PASSED CLIENTS (for testimonials):`);
    console.log(`   Total: ${passedClients.length}\n`);

    // Create CSV with both categories
    const headers = [
      "Category",
      "Name",
      "Email",
      "Phone",
      "Challenge",
      "Days Used",
      "Current Balance",
      "Equity",
      "Profit Goal",
      "Daily Drawdown",
      "Max Drawdown",
      "Result",
      "Phase",
    ];

    const rows: string[][] = [];

    // Add milestone clients first
    console.log("ℹ️  Generating CSV with milestone and passed clients...\n");
    milestoneClients.forEach((client) => {
      const day = client.days_used || "unknown";
      const phase = day === 32 ? "Recovery Phase" 
                  : day === 39 ? "Consistent Profit"
                  : day === 43 ? "Psychological Wins"
                  : day === 55 ? "Measurable Growth"
                  : "N/A";
      
      rows.push([
        `Milestone (Day ${day})`,
        client.name || "N/A",
        client.email || "N/A",
        client.phone || "N/A",
        client.challenge || "N/A",
        String(client.days_used || "N/A"),
        client.balance?.toFixed(2) || "N/A",
        client.equity?.toFixed(2) || "N/A",
        client.profit_goal?.toFixed(2) || "N/A",
        client.daily_drawdown?.toFixed(2) || "N/A",
        client.max_drawdown?.toFixed(2) || "N/A",
        client.challenge_result || "N/A",
        phase,
      ]);
    });

    // Add passed clients (top 30 for potential testimonials)
    passedClients.slice(0, 30).forEach((client) => {
      rows.push([
        "Passed Challenge",
        client.name || "N/A",
        client.email || "N/A",
        client.phone || "N/A",
        client.challenge || "N/A",
        String(client.days_used || "N/A"),
        client.balance?.toFixed(2) || "N/A",
        client.equity?.toFixed(2) || "N/A",
        client.profit_goal?.toFixed(2) || "N/A",
        client.daily_drawdown?.toFixed(2) || "N/A",
        client.max_drawdown?.toFixed(2) || "N/A",
        client.challenge_result || "N/A",
        client.phase || "N/A",
      ]);
    });

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const outputPath = "/Users/benjamindavies/Documents/Claude - Eleusis/Eleusis Admin/client-testimonials-extract.csv";
    writeFileSync(outputPath, csvContent);

    console.log(`✅ Extraction complete!`);
    console.log(`📍 File: client-testimonials-extract.csv`);
    console.log(`📊 Total records: ${rows.length}`);
    console.log(`   - Milestone clients: ${milestoneClients.length}`);
    console.log(`   - Passed clients: ${Math.min(passedClients.length, 30)}`);
  } catch (e: any) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  }
})();
