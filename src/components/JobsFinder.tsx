import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, MapPin, Building2, Clock, ExternalLink, Loader2 } from "lucide-react";

interface Job {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  skills: string[];
  url: string;
  isInternship: boolean;
}

const JobsFinder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState<"all" | "jobs" | "internships">("all");
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const searchJobs = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate AI-powered job search
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockJobs: Job[] = [
      { title: "Software Engineer", company: "Google", location: "Bangalore", type: "Full-time", salary: "₹20-35 LPA", posted: "2 days ago", skills: ["Python", "Go", "Distributed Systems"], url: "#", isInternship: false },
      { title: "Frontend Developer", company: "Flipkart", location: "Bangalore", type: "Full-time", salary: "₹15-25 LPA", posted: "1 day ago", skills: ["React", "TypeScript", "Next.js"], url: "#", isInternship: false },
      { title: "ML Engineer Intern", company: "Microsoft", location: "Hyderabad", type: "Internship", salary: "₹50K/month", posted: "3 days ago", skills: ["Python", "PyTorch", "ML"], url: "#", isInternship: true },
      { title: "DevOps Engineer", company: "Amazon", location: "Remote", type: "Full-time", salary: "₹18-30 LPA", posted: "5 hours ago", skills: ["AWS", "Kubernetes", "Terraform"], url: "#", isInternship: false },
      { title: "Backend Developer Intern", company: "Razorpay", location: "Bangalore", type: "Internship", salary: "₹40K/month", posted: "1 week ago", skills: ["Node.js", "PostgreSQL", "Redis"], url: "#", isInternship: true },
      { title: "Data Scientist", company: "Swiggy", location: "Bangalore", type: "Full-time", salary: "₹22-35 LPA", posted: "4 days ago", skills: ["Python", "SQL", "ML", "Statistics"], url: "#", isInternship: false },
    ];
    
    setJobs(mockJobs);
    setIsSearching(false);
  };

  const filteredJobs = jobs.filter(job => {
    if (jobType === "all") return true;
    if (jobType === "jobs") return !job.isInternship;
    if (jobType === "internships") return job.isInternship;
    return true;
  });

  return (
    <section id="jobs" className="py-24 relative bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Briefcase className="w-4 h-4" />
            <span>AI Job & Internship Finder</span>
          </div>
          <h2 className="section-title">Find Your Next Opportunity</h2>
          <p className="section-subtitle">
            AI scans the web to find the latest jobs and internships matching your skills and interests.
          </p>
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

        {/* Job Results */}
        {filteredJobs.length > 0 && (
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
                    <Button variant="glass" size="sm" className="gap-2">
                      Apply Now
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {jobs.length === 0 && !isSearching && (
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
