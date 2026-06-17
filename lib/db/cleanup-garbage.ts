import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { db } = await import("../db");
  const { companies, signals, signalAnalysis } = await import("../db/schema");
  const { sql, inArray, eq } = await import("drizzle-orm");

  console.log("--- Cleaning Garbage Data ---");
  
  const garbageNames = ["it", "AI", "Probably", "Competitor"];
  
  // 1. Find the IDs of the garbage companies
  const garbageComps = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(inArray(companies.name, garbageNames));
    
  const ids = garbageComps.map(c => c.id);
  
  if (ids.length > 0) {
    console.log(`Deleting ${ids.length} garbage companies:`, garbageComps.map(c => c.name).join(", "));
    
    // Cascading deletes should handle signals and analysis
    await db.delete(companies).where(inArray(companies.id, ids));
  } else {
    console.log("No garbage companies found matching the list.");
  }
  
  // 2. Clear out any other pending companies that might be junk (optional but good for testing)
  // For now we'll stick to the explicit list.

  console.log("--- Data Cleanup Finished ---");
  process.exit(0);
}

main();
