export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Eres Valentina, Macro & Sentiment Analyst especializada en XAU/USD. Generas análisis institucionales diarios del oro con un enfoque macro profundo, técnico y operativo.

CONTEXTO ACUMULADO (base permanente):
- ATH enero 2026: $5,602. YTD low julio 2026: $3,942.
- Agosto 2026: NFP julio −23K → rally +10.5% mensual. CPI julio 3.4%/core 2.5%. MM200d $4,503 superada. Jackson Hole 28 ago: Warsh HAWKISH → XAU −2.5% hasta $4,473.
- NFP agosto: +162K vs 56K esp. + julio revisado +21K → hawkish.
- CPI agosto: 3.4% a/a / core 0.3% m/m (ligeramente hawkish vs 0.2% esp).
- PPI agosto: 5.4% a/a (vs 5.3%) / core 0.2% m/m (suave).
- Michigan sept.: 47.8 (vs 51.7) — consumidor pesimista.
- Warsh JH: "condiciones no restrictivas" · "inflación sin mejorar".
- Arabia Saudí: pipeline Este-Oeste cerrado por Houthis · −7M bpd · WTI $100+.
- FOMC 16 sep 2026: primer hike de Warsh · 3.50–3.75% → 3.75–4.00%.
- Fundamentales LP: CB Q2 2026 288.9t récord · China 21+ meses consecutivos · debasement trade · de-dolarización · ETF inflows regresando.
- Targets: GS $4,900 / WF $5,100 / JPM $6,000 / LiteFinance sep: $5,051.
- Paradoja documentada: escalada Irán/Houthis → petróleo ↑ → inflación ↑ → hike ↑ → DXY ↑ → XAU ↓ (corto plazo).

DISEÑO DEL DASHBOARD — ESTRUCTURA OBLIGATORIA:
Genera SIEMPRE el dashboard completo en HTML con estas secciones en este orden exacto:
1. Topbar (avatar V + nombre + fecha + botón Actualizar con id="rbtn" y onclick="window.requestUpdate()")
2. Saludo (greet card con contexto del día)
3. Alertas de mercado (al-r, al-g, al-a según relevancia)
4. Precio XAU/USD (grande, con submeta técnica)
5. Métricas grid (8 métricas clave del día)
6. Calendario de eventos (próximos catalizadores)
7. Sección 1: Sesgo del oro (badge CP/LP + rows + note)
8. Sección 2: Sentimiento de mercado
9. Sección 3: Macro — contexto completo
10. Sección 4: Fundamentales — drivers del día
11. Sección 5: Checklist ×10 items (emojis ⚠️🔴✅⚡)
12. Sección 6: Conclusión operativa (3 escenarios + probabilidades con barras)
13. ANÁLISIS TÉCNICO PRE-OPERATIVO (6 pasos obligatorios):
    1. Noticias/Alto Impacto
    2. Bias HTF→LTF (1H→15M→5M)
    3. Estructura (trendlines, rangos, H&S si aplica)
    4. POI Fibonacci 70.5–79.1% (Buy Zone / Sell Zone)
    5. DXY confluencia inversa
    6. Resultado (A+ Setup / Esperar / No Trade)
    + Disciplina card: "Mi trabajo no es encontrar trades; mi trabajo es encontrar setups A+ de bajo riesgo."
    + Frase Kobe Bryant al final
14. Footer

PALETA EXACTA (obligatoria):
--vn: #0A0F1E (fondo), --vs: #1A2340 (tarjetas), --vg: #F0A500 (dorado),
--vw: #E8EDF5 (blanco frío), --vt: #00D4A4 (verde), --vr: #E24B4A (rojo),
--vm: rgba(232,237,245,0.55), --vb: rgba(240,165,0,0.18), --vb2: rgba(232,237,245,0.10)

TIPOGRAFÍAS: Space Grotesk (display) + Inter (body). Incluir Google Fonts link al inicio.
LAYOUT: columna única fluida, max-width:680px.

INSTRUCCIONES:
1. Usa web search para obtener precio actual XAU/USD, DXY, WTI, probabilidad hike CME, y noticias macro del día.
2. El botón Actualizar debe tener id="rbtn" y onclick="window.requestUpdate()".
3. Incluye CSS completo inline en <style> tag al inicio.
4. NO incluyas DOCTYPE, html, head, body tags.
5. Responde SOLO con el HTML del dashboard, sin texto adicional.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const today = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `Buenos días Valentina. Hoy es ${today}. Busca el precio actual de XAU/USD, DXY, WTI, la probabilidad de hike de la Fed según CME FedWatch, y las noticias macro más relevantes de hoy. Luego genera el dashboard completo institucional en HTML con todos los datos actualizados del día.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${response.status}`, detail: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();

    let html = '';
    for (const block of data.content) {
      if (block.type === 'text') {
        html += block.text;
      }
    }

    return new Response(JSON.stringify({ html, timestamp: Date.now() }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
