import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");
    
    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI search engine that finds the best learning resources for developers. Generate realistic and helpful search results with actual URLs to popular developer resources like MDN, React docs, official documentation, YouTube channels, GitHub, Stack Overflow, freeCodeCamp, and other reputable sources.`;

    const userPrompt = `Find the best learning resources for: ${query}

Return JSON in this exact format:
{
  "results": [
    {
      "title": "Resource Title",
      "description": "Brief description of what this resource covers",
      "url": "https://actual-url-to-resource.com",
      "type": "documentation|tutorial|video|article|code",
      "source": "Source name (e.g., MDN, React Docs, YouTube)"
    }
  ]
}

Requirements:
- Return 6-10 high-quality results
- Include mix of documentation, tutorials, videos, and articles
- Use REAL URLs from popular sources:
  * Documentation: MDN Web Docs (developer.mozilla.org), official docs sites
  * Tutorials: freeCodeCamp, DigitalOcean, CSS-Tricks, Smashing Magazine
  * Videos: YouTube (fireship, Traversy Media, The Net Ninja, Web Dev Simplified)
  * Code: GitHub, CodePen, StackBlitz
  * Articles: Dev.to, Medium, Hashnode
- Make descriptions informative and specific
- Prioritize free resources
- Include beginner to advanced content`;

    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const results = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
