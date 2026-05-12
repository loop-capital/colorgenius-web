# ColorGenius Memory System Improvement Plan

## Audit Date: 2026-05-10
## Agent: colorgenius-ceo (Iris)

---

## Current Problems Found

### P0 — Critical
1. **Vector search disabled** — `sqlite-vec` package was missing, forcing BM25-only keyword search
2. **No memory wiki** — Missing provenance tracking that could have prevented shade data guessing
3. **Dreaming disabled** — No automatic promotion of daily notes to long-term memory
4. **Inconsistent daily logging** — Only 5 daily notes for a month of active work

### P1 — High
5. **QMD not configured** — Installed but not set up for this agent
6. **Graphify never run** — No structured knowledge graph of color science domain
7. **Obsidian underutilized** — Vault exists but barely used
8. **No session transcript indexing** — Past conversations not searchable

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: ACTIVE RECALL (Every turn)                        │
│  ├─ Hybrid search (BM25 + vectors) ✅                       │
│  ├─ Active memory plugin ✅                                  │
│  ├─ QMD with reranking (replaces builtin when ready)         │
│  └─ Session transcript search                                │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: DURABLE KNOWLEDGE (Across sessions)               │
│  ├─ MEMORY.md (curated facts)                                │
│  ├─ memory/YYYY-MM-DD.md (daily work logs)                   │
│  ├─ memory-wiki with claims + provenance                     │
│  ├─ Dreaming auto-promotion                                  │
│  └─ QMD extra paths (research docs, PDFs)                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: STRUCTURED KNOWLEDGE (Domain-specific)            │
│  ├─ graphify output (color science KG)                       │
│  ├─ Obsidian vault (visual graph, cross-project)             │
│  ├─ second-brain (concepts, documents, journal)            │
│  └─ Brand shade databases (verified data only)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Fix Critical Issues
- [x] Install sqlite-vec (done 2026-05-10)
- [ ] Restart gateway to enable vector search
- [ ] Verify vector search works with test query
- [ ] Enable dreaming with `plugins.entries.memory-core.config.dreaming.enabled: true`
- [ ] Set daily note discipline: write memory/YYYY-MM-DD.md every work day
- [ ] Create MEMORY.md curation SOP

### Phase 2: Enable Memory Wiki
- [ ] Add `memory-wiki` plugin entry to config
- [ ] Set vaultMode to `bridge` to import from memory-core
- [ ] Enable dashboards (contradictions, low-confidence, stale pages)
- [ ] Run initial wiki compile
- [ ] Set up claim tracking for critical policies (e.g., "NEVER guess shade data")

### Phase 3: Configure QMD
- [ ] Switch memory backend from `builtin` to `qmd`
- [ ] Add extra paths for research documents
- [ ] Enable session transcript indexing
- [ ] Test QMD search quality vs builtin

### Phase 4: Knowledge Graph
- [ ] Run graphify on color science research documents
- [ ] Run graphify on competitive analysis
- [ ] Integrate graphify output into QMD indexing
- [ ] Set up periodic re-graphify after major research phases

### Phase 5: Obsidian Integration
- [ ] Open colorgenius vault in Obsidian
- [ ] Create dashboard pages for key metrics
- [ ] Link graphify output into vault
- [ ] Set up daily note template

---

## Critical Policies to Track (Memory Wiki Claims)

### P0 — Product Integrity
- **Claim ID**: C001
- **Text**: "ColorGenius MUST NOT fabricate, guess, or hallucinate brand shade data"
- **Status**: active
- **Confidence**: verified
- **Evidence**: 
  - Source: Jason Opland directive 2026-05-10
  - Source: ReFa competitor analysis shows accuracy is the moat
- **Consequence**: Wrong shade data = damaged client hair = destroyed trust

### P1 — Delegation Protocol
- **Claim ID**: C002
- **Text**: "All work must be delegated via sessions_spawn from Iris to sub-agents"
- **Status**: active
- **Evidence**: SOUL.md delegation protocol

### P1 — Data Verification
- **Claim ID**: C003
- **Text**: "Every shade entry must cite its source and be cross-referenced"
- **Status**: active
- **Evidence**: MEMORY.md verification protocol section

---

## Daily Note Template

```markdown
# YYYY-MM-DD — ColorGenius Daily

## What I Did Today
- 

## Key Decisions
- 

## Blockers/Issues
- 

## Learnings
- 

## Tomorrow's Plan
- 
```

---

## Review Schedule
- **Weekly**: Review MEMORY.md for stale entries, update TASKS.md
- **Bi-weekly**: Run `wiki_lint` to check contradictions and low-confidence claims
- **Monthly**: Run graphify on accumulated research, re-index QMD

