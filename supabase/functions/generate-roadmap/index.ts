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
    const { subject } = await req.json();
    const SAMBANOVA_API_KEY = Deno.env.get("SAMBANOVA_API_KEY");
    
    if (!SAMBANOVA_API_KEY) {
      throw new Error("SAMBANOVA_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert learning path designer. Create comprehensive, structured learning roadmaps for tech subjects. Return data in a format suitable for visual node-based representation.`;

    const userPrompt = `Create a detailed learning roadmap for: ${subject}

Return JSON in this exact format with nodes positioned for a visual flowchart:
{
  "nodes": [
    { "id": "1", "label": "Fundamentals", "level": 0, "x": 400, "y": 50 },
    { "id": "2", "label": "Topic 1", "level": 1, "x": 200, "y": 150 },
    { "id": "3", "label": "Topic 2", "level": 1, "x": 600, "y": 150 }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "1", "to": "3" }
  ]
}

Requirements:
- 15-20 nodes covering the complete learning journey
- Levels: 0 (start), 1-2 (basics), 3-4 (intermediate), 5+ (advanced)
- X coordinates: 100-700 range, spread based on siblings
- Y coordinates: level * 100 + 50
- Include practical projects and real-world skills
- Progress from beginner to job-ready`;

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

    const roadmap = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(roadmap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
