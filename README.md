# Valentina · XAU/USD Institutional Dashboard

Web independiente con el dashboard de análisis de mercados de Valentina.

## Estructura del proyecto

```
valentina-web/
├── api/
│   └── analyze.js      ← Serverless function (Edge) — proxy a Claude API
├── public/
│   └── index.html      ← Frontend completo con cooldown 1h
├── vercel.json         ← Configuración Vercel
└── README.md
```

## Deploy en Vercel (5 minutos)

### Opción A — Desde GitHub (recomendado)

1. Crea un repositorio en GitHub y sube esta carpeta
2. Ve a https://vercel.com → "Add New Project" → importa el repo
3. En "Environment Variables" añade:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu clave `sk-ant-...`
4. Click "Deploy" → obtienes una URL pública

### Opción B — Vercel CLI

```bash
npm i -g vercel
cd valentina-web
vercel
# Sigue las instrucciones → cuando pida variables de entorno, añade ANTHROPIC_API_KEY
```

## Cómo funciona

- **Al abrir la web:** si hay caché válida (< 1h), muestra el último dashboard. Si no, genera uno nuevo automáticamente.
- **Botón Actualizar:** genera un nuevo dashboard llamando a Claude con web search. Bloqueado durante 1h tras cada actualización.
- **Cooldown 1h:** almacenado en localStorage. El botón muestra cuenta atrás en tiempo real.
- **Claude API:** el backend (api/analyze.js) llama a `claude-sonnet-4-6` con web_search activado. Claude busca precio XAU/USD, DXY, WTI, CME FedWatch y noticias macro, luego genera el HTML completo del dashboard.

## Variable de entorno obligatoria

| Variable | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | tu clave `sk-ant-...` de console.anthropic.com |

## Notas

- El sistema prompt incluye todo el contexto macro acumulado (mayo–septiembre 2026).
- Cada actualización tarda ~45–90 segundos (Claude hace web searches reales).
- El HTML generado se guarda en localStorage para no repetir llamadas innecesarias.
