export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://fatdesign.github.io",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-KEY",
    };

    // 1. Handle Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Authentication
    const userApiKey = request.headers.get("X-API-KEY");
    if (!userApiKey || userApiKey !== env.PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 3. Simple API Routes
    try {
      // POST /verify: Simple check for password
      if (path === "/verify" && request.method === "POST") {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /dreams: List all dreams
      if (path === "/dreams" && request.method === "GET") {
        const dreamsRaw = await env.DREAMS_KV.get("dreams_list");
        const dreams = dreamsRaw ? JSON.parse(dreamsRaw) : [];
        return new Response(JSON.stringify(dreams), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST /dreams: Add a new dream
      if (path === "/dreams" && request.method === "POST") {
        const newDream = await request.json();
        const dreamsRaw = await env.DREAMS_KV.get("dreams_list");
        const dreams = dreamsRaw ? JSON.parse(dreamsRaw) : [];
        
        const dreamWithId = {
          ...newDream,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        };
        
        dreams.unshift(dreamWithId); // Add to beginning
        await env.DREAMS_KV.put("dreams_list", JSON.stringify(dreams));
        
        return new Response(JSON.stringify(dreamWithId), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // PUT /dreams/:id: Update an existing dream
      if (path.startsWith("/dreams/") && request.method === "PUT") {
        const dreamId = path.split("/")[2];
        const updatedData = await request.json();
        const dreamsRaw = await env.DREAMS_KV.get("dreams_list");
        const dreams = dreamsRaw ? JSON.parse(dreamsRaw) : [];
        
        const index = dreams.findIndex(d => d.id === dreamId);
        if (index === -1) return new Response("Not Found", { status: 404, headers: corsHeaders });
        
        dreams[index] = { ...dreams[index], ...updatedData };
        await env.DREAMS_KV.put("dreams_list", JSON.stringify(dreams));
        
        return new Response(JSON.stringify(dreams[index]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // DELETE /dreams/:id
      if (path.startsWith("/dreams/") && request.method === "DELETE") {
        const dreamId = path.split("/")[2];
        const dreamsRaw = await env.DREAMS_KV.get("dreams_list");
        const dreams = dreamsRaw ? JSON.parse(dreamsRaw) : [];
        
        const filteredDreams = dreams.filter(d => d.id !== dreamId);
        await env.DREAMS_KV.put("dreams_list", JSON.stringify(filteredDreams));
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST /dreams/:id/analyze: AI Dream Interpretation
      if (path.startsWith("/dreams/") && path.endsWith("/analyze") && request.method === "POST") {
        const dreamId = path.split("/")[2];
        const dreamsRaw = await env.DREAMS_KV.get("dreams_list");
        const dreams = dreamsRaw ? JSON.parse(dreamsRaw) : [];
        
        const dream = dreams.find(d => d.id === dreamId);
        if (!dream) return new Response("Not Found", { status: 404, headers: corsHeaders });
        
        if (!env.KI_API) {
          return new Response(JSON.stringify({ error: "KI_API key is missing in Worker environment." }), { 
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        }

        const prompt = `
        Du bist ein professioneller, tiefgründiger psychologischer Traumdeuter (AI Dream Analyst). 
        Analysiere den folgenden Traum prägnant und auf den Punkt. 
        Kürze unnötiges Gequassel und komm direkt zur Sache.
        
        TRAUM-DATEN:
        Titel: ${dream.title}
        Inhalt: ${dream.content}
        Typ: ${dream.type}
        Stimmung: ${dream.mood}
        
        DEINE STRUKTUR (Antworte auf Deutsch):
        1. KERNBOTSCHAFT: (Max. 1 Satz)
        2. SYMBOLIK: (Max. 3 Sätze zu den wichtigsten Elementen)
        3. DEUTUNG: (Max. 3 Sätze über den Bezug zum realen Leben)
        
        Antworte NUR in diesem strukturierten Textformat. Keine Einleitung ("Ich habe deinen Traum empfangen..."), keine Verabschiedung.`;

        const analysisText = await callGemini(prompt, env.KI_API);
        
        // Save analysis back to the dream object
        const index = dreams.findIndex(d => d.id === dreamId);
        dreams[index].analysis = analysisText;
        await env.DREAMS_KV.put("dreams_list", JSON.stringify(dreams));
        
        return new Response(JSON.stringify({ analysis: analysisText }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};

/**
 * Robust AI Caller that tries multiple models and versions (Inspired by stempelkarte)
 */
async function callGemini(prompt, apiKey) {
  const versions = ["v1beta", "v1"];
  const models = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-flash-latest",
    "models/gemini-pro-latest",
    "models/gemini-pro"
  ];

  let lastError = "";

  for (const ver of versions) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              temperature: 0.8, 
              maxOutputTokens: 2048,
              topP: 0.95,
              topK: 40
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = `[${ver}/${model}] ${response.status}: ${errData.error?.message || "Unknown error"}`;
        }
      } catch (e) {
        lastError = `[Fetch Error] ${e.message}`;
      }
    }
  }

  throw new Error(`The Witch remains silent after many attempts. Last error: ${lastError}`);
}
