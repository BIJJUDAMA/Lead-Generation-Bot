import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export async function runCleanup() {
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

  console.log("--- Data Cleanup Finished ---");
}
