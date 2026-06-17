import { db } from "../db";
import { companies } from "../db/schema";
import { eq, isNull } from "drizzle-orm";
import { AnalysisService } from "../ai/service";

export class EnrichmentService {
  private static firecrawlKey = process.env.FIRECRAWL_API_KEY;

  /**
   * Enriches a single company by finding its website and extracting metadata
   */
  static async enrichCompany(companyId: string) {
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!company) {
      console.error(`Company not found: ${companyId}`);
      return;
    }

    let website = company.website;

    // 1. Find website if missing
    if (!website) {
      website = await this.findWebsite(company.name);
      if (website) {
        console.log(`Found website for ${company.name}: ${website}`);
        await db.update(companies).set({ website }).where(eq(companies.id, companyId));
      }
    }

    if (!website) {
      console.warn(`No website found for ${company.name}. Skipping enrichment.`);
      return;
    }

    // 2. Scrape Website (Mainly Homepage/About)
    const scrapeData = await this.scrapeWebsite(website);
    if (!scrapeData) {
      console.warn(`Failed to scrape ${website}.`);
      return;
    }

    // 3. Extract Metadata via AI
    const metadata = await AnalysisService.extractCompanyMetadata(company.name, scrapeData);
    if (!metadata) {
      console.warn(`AI metadata extraction failed for ${company.name}.`);
      return;
    }

    // 4. Update Database
    await db.update(companies).set({
      industry: metadata.industry || company.industry,
      description: metadata.description || company.description,
      size: metadata.size || company.size,
      stage: metadata.stage || company.stage,
      logoUrl: metadata.logoUrl || company.logoUrl,
      linkedinUrl: metadata.linkedinUrl || company.linkedinUrl,
      updatedAt: new Date(),
    }).where(eq(companies.id, companyId));

    console.log(`Successfully enriched company: ${company.name}`);
  }

  /**
   * Uses Firecrawl Search to find the official website
   */
  private static async findWebsite(name: string): Promise<string | null> {
    if (!this.firecrawlKey) return null;

    try {
      console.log(`Searching for website of: ${name}...`);
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.firecrawlKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `${name} official website`,
          limit: 1
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`Firecrawl search error: ${response.status} - ${err}`);
        return null;
      }

      const data = await response.json();
      const url = data.data?.web?.[0]?.url || null;
      
      // Filter out common non-company websites
      if (url && (url.includes("linkedin.com") || url.includes("twitter.com") || url.includes("facebook.com") || url.includes("youtube.com"))) {
        return null;
      }
      
      return url;
    } catch (error) {
      console.error(`Website search failed for ${name}:`, error);
      return null;
    }
  }

  /**
   * Uses Firecrawl Scrape to get clean markdown content
   */
  private static async scrapeWebsite(url: string): Promise<string | null> {
    if (!this.firecrawlKey) return null;

    try {
      console.log(`Scraping website: ${url}...`);
      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.firecrawlKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`Firecrawl scrape error: ${response.status} - ${err}`);
        return null;
      }

      const data = await response.json();
      return data.data?.markdown || null;
    } catch (error) {
      console.error(`Scrape failed for ${url}:`, error);
      return null;
    }
  }

  /**
   * Batch process companies missing descriptions
   */
  static async processPendingEnrichment(limit: number = 5) {
    const pending = await db.query.companies.findMany({
      where: isNull(companies.description),
      limit,
    });

    console.log(`Found ${pending.length} companies pending enrichment.`);

    for (const company of pending) {
      await this.enrichCompany(company.id);
    }
  }
}
