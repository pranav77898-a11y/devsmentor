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
    const { query } = await req.json();
    const SAMBANOVA_API_KEY = Deno.env.get("SAMBANOVA_API_KEY");
    
    if (!SAMBANOVA_API_KEY) {
      throw new Error("SAMBANOVA_API_KEY is not configured");
    }

    const systemPrompt = `You are a job search assistant specializing in tech jobs in India. Generate realistic job listings based on current market trends. Include a mix of full-time positions and internships from real companies. For each job, generate a valid LinkedIn job search URL.`;

    const userPrompt = `Generate 8-10 realistic job listings for: ${query}

Return JSON in this exact format:
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, India",
      "type": "Full-time/Internship",
      "salary": "₹X - ₹Y LPA or ₹X/month for internships",
      "posted": "X days ago",
      "skills": ["Skill1", "Skill2", "Skill3"],
      "linkedInUrl": "https://www.linkedin.com/jobs/search/?keywords=Job%20Title%20Company%20Name&location=City%2C%20India",
      "isInternship": false,
      "experience": "0-2 years",
      "description": "Brief job description"
    }
  ]
}

Requirements:
- Include mix of startups and established companies (Google, Microsoft, Flipkart, Razorpay, Infosys, TCS, Wipro, Zoho, Swiggy, Zomato, PhonePe, etc.)
- Realistic salary ranges for Indian market
- Mix of remote, hybrid, and on-site positions
- Include 2-3 internship opportunities
- Locations: Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai
- Recent postings (1-14 days ago)
- IMPORTANT: For linkedInUrl, generate a valid LinkedIn job search URL like: https://www.linkedin.com/jobs/search/?keywords=ENCODED_JOB_TITLE%20ENCODED_COMPANY&location=ENCODED_LOCATION
- URL encode the keywords and location properly (spaces as %20)`;

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "DeepSeek-V3-0324",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SambaNova API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Ensure all jobs have valid LinkedIn URLs
    if (result.jobs && Array.isArray(result.jobs)) {
      result.jobs = result.jobs.map((job: any) => {
        // If linkedInUrl is missing or invalid, generate one
        if (!job.linkedInUrl || !job.linkedInUrl.startsWith('https://www.linkedin.com')) {
          const keywords = encodeURIComponent(`${job.title} ${job.company}`);
          const location = encodeURIComponent(job.location || 'India');
          job.linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${keywords}&location=${location}`;
        }
        return job;
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Job search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
