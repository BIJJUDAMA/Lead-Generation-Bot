import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { db } = await import("../db");
  const { companies, signals } = await import("../db/schema");
  const { sql, eq } = await import("drizzle-orm");

  console.log("--- Fetching Database Data ---");
  
  const comps = await db.select().from(companies).limit(100);
  const sigs = await db.select().from(signals).limit(100);
  
  console.log("COMPANIES FOUND:", comps.length);
  console.log(JSON.stringify(comps, null, 2));
  
  console.log("\nSIGNALS FOUND:", sigs.length);
  console.log(JSON.stringify(sigs, null, 2));
  
  process.exit(0);
}

main();
