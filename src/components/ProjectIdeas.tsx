import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, ExternalLink, ChevronDown, ChevronUp, Code, Book, Github, Loader2, Sparkles, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";

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
}

const categories = ["All", "Web Development", "AI/ML", "Mobile", "DevOps", "Cybersecurity", "Data Science"];

// Static sample projects
const sampleProjects: ProjectDetails[] = [
  {
    name: "Personal Portfolio Website",
    difficulty: "Beginner",
    skills: ["HTML", "CSS", "JavaScript"],
    description: "Build a stunning personal portfolio to showcase your projects and skills to potential employers.",
    category: "Web Development",
    techStack: ["React", "Tailwind CSS", "Framer Motion"],
    apis: [],
    features: ["Responsive design", "Dark mode", "Contact form", "Project gallery"],
    estimatedTime: "1-2 weeks",
    learningOutcomes: ["React fundamentals", "CSS animations", "Responsive design patterns"]
  },
  {
    name: "Task Management App",
    difficulty: "Medium",
    skills: ["React", "Node.js", "Database"],
    description: "Create a full-featured task management application with user authentication and real-time updates.",
    category: "Web Development",
    techStack: ["React", "Node.js", "PostgreSQL", "Socket.io"],
    apis: ["REST API"],
    features: ["User authentication", "Task CRUD", "Real-time sync", "Team collaboration"],
    estimatedTime: "3-4 weeks",
    learningOutcomes: ["Full-stack development", "Database design", "Real-time communication"]
  },
  {
    name: "E-commerce Platform",
    difficulty: "Advanced",
    skills: ["React", "Node.js", "Payment Integration"],
    description: "Build a complete e-commerce platform with product catalog, cart, and payment processing.",
    category: "Web Development",
    techStack: ["Next.js", "Stripe", "PostgreSQL", "Redis"],
    apis: ["Stripe API", "Shipping API"],
    features: ["Product catalog", "Shopping cart", "Payment processing", "Order tracking"],
    estimatedTime: "6-8 weeks",
    learningOutcomes: ["Payment integration", "Inventory management", "Security best practices"]
  },
  {
    name: "Weather Dashboard",
    difficulty: "Beginner",
    skills: ["JavaScript", "API Integration"],
    description: "Create a weather dashboard that displays current weather and forecasts for any city.",
    category: "Web Development",
    techStack: ["React", "Chart.js", "Tailwind CSS"],
    apis: ["OpenWeather API"],
    features: ["City search", "5-day forecast", "Weather charts", "Location detection"],
    estimatedTime: "1 week",
    learningOutcomes: ["API integration", "Data visualization", "Error handling"]
  },
  {
    name: "Image Classification Model",
    difficulty: "Medium",
    skills: ["Python", "TensorFlow", "Deep Learning"],
    description: "Build an image classification model using CNN to identify objects in images.",
    category: "AI/ML",
    techStack: ["Python", "TensorFlow", "Keras", "OpenCV"],
    apis: [],
    features: ["Image preprocessing", "CNN architecture", "Model training", "Prediction API"],
    estimatedTime: "3-4 weeks",
    learningOutcomes: ["Deep learning", "Computer vision", "Model optimization"]
  },
  {
    name: "Expense Tracker Mobile App",
    difficulty: "Medium",
    skills: ["React Native", "Mobile Development"],
    description: "Build a cross-platform mobile app to track expenses and manage personal finances.",
    category: "Mobile",
    techStack: ["React Native", "Expo", "SQLite", "Charts"],
    apis: [],
    features: ["Expense logging", "Categories", "Monthly reports", "Budget goals"],
    estimatedTime: "3-4 weeks",
    learningOutcomes: ["Mobile development", "Local storage", "Data visualization"]
  },
  {
    name: "CI/CD Pipeline Setup",
    difficulty: "Medium",
    skills: ["Docker", "GitHub Actions", "AWS"],
    description: "Set up a complete CI/CD pipeline for automated testing and deployment.",
    category: "DevOps",
    techStack: ["Docker", "GitHub Actions", "AWS", "Terraform"],
    apis: ["AWS APIs"],
    features: ["Automated testing", "Container builds", "Blue-green deployment", "Monitoring"],
    estimatedTime: "2-3 weeks",
    learningOutcomes: ["CI/CD concepts", "Containerization", "Infrastructure as code"]
  },
  {
    name: "Network Security Scanner",
    difficulty: "Advanced",
    skills: ["Python", "Networking", "Security"],
    description: "Build a network security scanner to identify vulnerabilities in web applications.",
    category: "Cybersecurity",
    techStack: ["Python", "Scapy", "Nmap", "SQLite"],
    apis: [],
    features: ["Port scanning", "Vulnerability detection", "Report generation", "Scheduled scans"],
    estimatedTime: "4-6 weeks",
    learningOutcomes: ["Network protocols", "Security testing", "Ethical hacking"]
  },
  {
    name: "Data Analysis Dashboard",
    difficulty: "Medium",
    skills: ["Python", "Pandas", "Visualization"],
    description: "Create an interactive dashboard to analyze and visualize large datasets.",
    category: "Data Science",
    techStack: ["Python", "Pandas", "Plotly", "Streamlit"],
    apis: [],
    features: ["Data upload", "Interactive charts", "Statistical analysis", "Export reports"],
    estimatedTime: "2-3 weeks",
    learningOutcomes: ["Data analysis", "Statistical methods", "Dashboard design"]
  }
];

const ProjectIdeas = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProjects, setGeneratedProjects] = useState<ProjectDetails[]>([]);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPro } = useSubscription();

  const generateProjects = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a topic to generate projects");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter sample projects based on query and category
    let filteredProjects = sampleProjects.filter(project => {
      const matchesQuery = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      
      return matchesQuery && matchesCategory;
    });
    
    // If no matches, show all projects in the category
    if (filteredProjects.length === 0) {
      filteredProjects = selectedCategory === "All" 
        ? sampleProjects 
        : sampleProjects.filter(p => p.category === selectedCategory);
    }
    
    setGeneratedProjects(filteredProjects);
    toast.success(`Generated ${filteredProjects.length} project ideas!`);
    
    setIsGenerating(false);
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
      {showUpgrade && (
        <UpgradePrompt 
          feature="100+ Project Ideas" 
          message="Upgrade to Pro for 100+ detailed project ideas with step-by-step tutorials!"
          onClose={() => setShowUpgrade(false)}
        />
      )}
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Rocket className="w-4 h-4" />
            <span>Project Generator</span>
          </div>
          <h2 className="section-title">Build Real-World Projects</h2>
          <p className="section-subtitle">
            Generate detailed project ideas with tech stack, APIs, and step-by-step guidance.
          </p>
          
          {/* Pro/Free indicator */}
          <div className="mt-4 flex justify-center">
            {isPro ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
                <Crown className="w-3 h-3" />
                <span>100+ Project Ideas</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 border border-border text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Sample Projects • Upgrade for 100+</span>
              </div>
            )}
          </div>
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
              Creating detailed project plans for "{searchQuery}"
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
