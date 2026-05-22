# COLORgenius — Project Status

> **Last Updated:** 2026-05-22
> **Deployed:** colorgenius.co on Vercel
> **Repo:** /home/jason/.openclaw/workspaces/colorgenius/

---

## ⚠️ CRITICAL ARCHITECTURE DECISIONS

### Photo Analysis — DO NOT CHANGE
- **PRIMARY:** Gemma E4B on user's iPhone (on-device via LiteRT-LM)
  - Web: `@litert-lm/core` npm package
  - iOS: LiteRT-LM Swift API with Metal GPU
  - Model: `gemma-4-E4B-it-web.litertlm` from Hugging Face
- **FALLBACK:** Kimi K2.6 vision via Ollama (server-side, burns tokens)
- **Goal:** Zero vision API costs — all analysis on-device
- **Reference:** https://github.com/google-ai-edge/LiteRT-LM
- **Status:** Vision API endpoint created at `/api/vision-analyze`. Kimi fallback works. On-device Gemma integration NOT YET BUILT — needs LiteRT-LM JS integration.

### Payment — Square Only (NO Stripe)
- Square API in sandbox mode
- Need to swap for production creds

---

## What's Built

### Web Dashboard (Next.js)
- Formulate page: 6-step flow (Photo → Hair Assessment → Chemical History → Target → Condition → Results)
- Photo upload works (file picker, stores base64)
- Vision analysis wired: Step 1 "Next" calls `/api/vision-analyze` → auto-fills level/tone/gray/porosity
- Formulation engine: generates formulas from hair state input
- Scale bowl widget, product search, corrective color, visual outcome simulator
- Contextual education component
- Client management, history, subscription, marketplace

### Native App (React Native / Expo)
- Submitted to App Store Connect
- Status: Processing at Apple

---

## Blockers / TODO

- [ ] Gemma E4B on-device vision integration (LiteRT-LM JS)
- [ ] Square production mode (swap sandbox creds)
- [ ] App Store review (after TestFlight testing)
- [ ] Google Sign In implementation
- [ ] Vagaro integration testing

---

## Deployment

```bash
cd /home/jason/.openclaw/workspaces/colorgenius/dashboard
npx vercel --prod --yes
```

Vercel project: `dashboard`
Production URL: colorgenius.co

### Backup Tags
- `backup/working-formulation-fix-may16-2300` (latest)

