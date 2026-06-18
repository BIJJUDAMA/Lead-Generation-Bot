import { eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { signals, signalAnalysis } from "../db/schema";
import { aiConfig } from "./config";
import { 
  ANALYSIS_SYSTEM_PROMPT, 
  ENRICHMENT_SYSTEM_PROMPT, 
  COMPANY_EXTRACTION_SYSTEM_PROMPT,
  REASONING_SYSTEM_PROMPT,
  getAnalysisUserPrompt, 
  getEnrichmentUserPrompt,
  getExtractionUserPrompt,
  getReasoningUserPrompt
} from "./prompts";

export interface AnalysisResult {
  classification: string;
  confidence: number;
  summary: string;
  reasoning: string;
}

export interface EnrichmentResult {
  industry: string;
  description: string;
  size: string;
  stage: string;
  website: string;
  logoUrl: string | null;
  linkedinUrl: string | null;
}

export class AnalysisService {
  /**
   * Analyzes a single signal using OpenRouter
   */
  static async analyzeSignal(signalId: string): Promise<AnalysisResult | null> {
    const signal = await db.query.signals.findFirst({
      where: eq(signals.id, signalId),
    });

    if (!signal) {
      console.error(`Signal not found: ${signalId}`);
      return null;
    }

    try {
      console.log(`Analyzing signal: ${signal.id} (${signal.type})...`);
      
      const response = await fetch(aiConfig.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/Lead-Generation-Bot", // Required by OpenRouter
          "X-Title": "Lead-Generation-Bot",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
            { role: "user", content: getAnalysisUserPrompt(signal) },
          ],
          response_format: { type: "json_object" }, // Ensure JSON output if model supports it
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const result: AnalysisResult = JSON.parse(content);

      // Save to database
      await db.insert(signalAnalysis).values({
        signalId: signal.id,
        classification: result.classification,
        confidence: result.confidence.toString(),
        summary: result.summary,
        reasoning: result.reasoning,
      });

      console.log(`Signal analyzed and saved: ${signal.id}`);
      return result;
    } catch (error) {
      console.error(`Analysis failed for signal ${signalId}:`, error);
      return null;
    }
  }

  /**
   * Extracts a company name from a news title or job post using OpenRouter
   */
  static async extractCompanyName(title: string): Promise<string | null> {
    try {
      const response = await fetch(aiConfig.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/Lead-Generation-Bot",
          "X-Title": "Lead-Generation-Bot",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: "system", content: COMPANY_EXTRACTION_SYSTEM_PROMPT },
            { role: "user", content: getExtractionUserPrompt(title) },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;
      
      // Handle potential formatting issues (markdown, weird prefixes)
      let jsonString = content.trim();
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      const result = JSON.parse(jsonString);
      return result.companyName || null;
    } catch (error) {
      console.error(`Company extraction failed for title: ${title}`, error);
      return null;
    }
  }

  /**
   * Extracts company metadata from web content using OpenRouter
   */
  static async extractCompanyMetadata(companyName: string, webContent: string): Promise<EnrichmentResult | null> {
    try {
      console.log(`Extracting metadata for company: ${companyName}...`);
      
      const response = await fetch(aiConfig.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/Lead-Generation-Bot",
          "X-Title": "Lead-Generation-Bot",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: "system", content: ENRICHMENT_SYSTEM_PROMPT },
            { role: "user", content: getEnrichmentUserPrompt(companyName, webContent) },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;

      // Handle potential formatting issues (markdown, weird prefixes)
      let jsonString = content.trim();
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      // Remove potential bad control characters that break JSON.parse
      jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Metadata extraction failed for ${companyName}:`, error);
      return null;
    }
  }

  /**
   * Processes a batch of signals that haven't been analyzed yet
   */
  static async processPendingSignals(limit: number = 10) {
    // Find signals that don't have a record in signalAnalysis
    // Note: Drizzle subquery or left join would be better, 
    // but for V1 we'll do a simple query and filter or use a specific marker.
    // In our schema, signals and signalAnalysis are separate tables.
    
    // Better approach: Join signals and signalAnalysis to find unmatched signals
    const pendingSignals = await db
      .select({ id: signals.id })
      .from(signals)
      .leftJoin(signalAnalysis, eq(signals.id, signalAnalysis.signalId))
      .where(isNull(signalAnalysis.id))
      .limit(limit);

    console.log(`Found ${pendingSignals.length} pending signals to analyze.`);

    const results = [];
    for (const s of pendingSignals) {
      const result = await this.analyzeSignal(s.id);
      if (result) results.push(result);
    }

    return results;
  }

  /**
   * Generates a 1-2 sentence explanation for an intent score
   */
  static async generateScoreReasoning(breakdown: any, recentSignals: any[]): Promise<string> {
    try {
      console.log(`Generating reasoning for score: ${breakdown.totalScore}...`);
      
      const response = await fetch(aiConfig.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/Lead-Generation-Bot",
          "X-Title": "Lead-Generation-Bot",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: "system", content: REASONING_SYSTEM_PROMPT },
            { role: "user", content: getReasoningUserPrompt(breakdown, recentSignals) },
          ],
        }),
      });

      if (!response.ok) return "Score based on recent growth signals and company size.";

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "Score based on recent growth signals.";
    } catch (error) {
      console.error(`Reasoning generation failed:`, error);
      return "Score based on identified growth indicators.";
    }
  }
}
