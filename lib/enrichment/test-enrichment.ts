import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { EnrichmentService } = await import("./service");
  
  console.log("--- Company Enrichment Test ---");
  
  try {
    // Process 10 pending companies
    await EnrichmentService.processPendingEnrichment(10);
    
    console.log("--- Enrichment Test Finished ---");
    process.exit(0);
  } catch (error) {
    console.error("--- Enrichment Test Failed ---");
    console.error(error);
    process.exit(1);
  }
}

main();
