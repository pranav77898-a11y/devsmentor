import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, MapPin, Building2, Clock, ExternalLink, Loader2, Linkedin, Crown } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  skills: string[];
  linkedInUrl: string;
  isInternship: boolean;
  experience?: string;
  description?: string;
}

// Fallback sample jobs
const fallbackJobs: Job[] = [
  {
    title: "Software Engineer",
    company: "Google",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "₹20-35 LPA",
    posted: "2 days ago",
    skills: ["Python", "Java", "Distributed Systems"],
    linkedInUrl: "https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20google",
    isInternship: false,
    experience: "2-5 years",
    description: "Join Google to build next-generation technologies."
  },
  {
    title: "Frontend Developer",
    company: "Microsoft",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "₹15-28 LPA",
    posted: "1 day ago",
    skills: ["React", "TypeScript", "CSS"],
    linkedInUrl: "https://www.linkedin.com/jobs/search/?keywords=frontend%20developer%20microsoft",
    isInternship: false,
    experience: "1-4 years",
    description: "Build intuitive user interfaces for Microsoft products."
  },
  {
    title: "Software Engineering Intern",
    company: "Amazon",
    location: "Bangalore, India",
    type: "Internship",
    salary: "₹60-80K/month",
    posted: "3 days ago",
    skills: ["DSA", "Java/Python", "Problem Solving"],
    linkedInUrl: "https://www.linkedin.com/jobs/search/?keywords=software%20engineering%20intern%20amazon",
    isInternship: true,
    experience: "0 years",
    description: "6-month internship at Amazon."
  },
];

const JobsFinder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState<"all" | "jobs" | "internships">("all");
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const { isPro } = useSubscription();

  const searchJobs = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-jobs', {
        body: { query: searchQuery, jobType }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const jobResults = data.jobs || [];
      setJobs(jobResults.length > 0 ? jobResults : fallbackJobs);
      toast.success(`Found ${jobResults.length || fallbackJobs.length} opportunities!`);
    } catch (error) {
      console.error("Error searching jobs:", error);
      // Use fallback jobs on error
      setJobs(fallbackJobs);
      toast.error("Using cached results. AI search temporarily unavailable.");
    } finally {
      setIsSearching(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (jobType === "all") return true;
    if (jobType === "jobs") return !job.isInternship;
    if (jobType === "internships") return job.isInternship;
    return true;
  });

  const handleApply = (job: Job) => {
    window.open(job.linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="jobs" className="py-24 relative bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Briefcase className="w-4 h-4" />
            <span>Job & Internship Finder</span>
          </div>
          <h2 className="section-title">Find Your Next Opportunity</h2>
          <p className="section-subtitle">
            Search for the latest jobs and internships matching your skills and interests.
          </p>
          
          {isPro && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
                <Crown className="w-3 h-3" />
                <span>Unlimited Job Searches</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by role, skill, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-dark pl-12 w-full"
                  onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                />
              </div>
              <Button
                variant="hero"
                onClick={searchJobs}
                disabled={!searchQuery.trim() || isSearching}
                className="md:w-auto w-full"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search Jobs
                  </>
                )}
              </Button>
            </div>

            {/* Job Type Filter */}
            <div className="flex gap-2">
              {[
                { id: "all", label: "All" },
                { id: "jobs", label: "Full-time Jobs" },
                { id: "internships", label: "Internships" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setJobType(type.id as typeof jobType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    jobType === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Searching for opportunities...</h3>
            <p className="text-muted-foreground">
              Finding the best matches for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Job Results */}
        {!isSearching && filteredJobs.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredJobs.map((job, index) => (
              <div 
                key={index} 
                className="glass-card-hover p-6 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      {job.isInternship && (
                        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30">
                          Internship
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.posted}
                      </span>
                    </div>
                    
                    {job.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-semibold text-primary">{job.salary}</span>
                    {job.experience && (
                      <span className="text-xs text-muted-foreground">{job.experience}</span>
                    )}
                    <Button 
                      variant="hero" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleApply(job)}
                    >
                      <Linkedin className="w-4 h-4" />
                      Apply on LinkedIn
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && jobs.length === 0 && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Search for Opportunities</h3>
            <p className="text-muted-foreground">
              Enter a role, skill, or company name to find matching jobs and internships.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobsFinder;
