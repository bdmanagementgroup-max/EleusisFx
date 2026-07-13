import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hfyzpgbubwlwlludoltu.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Error:", error.message);
    } else if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]).join(", "));
    } else {
      console.log("No data found, trying full list...");
      const { data: all } = await supabase.from("applications").select("*");
      if (all && all.length > 0) {
        console.log("Total records:", all.length);
        console.log("Columns:", Object.keys(all[0]).join(", "));
      }
    }
  } catch (e: any) {
    console.error("Exception:", e.message);
  }
  process.exit(0);
})();
