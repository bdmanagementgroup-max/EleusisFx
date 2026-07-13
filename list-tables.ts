import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hfyzpgbubwlwlludoltu.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  try {
    const { data: tables, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");
    
    if (error) {
      console.error("Error:", error.message);
    } else {
      console.log("Available tables:");
      (tables as any[])?.forEach((t: any) => console.log("  -", t.table_name));
    }
  } catch (e: any) {
    console.error("Exception:", e.message);
  }
  process.exit(0);
})();
