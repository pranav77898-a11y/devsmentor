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
    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    
    if (!BYTEZ_API_KEY) {
      throw new Error("BYTEZ_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert curriculum designer and learning path architect. Create detailed, structured learning roadmaps for technical subjects. Focus on practical, industry-relevant content with clear progression.`;

    const userPrompt = `Create a comprehensive learning roadmap for: ${subject}

Generate a visual roadmap with nodes and connections. Return JSON in this exact format:
{
  "nodes": [
    {"id": "1", "label": "Node Name", "level": 0, "x": 400, "y": 60},
    {"id": "2", "label": "Node Name", "level": 1, "x": 200, "y": 140}
  ],
  "edges": [
    {"from": "1", "to": "2"},
    {"from": "1", "to": "3"}
  ]
}

Rules:
- Level 0: Main topic (centered, y=60)
- Level 1: Core concepts (y=140, spread horizontally)
- Level 2: Sub-topics (y=220, spread horizontally)
- Level 3: Advanced topics (y=300, spread horizontally)
- Level 4: Specializations (y=380, spread horizontally)
- X coordinates: spread from 100 to 700 based on position
- Create 15-25 nodes covering the complete learning path
- Connect nodes logically showing prerequisites
- Include practical projects and milestones`;

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
        max_tokens: 2000,
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
