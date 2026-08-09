import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hfyzpgbubwlwlludoltu.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const tablesToTry = [
  "active_accounts",
  "funded_accounts", 
  "challenge_accounts",
  "current_challenges",
  "ongoing_challenges",
  "client_accounts",
  "ftmo_challenges",
  "challenge_participants",
];

(async () => {
  try {
    console.log("🔍 Searching for challenge data tables...\n");
    
    for (const table of tablesToTry) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);
      
      if (!error && data && data.length > 0) {
        console.log(`✅ Found: ${table}`);
        console.log(`   Columns: ${Object.keys(data[0]).join(", ")}`);
        const count = await supabase.from(table).select("id", { count: "exact" });
        console.log(`   Total records: ${count.count}\n`);
      }
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
  process.exit(0);
})();
