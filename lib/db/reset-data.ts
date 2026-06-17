import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { db } = await import("../db");
  const { companies, signals, signalAnalysis, intentScores } = await import("../db/schema");
  const { sql } = await import("drizzle-orm");

  console.log("--- Resetting Database Data ---");
  
  try {
    // Delete in order of dependencies (though cascading deletes on companies would handle most)
    await db.delete(intentScores);
    await db.delete(signalAnalysis);
    await db.delete(signals);
    await db.delete(companies);
    
    console.log("All tables cleared successfully.");
  } catch (error) {
    console.error("Failed to clear tables:", error);
    process.exit(1);
  }
  
  console.log("--- Reset Finished ---");
  process.exit(0);
}

main();
