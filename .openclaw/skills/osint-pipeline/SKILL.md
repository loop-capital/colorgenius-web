# OSINT Competitive Intelligence Pipeline

Autonomous competitor research: web scraping → analysis → structured output → knowledge base update.

## Use Cases
- New competitor enters market → auto-profile them
- Competitor launches feature → detect and analyze
- Quarterly competitive landscape update
- Pricing/monetization pattern research

## Pipeline

### Phase 1: Discovery
```
Input: competitor name or URL
Tools: web_search, web_fetch
Output: list of sources (website, app store, social media, press releases)
```

### Phase 2: Deep Scraping
```
Input: source URLs
Tools: scrapegraph__scrape, scrapegraph__extract
Output: structured data per source
```

### Phase 3: Analysis
```
Input: raw scraped data
Tools: web_search (for cross-validation), exec (data processing)
Output: competitive intelligence report
```

### Phase 4: Knowledge Base Update
```
Input: structured report
Tools: Write (to project docs), wiki_apply (to compiled wiki)
Output: updated competitive docs
```

## Data Schema
```json
{
  "competitor": {
    "name": "string",
    "founded": "date",
    "stage": "pre-seed|seed|series-a|...",
    "funding": "$XM",
    "employees": "number",
    "headquarters": "string"
  },
  "product": {
    "category": "string",
    "platforms": ["ios", "android", "web"],
    "pricing": {
      "free_tier": "boolean",
      "paid_tiers": [{"name": "", "price": "", "features": []}],
      "monetization": "subscription|ads|affiliate|freemium"
    },
    "key_features": ["string"],
    "tech_stack": ["string"]
  },
  "positioning": {
    "tagline": "string",
    "target_audience": "string",
    "value_proposition": "string",
    "differentiation": "string"
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "threats": ["string"],
  "opportunities": ["string"],
  "screenshots": ["url"],
  "sources": ["url"]
}
```

## Example: SKINgenius Competitive Teardown
```
Task: "Research Lovi.care competitive positioning"
Agent: skingenius-research
Pipeline:
  1. Search: "lovi.care app skin analysis"
  2. Scrape: lovi.care, app store pages, press releases
  3. Extract: pricing, features, screenshots, user reviews
  4. Analyze: Compare to SKINgenius feature matrix
  5. Output: `skingenius/docs/LOVI-CARE-COMPETITIVE-TEARDOWN.md`
```

## Automation
Schedule monthly competitive sweeps:
```yaml
cron: "0 9 1 * *"  # 1st of month, 9 AM
projects:
  - skingenius: [lovi.care, skinvision, spotscan]
  - colorgenius: [vish, colorbar, myshade]
  - byondedu: [courselit, teachable, kajabi]
```
