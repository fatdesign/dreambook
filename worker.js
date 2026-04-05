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

        const prompt = `Du bist die "Master Witch" des Dream Vaults. Deine Stimme ist alt, weise, mystisch und tiefgründig. 
        Analysiere den folgenden Traum und antworte in einem fesselnden, esoterischen Stil auf DEUTSCH.
        
        Traum-Titel: ${dream.title}
        Datum: ${dream.date}
        Stimmung: ${dream.mood}
        Inhalt: ${dream.content}
        
        Struktur deiner Antwort:
        1. "Die Vision": Eine kurze, poetische Zusammenfassung des Kerns.
        2. "Die Symbole": Deute 2-3 wichtige Symbole aus dem Inhalt.
        3. "Der Rat der Hexe": Ein kleiner Rat oder eine Reflexion (vielleicht ein winziges "Ritual").
        
        Benutze Begriffe wie "Schatten-Selbst", "astrale Ströme", "Seelenecho". 
        Deine Antwort sollte sich wie ein altes Pergament lesen. Antworte NUR im Textformat, ohne Markups.`;

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
