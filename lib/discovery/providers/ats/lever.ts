import { DiscoveryProvider, RawSignal } from "../types";

export class LeverProvider implements DiscoveryProvider {
  name = "Lever_Hiring";
  
  // Seed list for POC
  private boards = [
    { name: "Anthropic", slug: "anthropic" },
    { name: "Figma", slug: "figma" },
    { name: "Vercel", slug: "vercel" },
  ];

  private targetRoles = ["SDR", "BDR", "Sales Development", "Account Executive", "Growth", "Revenue Operations"];

  async fetchSignals(): Promise<RawSignal[]> {
    const allSignals: RawSignal[] = [];

    for (const board of this.boards) {
      try {
        const response = await fetch(`https://api.lever.co/v0/postings/${board.slug}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        const postings = Array.isArray(data) ? data : [];

        for (const posting of postings) {
          const title = posting.text || "";
          if (this.isTargetRole(title)) {
            allSignals.push({
              type: "Hiring: Sales/Growth",
              source: `Lever: ${board.name}`,
              content: `Hiring for ${title} in ${posting.categories?.location || "Remote"}`,
              url: posting.hostedUrl,
              companyName: board.name,
              confidence: 0.9,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching Lever board [${board.name}]:`, error);
      }
    }

    return allSignals;
  }

  private isTargetRole(title: string): boolean {
    return this.targetRoles.some(role => title.toLowerCase().includes(role.toLowerCase()));
  }
}
