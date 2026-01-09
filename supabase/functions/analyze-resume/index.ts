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
    const { resumeText } = await req.json();
    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    
    if (!BYTEZ_API_KEY) {
      throw new Error("BYTEZ_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist. Analyze resumes for technical roles and provide actionable feedback to improve hiring chances.`;

    const userPrompt = `Analyze this resume and provide detailed feedback:

${resumeText}

Return JSON in this exact format:
{
  "score": 75,
  "atsScore": 80,
  "strengths": [
    "Strength 1 with specific details",
    "Strength 2 with specific details",
    "Strength 3 with specific details"
  ],
  "improvements": [
    "Improvement 1 with actionable advice",
    "Improvement 2 with actionable advice",
    "Improvement 3 with actionable advice"
  ],
  "suggestions": [
    "Add quantifiable achievements (e.g., 'Improved performance by 40%')",
    "Include more industry-specific keywords",
    "Restructure experience section for better readability"
  ],
  "keywords_missing": ["keyword1", "keyword2", "keyword3"],
  "format_issues": ["issue1", "issue2"]
}

Scoring guidelines:
- Score 0-100 based on overall resume quality
- ATS Score 0-100 based on keyword optimization and formatting
- Be specific and actionable in all feedback
- Focus on tech industry standards`;

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

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
