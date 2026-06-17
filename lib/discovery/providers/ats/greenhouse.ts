import { DiscoveryProvider, RawSignal } from "../../types";

export class GreenhouseProvider implements DiscoveryProvider {
  name = "Greenhouse_Hiring";
  
  // Seed list for POC
  private boards = [
    { name: "OpenAI", token: "openai" },
    { name: "Ramp", token: "ramp" },
    { name: "Deel", token: "letsdeel" },
    { name: "Vercel", token: "vercel" },
  ];

  private targetRoles = ["SDR", "BDR", "Sales Development", "Account Executive", "Growth", "Revenue Operations"];

  async fetchSignals(): Promise<RawSignal[]> {
    const allSignals: RawSignal[] = [];

    for (const board of this.boards) {
      try {
        const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs`);
        if (!response.ok) continue;
        
        const data = await response.json();
        const jobs = data.jobs || [];

        for (const job of jobs) {
          const title = job.title || "";
          if (this.isTargetRole(title)) {
            allSignals.push({
              type: "Hiring: Sales/Growth",
              source: `Greenhouse: ${board.name}`,
              content: `Hiring for ${title} in ${job.location?.name || "Remote"}`,
              url: job.absolute_url,
              companyName: board.name,
              confidence: 0.9,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching Greenhouse board [${board.name}]:`, error);
      }
    }

    return allSignals;
  }

  private isTargetRole(title: string): boolean {
    return this.targetRoles.some(role => title.toLowerCase().includes(role.toLowerCase()));
  }
}
