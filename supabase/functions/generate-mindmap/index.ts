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
    const SAMBANOVA_API_KEY = Deno.env.get("SAMBANOVA_API_KEY");
    
    if (!SAMBANOVA_API_KEY) {
      throw new Error("SAMBANOVA_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert at creating comprehensive mind maps for technical topics. Create well-organized, categorized mind maps that help learners understand complex subjects.`;

    const userPrompt = `Create a detailed mind map for: ${topic}

Return JSON in this exact format:
{
  "groups": [
    {
      "category": "Category Name",
      "color": "#hexcolor",
      "nodes": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"]
    }
  ]
}

Requirements:
- 5-7 main categories/groups
- Each category should have 4-6 specific concepts/nodes
- Use distinct, visually pleasing colors for each category (hex format like #06b6d4)
- Categories should cover: fundamentals, tools, techniques, best practices, advanced topics
- Be specific and practical for learners`;

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "DeepSeek-V3-0324",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SambaNova API error:", response.status, errorText);
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
