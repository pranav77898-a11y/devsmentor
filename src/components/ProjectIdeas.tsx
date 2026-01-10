import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, ExternalLink, ChevronDown, ChevronUp, Code, Book, Github, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectDetails {
  name: string;
  difficulty: "Beginner" | "Medium" | "Advanced";
  skills: string[];
  description: string;
  category: string;
  techStack: string[];
  apis: string[];
  features: string[];
  estimatedTime: string;
  learningOutcomes: string[];
  resources: { title: string; url: string }[];
}

const categories = ["All", "Web Development", "AI/ML", "Mobile", "DevOps", "Cybersecurity", "Data Science"];

const ProjectIdeas = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProjects, setGeneratedProjects] = useState<ProjectDetails[]>([]);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const generateProjects = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a topic to generate projects");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-projects', {
        body: { topic: searchQuery, category: selectedCategory }
      });

      if (error) throw error;
      
      setGeneratedProjects(data.projects || []);
      toast.success(`Generated ${data.projects?.length || 0} project ideas!`);
    } catch (error) {
      console.error("Project generation error:", error);
      toast.error("Failed to generate projects. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "difficulty-beginner";
      case "Medium": return "difficulty-medium";
      case "Advanced": return "difficulty-advanced";
      default: return "";
    }
  };

  const displayedProjects = showAll ? generatedProjects : generatedProjects.slice(0, 6);

  return (
    <section id="projects" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Rocket className="w-4 h-4" />
            <span>AI Project Generator</span>
          </div>
          <h2 className="section-title">Build Real-World Projects</h2>
          <p className="section-subtitle">
            Generate detailed project ideas with tech stack, APIs, and step-by-step guidance.
          </p>
        </div>

        {/* Search and Generate */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="e.g., E-commerce, Chat App, Portfolio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark flex-1"
                onKeyDown={(e) => e.key === 'Enter' && generateProjects()}
              />
              <Button
                variant="hero"
                onClick={generateProjects}
                disabled={!searchQuery.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Projects
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Generating Project Ideas...</h3>
            <p className="text-muted-foreground">
              AI is creating detailed project plans for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!isGenerating && displayedProjects.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedProjects.map((project, index) => (
                <div 
                  key={index} 
                  className="project-card animate-fade-in"
                  style={{ animationDelay: `${(index % 6) * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`difficulty-badge ${getDifficultyClass(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{project.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  
                  {/* Tech Stack */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                      <Code className="w-3 h-3" /> Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {project.techStack?.slice(0, 4).map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* APIs */}
                  {project.apis && project.apis.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-secondary mb-2 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> APIs Used
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {project.apis.slice(0, 3).map((api, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary">
                            {api}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Time */}
                  <div className="text-xs text-muted-foreground mb-4">
                    ⏱️ Estimated Time: {project.estimatedTime}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                  >
                    {expandedProject === index ? "Hide Details" : "View Full Details"}
                    {expandedProject === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {/* Expanded Details */}
                  {expandedProject === index && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                      {/* Features */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Key Features</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {project.features?.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Learning Outcomes */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                          <Book className="w-4 h-4" /> What You'll Learn
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {project.learningOutcomes?.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources */}
                      {project.resources && project.resources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <Github className="w-4 h-4" /> Resources
                          </h4>
                          <div className="space-y-2">
                            {project.resources.map((resource, i) => (
                              <a
                                key={i}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {resource.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Show More/Less */}
            {generatedProjects.length > 6 && (
              <div className="text-center">
                <Button
                  variant="glass"
                  onClick={() => setShowAll(!showAll)}
                  className="gap-2"
                >
                  {showAll ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show All {generatedProjects.length} Projects <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isGenerating && generatedProjects.length === 0 && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Rocket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Generate Project Ideas</h3>
            <p className="text-muted-foreground">
              Enter a topic above to generate detailed project ideas with tech stack, APIs, and learning outcomes.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectIdeas;
