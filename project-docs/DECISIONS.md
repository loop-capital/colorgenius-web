# ColorGenius Architecture Decision Records

> Record WHY you chose X over Y. Future-you (and future-Claude) will thank you.

## ADR-001: Next.js 15 + App Router

**Date**: 2025-01  
**Status**: ✅ Accepted

### Context

Need a full-stack framework for the ColorGenius consultation platform with SSR, API routes, and good DX.

### Decision

Use Next.js 15 with App Router.

### Consequences

- **Positive**: Server components, streaming, API routes built-in
- **Positive**: Large ecosystem, Vercel deployment
- **Negative**: App Router is still evolving — some patterns not fully documented

---

## ADR Template

```markdown
## ADR-NNN: Title

**Date**: YYYY-MM-DD  
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXX

### Context

What is the issue?

### Decision

What are we doing?

### Consequences

What becomes easier or more difficult?
```
