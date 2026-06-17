import { eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { signals, signalAnalysis } from "../db/schema";
import { aiConfig } from "./config";
import { ANALYSIS_SYSTEM_PROMPT, getAnalysisUserPrompt } from "./prompts";

export interface AnalysisResult {
  classification: string;
  confidence: number;
  summary: string;
  reasoning: string;
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
}
