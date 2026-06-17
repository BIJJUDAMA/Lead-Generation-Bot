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
    // We'll just take the first 1-3 words before common funding verbs
    const fundingVerbs = ["raises", "closes", "announces", "secures", "gets", "lands"];
    const lowercaseTitle = title.toLowerCase();

    for (const verb of fundingVerbs) {
      if (lowercaseTitle.includes(` ${verb} `)) {
        const parts = title.split(new RegExp(`\\s${verb}\\s`, "i"));
        if (parts[0]) {
          // Clean up common prefixes like "Startup " or "Fintech "
          return parts[0].replace(/^(Startup|Fintech|SaaS|AI|Crypto)\s+/i, "").trim();
        }
      }
    }

    return null;
  }
}
