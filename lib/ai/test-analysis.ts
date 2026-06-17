import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { AnalysisService } = await import("./service");
  console.log("--- Manual AI Analysis Test ---");
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is missing in .env.local");
    process.exit(1);
  }

  try {
    const results = await AnalysisService.processPendingSignals(3);
    
    console.log(`\nProcessed ${results.length} signals.`);
    results.forEach((r, i) => {
      console.log(`\nResult ${i + 1}:`);
      console.log(`Classification: ${r.classification}`);
      console.log(`Confidence: ${r.confidence}`);
      console.log(`Summary: ${r.summary}`);
      console.log(`Reasoning: ${r.reasoning}`);
    });
    
    console.log("\n--- Analysis Test Finished ---");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

main();
