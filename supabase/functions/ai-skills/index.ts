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
    const { skill, career } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    console.log(`Getting skill boost recommendations for: ${skill}, career: ${career}`);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://devsmentor.lovable.app",
        "X-Title": "DevsMentor",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "system",
            content: `You are a career development expert specializing in tech skills and certifications. Provide actionable recommendations for skill improvement.`
          },
          {
            role: "user",
            content: `Provide skill boost recommendations for: "${skill || 'general tech skills'}" targeting career: "${career || 'Software Development'}".

Return JSON:
{
  "skill": "${skill || 'General Tech Skills'}",
  "currentDemand": "High/Medium/Low",
  "futureOutlook": "Brief outlook for next 2-3 years",
  "certifications": [
    {
      "name": "Certification Name",
      "provider": "Provider (AWS, Google, Microsoft, etc.)",
      "level": "Beginner/Intermediate/Advanced",
      "duration": "X weeks/months",
      "cost": "₹X or Free",
      "url": "https://certification-url.com",
      "value": "Why this cert is valuable"
    }
  ],
  "learningPath": [
    { "step": 1, "title": "Step title", "duration": "X weeks", "description": "What to learn" }
  ],
  "practiceProjects": ["Project 1", "Project 2", "Project 3"],
  "topResources": [
    { "name": "Resource name", "type": "Course/Book/Platform", "url": "https://url.com" }
  ],
  "salaryImpact": "Expected salary boost with this skill",
  "complementarySkills": ["Skill1", "Skill2", "Skill3"]
}

Include 3-5 certifications, 4-5 learning steps, real URLs for resources.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log("Skill boost recommendations generated");
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-skills function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
