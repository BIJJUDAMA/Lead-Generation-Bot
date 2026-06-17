import Parser from "rss-parser";
import { DiscoveryProvider, RawSignal } from "../types";
import { AnalysisService } from "../../ai/service";

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

          // Use AI to extract company name reliably
          const companyName = await AnalysisService.extractCompanyName(item.title);

          if (companyName) {
            allSignals.push({
              type: "Funding/Growth",
              source: `RSS: ${feed.name}`,
              content: item.contentSnippet || item.title,
              url: item.link,
              companyName: companyName,
              confidence: 0.8,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching RSS feed [${feed.name}]:`, error);
      }
    }

    return allSignals;
  }
}
