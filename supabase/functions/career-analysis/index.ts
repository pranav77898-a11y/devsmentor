import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfterSeconds = (resp: Response): number | null => {
  const header = resp.headers.get("retry-after") ?? resp.headers.get("Retry-After");
  if (!header) return null;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : null;
};

const fetchWithRetry = async (
  requestFn: () => Promise<Response>,
  maxRetries = 3
): Promise<Response> => {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await requestFn();

    if (resp.status !== 429) return resp;

    lastResponse = resp;
    if (attempt === maxRetries) break;

    const retryAfterSeconds = parseRetryAfterSeconds(resp);
    const baseDelayMs = Math.min(30000, Math.pow(2, attempt) * 1000);
    const jitterMs = Math.floor(Math.random() * 500);
    const delayMs = retryAfterSeconds ? retryAfterSeconds * 1000 : baseDelayMs + jitterMs;

    console.warn(
      `Gemini rate limited (429). Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries}).`
    );
    await sleep(delayMs);
  }

  return lastResponse ?? (await requestFn());
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { careerPath } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const prompt = `You are a career advisor specializing in the Indian tech market. Provide detailed, actionable career analysis with current market insights. Focus on Indian tech industry specifics including salary ranges in INR, major tech hubs, and top companies.

Analyze the career path: ${careerPath}

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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetchWithRetry(
      () =>
        fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
            },
          }),
        }),
      3
    );

    if (!response.ok) {
     if (response.status === 429) {
       const retryAfterSeconds = parseRetryAfterSeconds(response);
       return new Response(
         JSON.stringify({
           error: retryAfterSeconds
             ? `Rate limit exceeded. Please wait ${retryAfterSeconds}s and try again.`
             : "Rate limit exceeded. Please try again later.",
           retryAfterSeconds,
         }),
         {
           status: 429,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in AI response");
    }

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
