import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { discoveryService } = await import("./service");
  console.log("--- Manual Discovery Test ---");
  try {
    await discoveryService.runDiscovery();
    console.log("--- Discovery Test Finished ---");
    process.exit(0);
  } catch (error) {
    console.error("--- Discovery Test Failed ---");
    console.error(error);
    process.exit(1);
  }
}

main();
