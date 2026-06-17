import { DiscoveryProvider, RawSignal } from "../types";

export class AshbyProvider implements DiscoveryProvider {
  name = "Ashby_Hiring";
  
  // Seed list for POC
  private boards = [
    { name: "Perplexity", token: "perplexity" },
    { name: "Mistral", token: "mistral" },
    { name: "Cursor", token: "anysphere" },
  ];

  private targetRoles = ["SDR", "BDR", "Sales Development", "Account Executive", "Growth", "Revenue Operations"];

  async fetchSignals(): Promise<RawSignal[]> {
    const allSignals: RawSignal[] = [];

    for (const board of this.boards) {
      try {
        const response = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${board.token}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        const jobs = data.jobs || [];

        for (const job of jobs) {
          const title = job.title || "";
          if (this.isTargetRole(title)) {
            allSignals.push({
              type: "Hiring: Sales/Growth",
              source: `Ashby: ${board.name}`,
              content: `Hiring for ${title} in ${job.location || "Remote"}`,
              url: job.jobUrl,
              companyName: board.name,
              confidence: 0.9,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching Ashby board [${board.name}]:`, error);
      }
    }

    return allSignals;
  }

  private isTargetRole(title: string): boolean {
    return this.targetRoles.some(role => title.toLowerCase().includes(role.toLowerCase()));
  }
}
