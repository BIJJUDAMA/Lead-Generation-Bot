import { DiscoveryProvider, RawSignal } from "../types";
import { AnalysisService } from "../../ai/service";

export class TavilyProvider implements DiscoveryProvider {
  name = "Tavily_Search";
  private apiKey = process.env.TAVILY_API_KEY;

  async fetchSignals(): Promise<RawSignal[]> {
    if (!this.apiKey) {
      console.warn("Tavily API key not found. Skipping Tavily provider.");
      return [];
    }

    const queries = [
      "recent startup funding announcements",
      "companies expanding sales teams",
      "startups opening new offices"
    ];

    const allSignals: RawSignal[] = [];

    for (const query of queries) {
      try {
        console.log(`Tavily searching for: "${query}"`);
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            query,
            search_depth: "advanced",
            topic: "news",
            max_results: 5,
            include_images: false,
            include_answer: false,
          })
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Tavily API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
          console.warn(`Tavily returned no results for query: ${query}`);
          continue;
        }

        for (const result of data.results) {
          // Use AI to extract company name reliably
          const companyName = await AnalysisService.extractCompanyName(result.title);
          
          if (companyName) {
            allSignals.push({
              type: this.mapQueryToType(query),
              source: "Tavily AI Search",
              content: result.content,
              url: result.url,
              companyName: companyName,
              confidence: 0.8,
            });
          }
        }
      } catch (error) {
        console.error(`Error in Tavily provider for query [${query}]:`, error);
      }
    }

    return allSignals;
  }

  private mapQueryToType(query: string): string {
    if (query.includes("funding")) return "Funding";
    if (query.includes("expanding sales")) return "Hiring/Expansion";
    return "Growth";
  }
}
