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
    const { topic, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a senior software engineer who creates detailed project ideas for developers. Generate comprehensive project specifications with tech stacks, APIs, features, and learning resources.`;

    const userPrompt = `Generate 6 detailed project ideas for: ${topic}
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
    const content = data.choices?.[0]?.message?.content;

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
