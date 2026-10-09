# Pathway

Pathway is a focused job-search workspace for collecting roles, comparing fit, saving opportunities, and tracking applications without losing the context behind each decision.

## What is included

- Search, sort, filter, save, and triage job leads with a keyboard command palette.
- Move roles through New, Ready to apply, Applied, In review, Interview, Offer, and Closed.
- Keep private notes, checklists, follow-up dates, source links, and salary context per role.
- Edit the matching profile, see daily follow-up actions, and use the mobile navigation.
- Export and restore a complete JSON backup from Settings.

## Local development

```bash
npm install
npm run dev
```

The app stores its workspace in browser `localStorage`, so it works without an API or account service. Use **Add a lead** to add a role, save jobs, and move applications through the tracker. Use Settings → **Export backup** before clearing browser data or switching devices.

## Quality checks

```bash
npm run lint
npm run build
```

`dist/` is the deployable Vite output. It can be hosted on any static hosting provider with SPA fallback routing enabled.
