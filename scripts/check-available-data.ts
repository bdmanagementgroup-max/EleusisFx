import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hfyzpgbubwlwlludoltu.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  try {
    const { data: all } = await supabase
      .from("past_clients")
      .select("days_used, challenge_result, phase, name");

    if (all) {
      const dayCounts: Record<string, number> = {};
      const resultCounts: Record<string, number> = {};
      
      all.forEach((r: any) => {
        const day = r.days_used || "unknown";
        dayCounts[day] = (dayCounts[day] || 0) + 1;
        
        const result = r.challenge_result || "null";
        resultCounts[result] = (resultCounts[result] || 0) + 1;
      });
      
      console.log("📊 Clients by days_used:");
      Object.keys(dayCounts)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach((day) => {
          console.log(`  Day ${day}: ${dayCounts[day]} clients`);
        });
      
      console.log("\n📊 Clients by challenge_result:");
      Object.entries(resultCounts).forEach(([result, count]) => {
        console.log(`  ${result}: ${count} clients`);
      });
      
      console.log(`\nTotal clients: ${all.length}`);
      
      // Show clients with PASS result
      const passes = all.filter((c: any) => c.challenge_result === "PASS");
      console.log(`\nClients with PASS result: ${passes.length}`);
      if (passes.length > 0) {
        console.log("Sample:", passes.slice(0, 3).map((p: any) => `${p.name} (Day ${p.days_used})`).join(", "));
      }
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
  process.exit(0);
})();
