# Lead Intelligence Platform

Automated lead intelligence platform that identifies and qualifies high-intent sales prospects. The system monitors market activity to discover opportunities, analyzes intent via AI, and enriches firmographic data to rank leads.

## Pipeline Overview

The platform operates through an automated data pipeline:

1. **Signal Discovery**: Monitors RSS feeds, ATS job boards, and search engines for market signals (e.g., funding, hiring, expansions).
2. **AI Signal Analysis**: Processes signals using LLMs to classify intent, determine confidence levels, and generate summaries.
3. **Company Enrichment**: Scrapes company websites to extract firmographic metadata (industry, size, stage).
4. **Intent Scoring**: Calculates a deterministic buying intent score based on signal type, volume, and recency, normalized to a 0-100 scale.

## Core Capabilities

- **Automated Ingestion**: Scheduled discovery tasks ensure a consistent flow of fresh market data.
- **Intent Qualification**: AI-driven analysis separates meaningful growth signals from noise.
- **Data Enrichment**: Automated firmographic gathering to support outbound sales efforts.
- **Prioritization**: Deterministic scoring engine ranks companies to focus outbound efforts on the highest-intent leads.

## Technical Architecture

- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL (Neon, managed via Drizzle ORM)
- **AI Provider**: OpenRouter
- **Scraping**: Firecrawl
- **Task Scheduling**: Vercel Cron Jobs

## Scoring Engine

The scoring system evaluates companies on a 0-100 scale based on three primary categories:

1. **Funding**: Venture capital and investment activity.
2. **Hiring**: Job openings and headcount growth.
3. **Growth**: New markets, product launches, or office expansions.

Final scores incorporate AI-assigned confidence intervals and recency penalties for data aging.
