import Parser from "rss-parser";
import { DiscoveryProvider, RawSignal } from "../types";

export class RSSProvider implements DiscoveryProvider {
  name = "RSS_News";
  private parser: Parser;
  private feeds = [
    { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/" },
    { name: "VentureBeat", url: "https://venturebeat.com/feed/" },
    { name: "SaaStr", url: "https://www.saastr.com/feed/" },
  ];

  constructor() {
    this.parser = new Parser();
  }

  async fetchSignals(): Promise<RawSignal[]> {
    const allSignals: RawSignal[] = [];

    for (const feed of this.feeds) {
      try {
        const data = await this.parser.parseURL(feed.url);
        
        for (const item of data.items) {
          if (!item.title || !item.link) continue;

          // Basic extraction logic for POC
          // In Phase 3, AI will refine this.
          // For now, we attempt to guess the company name from the title.
          const companyName = this.extractCompanyName(item.title);

          if (companyName) {
            allSignals.push({
              type: "Funding/Growth",
              source: `RSS: ${feed.name}`,
              content: item.contentSnippet || item.title,
              url: item.link,
              companyName: companyName,
              confidence: 0.7, // Initial guess confidence
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching RSS feed [${feed.name}]:`, error);
      }
    }

    return allSignals;
  }

  private extractCompanyName(title: string): string | null {
    // Very simple heuristic: Often "Company Name raises..." or "Company Name closes..."
    const fundingVerbs = ["raises", "closes", "announces", "secures", "gets", "lands", "launches"];
    const lowercaseTitle = title.toLowerCase();

    for (const verb of fundingVerbs) {
      const verbIndex = lowercaseTitle.indexOf(` ${verb} `);
      if (verbIndex !== -1) {
        let potentialName = title.substring(0, verbIndex).trim();
        
        // Clean up common prefixes
        potentialName = potentialName.replace(/^(Startup|Fintech|SaaS|AI|Crypto|Malaysia’s AI agent-powered messaging app)\s+/i, "").trim();

        // Heuristic: Company names are rarely more than 3-4 words in news titles
        const words = potentialName.split(/\s+/);
        if (words.length > 4) {
          // If it's too long, take just the last 1-2 words if they are capitalized
          // Or just return the last word as a fallback
          return words[words.length - 1];
        }

        return potentialName;
      }
    }

    return null;
  }
}
