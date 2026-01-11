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
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");
    
    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert learning path designer. Create comprehensive, structured learning roadmaps for tech subjects. Return data in a format suitable for visual node-based representation with proper positioning.`;

    const userPrompt = `Create a detailed learning roadmap for: ${subject}

Return JSON in this exact format with nodes positioned for a visual flowchart:
{
  "nodes": [
    { 
      "id": "1", 
      "label": "Start Here", 
      "level": 0, 
      "x": 450, 
      "y": 50,
      "description": "Brief description of what to learn at this step",
      "duration": "1 week",
      "resources": [
        { "title": "Official Documentation", "url": "https://docs.example.com" },
        { "title": "YouTube Tutorial", "url": "https://youtube.com/watch?v=example" }
      ]
    }
  ],
  "edges": [
    { "from": "1", "to": "2" }
  ]
}

Requirements:
- 15-20 nodes covering the complete learning journey from beginner to job-ready
- Positioning guidelines:
  * Level 0 (Start): y=50, x=450 (centered)
  * Level 1: y=120, x spread 150-750
  * Level 2: y=200, x spread 100-800
  * Level 3: y=290, x spread 100-800
  * Level 4: y=380, x spread 150-750
  * Level 5: y=470, x spread 200-700
  * Level 6 (Final): y=560, x spread 300-600
- Include practical skills, tools, and frameworks
- Each node should have:
  * Meaningful description (20-40 words)
  * Realistic duration (1 day to 4 weeks)
  * 2-3 learning resources with REAL URLs (official docs, MDN, YouTube, freeCodeCamp, etc.)
- Progress from fundamentals to advanced topics
- Include project milestones at levels 3 and 5`;

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
