import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hfyzpgbubwlwlludoltu.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  try {
    // Try past_clients table
    const { data, error } = await supabase
      .from("past_clients")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Error querying past_clients:", error.message);
      
      // Try other tables
      const tables = ["challenge_clients", "clients", "funded_accounts", "active_accounts"];
      for (const table of tables) {
        const { data: test } = await supabase
          .from(table)
          .select("*")
          .limit(1);
        if (test) {
          console.log(`Found table: ${table}`);
          break;
        }
      }
    } else if (data && data.length > 0) {
      console.log("✅ past_clients table found!");
      console.log("Columns:", Object.keys(data[0]).join(", "));
    }
  } catch (e: any) {
    console.error("Exception:", e.message);
  }
  process.exit(0);
})();
