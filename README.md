# Pathway

Pathway is a focused job-search workspace for collecting roles, comparing fit, saving opportunities, and tracking applications without losing the context behind each decision.

## Local development

```bash
npm install
npm run dev
```

The app stores its demo data in browser `localStorage`, so it works without an API or account service. Use **Add a lead** to add a role, save jobs, and move applications through the tracker.

## Quality checks

```bash
npm run lint
npm run build
```

`dist/` is the deployable Vite output. It can be hosted on any static hosting provider with SPA fallback routing enabled.
