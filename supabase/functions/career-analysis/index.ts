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
    const { careerPath } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");
    
    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    const systemPrompt = `You are a career advisor specializing in the Indian tech market. Provide detailed, actionable career analysis with current market insights. Focus on Indian tech industry specifics including salary ranges in INR, major tech hubs, and top companies.`;

    const userPrompt = `Analyze the career path: ${careerPath}

Provide a comprehensive analysis in JSON format:
{
  "career": "${careerPath}",
  "summary": "2-3 sentence overview of this career",
  "confidenceScore": 85,
  "salaryRange": {
    "entry": "₹X-Y LPA",
    "mid": "₹X-Y LPA", 
    "senior": "₹X-Y LPA"
  },
  "risk": "Low/Medium/High",
  "alternatives": ["Alternative Career 1", "Alternative Career 2", "Alternative Career 3"],
  "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "growthOutlook": "Description of 5-year growth potential",
  "topCompanies": ["Company 1", "Company 2", "Company 3"],
  "demandTrend": "Increasing/Stable/Decreasing",
  "learningPath": "Recommended learning approach"
}

Focus on accurate data for the Indian tech market in 2024-2025.`;

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
