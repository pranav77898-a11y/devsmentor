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
    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    
    if (!BYTEZ_API_KEY) {
      throw new Error("BYTEZ_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert at organizing and visualizing complex technical concepts. Create comprehensive mind maps that help learners understand topics holistically.`;

    const userPrompt = `Create a detailed mind map for the topic: ${topic}

Return JSON in this exact format:
{
  "groups": [
    {
      "category": "Category Name",
      "color": "from-cyan-500 to-cyan-600",
      "nodes": ["Concept 1", "Concept 2", "Concept 3"]
    }
  ]
}

Requirements:
- Create 5-8 categories covering all aspects of the topic
- Each category should have 4-8 related concepts
- Use these gradient colors for variety:
  - "from-cyan-500 to-cyan-600"
  - "from-teal-500 to-teal-600"
  - "from-emerald-500 to-emerald-600"
  - "from-green-500 to-green-600"
  - "from-lime-500 to-lime-600"
  - "from-yellow-500 to-yellow-600"
  - "from-orange-500 to-orange-600"
  - "from-purple-500 to-purple-600"
- Categories should be logically organized (fundamentals first, advanced last)
- Include practical applications and tools`;

    const response = await fetch("https://api.bytez.com/models/v2/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BYTEZ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bytez API error:", response.status, errorText);
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
