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
    const { career } = await req.json();
    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    
    if (!BYTEZ_API_KEY) {
      throw new Error("BYTEZ_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert career advisor specializing in the Indian tech market. Analyze career paths with focus on:
- Current market trends and demand in India
- Salary ranges in LPA (Lakhs Per Annum)
- Growth potential and job security
- Required skills and learning path
- Risk assessment

Always provide practical, actionable advice based on real market conditions.`;

    const userPrompt = `Analyze the career path: ${career}

Provide a detailed analysis in the following JSON format:
{
  "career": "${career}",
  "summary": "A comprehensive 2-3 sentence summary of this career path",
  "confidence_score": 85,
  "salary_range": "₹X - ₹Y LPA",
  "risk": "Low/Medium/High",
  "trending": true/false,
  "alternatives": ["Alternative 1", "Alternative 2", "Alternative 3"],
  "skills_required": ["Skill 1", "Skill 2", "Skill 3"],
  "growth_outlook": "Description of growth potential",
  "market_demand": "High/Medium/Low"
}

Base your analysis on current Indian tech market trends and provide realistic salary ranges.`;

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
        max_tokens: 1000,
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

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Career analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
