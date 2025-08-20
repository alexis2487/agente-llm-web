# Agente LLM Web (GitHub Pages + Cloudflare Worker)

Monorepo con:
- `apps/site`: Sitio (Astro) hospedado en GitHub Pages
- `workers/llm-proxy`: Proxy (Cloudflare Worker) para llamar a OpenAI sin exponer la clave

## Requisitos
- Node.js >= 20, npm
- Cuenta de GitHub
- Cuenta de Cloudflare (Workers)
- Clave de OpenAI (se guarda como secret en el Worker)

## Scripts (root)
- `npm run build` → ejecuta el build del sitio
- `npm run fmt` → Prettier (formatea)
- `npm run lint` → placeholder

## Estructura
- apps/site/           (se completa en Fase 0 - Prompt 2)
- workers/llm-proxy/   (se completa en Fase 0 - Prompt 3)
- .github/workflows/   (CI para Pages)
