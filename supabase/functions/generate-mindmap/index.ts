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
    const { topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert at creating comprehensive mind maps for technical topics. Create well-organized, categorized mind maps with proper node positioning for visual representation.`;

    const userPrompt = `Create a detailed mind map for: ${topic}

Return JSON in this exact format:
{
  "centralTopic": "${topic}",
  "nodes": [
    {
      "id": "1",
      "label": "Concept Name",
      "category": "Category Name",
      "color": "#22d3ee",
      "x": 200,
      "y": 100,
      "connections": ["center"]
    }
  ]
}

Requirements:
- Generate 12-16 nodes representing key concepts
- Distribute nodes evenly around the center (600, 300)
- Position nodes in a circular/radial pattern:
  * Top nodes: y around 80-150, x spread 200-1000
  * Side nodes: y around 250-350, x at 100-200 or 1000-1100
  * Bottom nodes: y around 450-550, x spread 200-1000
- Use 5-6 distinct categories with colors:
  * Fundamentals: #22d3ee (cyan)
  * Tools: #10b981 (emerald)
  * Concepts: #8b5cf6 (violet)
  * Best Practices: #f59e0b (amber)
  * Advanced: #ef4444 (red)
  * Resources: #ec4899 (pink)
- Each node connects to "center"
- Labels should be concise (1-3 words max)
- Cover: basics, tools, techniques, best practices, and advanced topics`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const mindmap = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(mindmap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mind map generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
