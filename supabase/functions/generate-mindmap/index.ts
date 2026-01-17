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
    const { topic } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const prompt = `You are an expert at creating comprehensive mind maps for technical topics. Create well-organized, categorized mind maps with proper node positioning for visual representation.

Create a detailed mind map for: ${topic}

Return JSON in this exact format:
{
  "centralTopic": "${topic}",
  "nodes": [
    {
      "id": "1",
      "label": "Concept Name",
      "category": "Category Name",
      "color": "#22d3ee",
      "x": 200,
      "y": 100,
      "connections": ["center"]
    }
  ]
}

Requirements:
- Generate 12-16 nodes representing key concepts
- Distribute nodes evenly around the center (600, 300)
- Position nodes in a circular/radial pattern:
  * Top nodes: y around 80-150, x spread 200-1000
  * Side nodes: y around 250-350, x at 100-200 or 1000-1100
  * Bottom nodes: y around 450-550, x spread 200-1000
- Use 5-6 distinct categories with colors:
  * Fundamentals: #22d3ee (cyan)
  * Tools: #10b981 (emerald)
  * Concepts: #8b5cf6 (violet)
  * Best Practices: #f59e0b (amber)
  * Advanced: #ef4444 (red)
  * Resources: #ec4899 (pink)
- Each node connects to "center"
- Labels should be concise (1-3 words max)
- Cover: basics, tools, techniques, best practices, and advanced topics`;

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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const mindmap = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(mindmap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mind map generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
