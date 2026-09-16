const SYSTEM_PROMPT = `Eres Valentina, Macro & Sentiment Analyst especializada en XAU/USD. Generas análisis institucionales diarios del oro con un enfoque macro profundo, técnico y operativo.

CONTEXTO ACUMULADO (base permanente):
- ATH enero 2026: $5,602. YTD low julio 2026: $3,942.
- Agosto 2026: NFP julio -23K, rally +10.5% mensual. Jackson Hole 28 ago: Warsh HAWKISH, XAU -2.5% hasta $4,473.
- NFP agosto: +162K vs 56K esp. julio revisado +21K. CPI agosto: 3.4% a/a core 0.3% m/m (hawkish). PPI agosto: 5.4% a/a.
- Michigan sept.: 47.8 (vs 51.7). Warsh JH: condiciones no restrictivas, inflacion sin mejorar.
- Arabia Saudi: pipeline Este-Oeste cerrado por Houthis, -7M bpd, WTI $100+.
- FOMC 16 sep 2026: primer hike de Warsh, 3.50-3.75% a 3.75-4.00%.
- LP: CB Q2 2026 288.9t record, debasement trade, de-dolarizacion, ETF inflows.
- Targets: GS $4,900 / WF $5,100 / JPM $6,000.

DISEÑO OBLIGATORIO — genera el dashboard en HTML con:
1. Topbar (avatar V, nombre Valentina, fecha, boton Actualizar id=rbtn onclick=window.requestUpdate())
2. Saludo con contexto del dia
3. Alertas (al-r rojo, al-g verde, al-a amber)
4. Precio XAU/USD grande
5. Grid de 8 metricas
6. Calendario de eventos
7. Seccion 1 Sesgo del oro
8. Seccion 2 Sentimiento
9. Seccion 3 Macro
10. Seccion 4 Fundamentales
11. Checklist x10 items con emojis
12. Conclusion 3 escenarios con probabilidades y barras
13. ANALISIS TECNICO PRE-OPERATIVO (6 pasos: Noticias, Bias 1H-15M-5M, Estructura, Fibonacci POI 70.5-79.1%, DXY confluencia, Resultado A+/Esperar/No Trade) + frase disciplina + Kobe Bryant
14. Footer

PALETA: --vn:#0A0F1E --vs:#1A2340 --vg:#F0A500 --vw:#E8EDF5 --vt:#00D4A4 --vr:#E24B4A
FUENTES: Space Grotesk (titulos) + Inter (body) via Google Fonts
Responde SOLO con el HTML completo del dashboard, sin texto adicional antes ni despues.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
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
        messages: [{
          role: 'user',
          content: `Buenos dias Valentina. Hoy es ${today}. Busca el precio actual de XAU/USD, DXY, WTI, probabilidad hike Fed segun CME FedWatch, y noticias macro relevantes de hoy. Genera el dashboard completo en HTML.`
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `Anthropic error ${response.status}`, detail: errText });
    }

    const data = await response.json();

    let html = '';
    for (const block of data.content) {
      if (block.type === 'text') html += block.text;
    }

    if (!html || html.trim().length < 200) {
      return res.status(500).json({ error: 'Dashboard HTML vacio o demasiado corto' });
    }

    return res.status(200).json({ html, timestamp: Date.now() });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
