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
    const { query, jobType } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    console.log(`Searching jobs for: ${query}, type: ${jobType}`);

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
            content: `You are a job search assistant specializing in tech jobs and internships in India. Generate realistic job listings with LinkedIn search URLs.`
          },
          {
            role: "user",
            content: `Generate 6-8 job/internship listings for: "${query}". Type: ${jobType}. 
Return a JSON array with this structure:
[
  {
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, India",
    "type": "Full-time/Part-time/Internship",
    "salary": "₹X-Y LPA or ₹X-YK/month for internships",
    "posted": "X days ago",
    "skills": ["Skill1", "Skill2", "Skill3"],
    "linkedInUrl": "https://www.linkedin.com/jobs/search/?keywords=encoded+job+title+company",
    "isInternship": true/false,
    "experience": "X-Y years",
    "description": "Brief job description"
  }
]
Include top Indian and MNC companies. Make LinkedIn URLs realistic search URLs.`
          }
        ],
        temperature: 0.8,
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
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log(`Found ${result.length} job listings`);
    return new Response(JSON.stringify({ jobs: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-jobs function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
