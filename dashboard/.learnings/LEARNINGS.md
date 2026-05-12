## Next.js App Router: Always set type="button" on buttons (2026-05-12)
All button elements MUST have type="button" explicitly set. Without it, buttons default to type="submit". In Next.js 15 App Router, submit buttons can have onClick handlers silently swallowed during React hydration — no error, no warning, just broken.
- HairSwatch and ColorCircle worked because they had type="button"
- Inline buttons without it broke across all steps
- This also affects any framer-motion motion.button elements
