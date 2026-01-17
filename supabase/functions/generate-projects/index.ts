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
    const { topic, category } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const prompt = `You are a senior software engineer who creates detailed project ideas for developers. Generate comprehensive project specifications with tech stacks, APIs, features, and learning resources.

Generate 6 detailed project ideas for: ${topic}
${category !== "All" ? `Category focus: ${category}` : "Mix of different categories"}

Return JSON in this exact format:
{
  "projects": [
    {
      "name": "Project Name",
      "difficulty": "Beginner|Medium|Advanced",
      "skills": ["Skill1", "Skill2", "Skill3"],
      "description": "2-3 sentence project overview",
      "category": "Web Development|AI/ML|Mobile|DevOps|Cybersecurity|Data Science",
      "techStack": ["React", "Node.js", "MongoDB", "Tailwind CSS"],
      "apis": ["Stripe API", "OpenAI API", "Google Maps API"],
      "features": [
        "Feature 1 with brief description",
        "Feature 2 with brief description",
        "Feature 3 with brief description",
        "Feature 4 with brief description"
      ],
      "estimatedTime": "2-3 weeks",
      "learningOutcomes": [
        "What skill 1 you'll master",
        "What skill 2 you'll learn",
        "What concept 3 you'll understand"
      ],
      "resources": [
        { "title": "Official Documentation", "url": "https://docs.example.com" },
        { "title": "Tutorial Video", "url": "https://youtube.com/watch?v=example" }
      ]
    }
  ]
}

Requirements:
- Mix of difficulties (2 Beginner, 2 Medium, 2 Advanced)
- Include real, popular APIs (Stripe, OpenAI, Google APIs, Twilio, Firebase, etc.)
- Tech stacks should be modern and in-demand (React, Next.js, Node.js, Python, TypeScript, etc.)
- Features should be specific and actionable
- Resources should have real, valid URLs to documentation and tutorials
- Learning outcomes should be practical and industry-relevant
- Estimated time should be realistic for the difficulty level`;

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
              temperature: 0.8,
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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const projects = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(projects), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Project generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
