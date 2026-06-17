import { pgTable, uuid, text, timestamp, numeric, integer, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  website: text("website").unique(),
  industry: text("industry"),
  description: text("description"),
  size: text("size"),
  stage: text("stage"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const signals = pgTable("signals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  source: text("source"),
  content: text("content").notNull(),
  url: text("url"),
  confidence: numeric("confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    companyIdIdx: index("signals_company_id_idx").on(table.companyId),
  };
});

export const signalAnalysis = pgTable("signal_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  signalId: uuid("signal_id")
    .references(() => signals.id, { onDelete: "cascade" })
    .notNull(),
  classification: text("classification"),
  confidence: numeric("confidence"),
  summary: text("summary"),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const intentScores = pgTable("intent_scores", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  totalScore: integer("total_score").notNull(),
  breakdown: jsonb("breakdown"),
  explanation: text("explanation"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
