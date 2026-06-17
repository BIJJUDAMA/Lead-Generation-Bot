import { db } from "@/lib/db";
import { companies, signals } from "@/lib/db/schema";
import { DiscoveryProvider, RawSignal } from "./types";
import { RSSProvider } from "./providers/rss";
import { GreenhouseProvider } from "./providers/ats/greenhouse";
import { LeverProvider } from "./providers/ats/lever";
import { AshbyProvider } from "./providers/ats/ashby";
import { TavilyProvider } from "./providers/tavily";

export class DiscoveryService {
  private providers: DiscoveryProvider[] = [];

  constructor() {
    this.registerProvider(new RSSProvider());
    this.registerProvider(new GreenhouseProvider());
    this.registerProvider(new LeverProvider());
    this.registerProvider(new AshbyProvider());
    this.registerProvider(new TavilyProvider());
  }

  registerProvider(provider: DiscoveryProvider) {
    this.providers.push(provider);
  }

  async runDiscovery() {
    console.log(`Starting discovery run with ${this.providers.length} providers...`);
    
    for (const provider of this.providers) {
      try {
        const rawSignals = await provider.fetchSignals();
        console.log(`Provider [${provider.name}] found ${rawSignals.length} signals.`);
        
        for (const raw of rawSignals) {
          await this.processRawSignal(raw);
        }
      } catch (error) {
        console.error(`Error in provider [${provider.name}]:`, error);
      }
    }
  }

  private async processRawSignal(raw: RawSignal) {
    // 1. Deduplicate by URL if present
    if (raw.url) {
      const existing = await db.query.signals.findFirst({
        where: (signals, { eq }) => eq(signals.url, raw.url!),
      });
      if (existing) return;
    }

    // 2. Resolve Company (Find or Create by Name)
    // In a real scenario, this would be more complex (domain matching, etc.)
    let company = await db.query.companies.findFirst({
      where: (companies, { eq }) => eq(companies.name, raw.companyName),
    });

    if (!company) {
      const [newCompany] = await db.insert(companies).values({
        name: raw.companyName,
      }).returning();
      company = newCompany;
    }

    // 3. Persist Signal
    await db.insert(signals).values({
      companyId: company.id,
      type: raw.type,
      source: raw.source,
      content: raw.content,
      url: raw.url,
      confidence: raw.confidence?.toString(),
    });

    console.log(`Ingested signal for ${raw.companyName}: ${raw.type}`);
  }
}

export const discoveryService = new DiscoveryService();
