export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://fatdesign.github.io",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};
